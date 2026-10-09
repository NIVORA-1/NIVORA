import os
import math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance
import subprocess
import imageio_ffmpeg

def create_hero_video():
    base_img_path = r'public/assets/nivora-hero-poster.jpg'
    output_mp4 = r'public/assets/nivora-hero-scrub.mp4'
    output_webm = r'public/assets/nivora-hero-scrub.webm'
    
    img = Image.open(base_img_path).convert('RGB')
    orig_w, orig_h = img.size
    
    fps = 30
    duration = 8.0
    total_frames = int(fps * duration) # 240 frames
    target_w, target_h = 1280, 720
    
    ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
    print(f"Using FFmpeg: {ffmpeg_exe}")
    print(f"Rendering {total_frames} frames ({duration}s at {fps} fps)...")
    
    # We will pipe raw RGB frames to FFmpeg
    # MP4 command with GOP=1 (every frame is keyframe) for ultra-fast scrubbing
    cmd_mp4 = [
        ffmpeg_exe,
        '-y',
        '-f', 'rawvideo',
        '-vcodec', 'rawvideo',
        '-s', f'{target_w}x{target_h}',
        '-pix_fmt', 'rgb24',
        '-r', str(fps),
        '-i', '-',
        '-c:v', 'libx264',
        '-pix_fmt', 'yuv420p',
        '-preset', 'fast',
        '-crf', '18',
        '-g', '1',
        '-keyint_min', '1',
        '-movflags', '+faststart',
        output_mp4
    ]
    
    proc_mp4 = subprocess.Popen(cmd_mp4, stdin=subprocess.PIPE)
    
    # Pre-generate some random particles for parallax
    np.random.seed(42)
    num_particles = 120
    particles = []
    for _ in range(num_particles):
        particles.append({
            'x': np.random.uniform(0, 1),
            'y': np.random.uniform(0, 1),
            'z': np.random.uniform(0.5, 2.5),
            'radius': np.random.uniform(1.0, 3.5),
            'alpha': np.random.uniform(80, 220),
            'color': (232, 90, 79) if np.random.rand() > 0.4 else (216, 195, 165)
        })

    # Prepare base image array
    base_np = np.array(img, dtype=np.float32)
    
    for f in range(total_frames):
        t = f / fps # time from 0.0 to 7.967
        progress = t / duration # 0.0 to 1.0
        
        # Smooth camera movement (pan, zoom, tilt)
        # S-curve ease
        ease_p = 0.5 - 0.5 * math.cos(progress * math.pi)
        
        # Cinematic camera trajectory:
        # Starts slightly wide, gently swoops inward toward the glowing nexus core,
        # slight lateral drift, depth breathing
        zoom = 1.0 + 0.28 * math.sin(ease_p * math.pi * 0.9) + 0.08 * ease_p
        pan_x = 0.04 * math.sin(ease_p * 2.0 * math.pi)
        pan_y = -0.03 * math.sin(ease_p * math.pi)
        rot_deg = 1.8 * math.sin(ease_p * math.pi)
        
        # Calculate crop rectangle
        crop_w = orig_w / zoom
        crop_h = orig_h / zoom
        
        center_x = (orig_w / 2.0) + pan_x * orig_w
        center_y = (orig_h / 2.0) + pan_y * orig_h
        
        left = max(0, min(orig_w - crop_w, center_x - crop_w / 2.0))
        top = max(0, min(orig_h - crop_h, center_y - crop_h / 2.0))
        right = left + crop_w
        bottom = top + crop_h
        
        cropped = img.crop((int(left), int(top), int(right), int(bottom)))
        if rot_deg != 0:
            cropped = cropped.rotate(rot_deg, resample=Image.Resampling.BICUBIC)
            
        frame_img = cropped.resize((target_w, target_h), Image.Resampling.LANCZOS)
        
        # Add dynamic orbital light pulse passing along the rings
        # Draw on an overlay
        overlay = Image.new('RGBA', (target_w, target_h), (0, 0, 0, 0))
        draw = ImageDraw.Draw(overlay)
        
        # Core center in target coords
        cx = target_w * 0.48 + pan_x * target_w * 0.5
        cy = target_h * 0.49 + pan_y * target_h * 0.5
        
        # Orbit pulse angle moves 360 degrees over 8 seconds
        angle = (progress * 2.5 * math.pi) - 0.5
        pulse_r = (target_w * 0.28) * (1.0 + 0.1 * math.sin(progress * 4 * math.pi))
        
        # Orbital beacon light
        bx = cx + pulse_r * math.cos(angle)
        by = cy + pulse_r * 0.38 * math.sin(angle)
        
        # Draw glowing beacon & particle trail
        draw.ellipse([bx - 12, by - 6, bx + 12, by + 6], fill=(232, 90, 79, 140))
        draw.ellipse([bx - 6, by - 3, bx + 6, by + 3], fill=(255, 230, 210, 220))
        
        # Secondary counter-orbit beacon
        angle2 = -angle * 0.8 + 1.2
        pulse_r2 = target_w * 0.38
        b2x = cx + pulse_r2 * math.cos(angle2)
        b2y = cy + pulse_r2 * 0.42 * math.sin(angle2)
        draw.ellipse([b2x - 8, by - 4, b2x + 8, by + 4], fill=(216, 195, 165, 120))
        draw.ellipse([b2x - 3, by - 2, b2x + 3, by + 2], fill=(255, 255, 255, 190))
        
        # Floating 3D parallax stardust particles
        for p in particles:
            px = ((p['x'] + progress * 0.08 * p['z'] + pan_x * p['z']) % 1.0) * target_w
            py = ((p['y'] + progress * 0.04 * p['z'] + pan_y * p['z']) % 1.0) * target_h
            pr = p['radius'] * (0.8 + 0.4 * math.sin(progress * math.pi * 3 + p['z']))
            pa = int(p['alpha'] * (0.6 + 0.4 * math.sin(progress * math.pi * 2 + p['x'] * 10)))
            r, g, b = p['color']
            draw.ellipse([px - pr, py - pr, px + pr, py + pr], fill=(r, g, b, pa))
            
        # Composite overlay
        frame_rgba = frame_img.convert('RGBA')
        composite = Image.alpha_composite(frame_rgba, overlay).convert('RGB')
        
        # Subtle contrast and exposure curve over time
        enhancer = ImageEnhance.Brightness(composite)
        lum = 0.96 + 0.08 * math.sin(ease_p * math.pi)
        final_frame = enhancer.enhance(lum)
        
        # Pipe frame bytes
        proc_mp4.stdin.write(final_frame.tobytes())
        
        if (f + 1) % 30 == 0:
            print(f"Rendered {f + 1}/{total_frames} frames ({(f+1)/fps:.1f}s)...")
            
    proc_mp4.stdin.close()
    proc_mp4.wait()
    print("MP4 render complete!")
    
    # Create WebM using the generated MP4
    print("Converting to WebM...")
    cmd_webm = [
        ffmpeg_exe,
        '-y',
        '-i', output_mp4,
        '-c:v', 'libvpx-vp9',
        '-b:v', '0',
        '-crf', '28',
        '-g', '1',
        output_webm
    ]
    subprocess.run(cmd_webm, check=True)
    print("WebM render complete!")
    print(f"Generated video files:\n  {output_mp4}\n  {output_webm}")

if __name__ == '__main__':
    create_hero_video()
