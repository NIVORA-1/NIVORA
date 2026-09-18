import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

/**
 * Streaming Audio API Route for Nivora Local MP3 Audio
 * Streams audio directly from project's `music/` folder with HTTP 206 Partial Content support.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { file: string[] } }
) {
  try {
    const fileSegments = params.file;
    if (!fileSegments || fileSegments.length === 0) {
      return new NextResponse('File path not provided', { status: 400 });
    }

    // Resolve file path safely within project directory
    const relativePath = fileSegments.join('/');
    
    // Check in project's music directory first, then nivora-music, then public/audio
    const musicDir = path.join(process.cwd(), 'music');
    const nivoraMusicDir = path.join(process.cwd(), 'nivora-music');
    const publicMusicDir = path.join(process.cwd(), 'public', 'music');
    const publicAudioDir = path.join(process.cwd(), 'public', 'audio');
    
    let filePath = path.join(musicDir, relativePath);
    if (!fs.existsSync(filePath)) {
      filePath = path.join(nivoraMusicDir, relativePath);
    }
    if (!fs.existsSync(filePath)) {
      filePath = path.join(publicMusicDir, relativePath);
    }
    if (!fs.existsSync(filePath)) {
      filePath = path.join(publicAudioDir, relativePath);
    }

    if (!fs.existsSync(filePath)) {
      return new NextResponse('Audio file not found', { status: 404 });
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = request.headers.get('range');

    if (range) {
      // Parse Range header (e.g. "bytes=0-1000000")
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      if (start >= fileSize || end >= fileSize || start > end) {
        return new NextResponse('Requested range not satisfiable', {
          status: 416,
          headers: { 'Content-Range': `bytes */${fileSize}` },
        });
      }

      const chunkSize = end - start + 1;
      const fileStream = fs.createReadStream(filePath, { start, end });

      // Convert Node readable stream to Web ReadableStream
      const stream = new ReadableStream({
        start(controller) {
          fileStream.on('data', (chunk) => {
            controller.enqueue(chunk);
          });
          fileStream.on('end', () => {
            controller.close();
          });
          fileStream.on('error', (err) => {
            controller.error(err);
          });
        },
        cancel() {
          fileStream.destroy();
        },
      });

      return new NextResponse(stream, {
        status: 206,
        headers: {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunkSize.toString(),
          'Content-Type': 'audio/mpeg',
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    }

    // Full file response
    const fileStream = fs.createReadStream(filePath);
    const stream = new ReadableStream({
      start(controller) {
        fileStream.on('data', (chunk) => controller.enqueue(chunk));
        fileStream.on('end', () => controller.close());
        fileStream.on('error', (err) => controller.error(err));
      },
      cancel() {
        fileStream.destroy();
      },
    });

    return new NextResponse(stream, {
      status: 200,
      headers: {
        'Accept-Ranges': 'bytes',
        'Content-Length': fileSize.toString(),
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Audio streaming error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
