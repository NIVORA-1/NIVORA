import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';
import { isValidAudioFile } from './validator';

const USER_AGENT = 'NivoraStudentOS-MusicSeeder/1.0 (Student Operating System; Educational; contact@nivora.app)';

/**
 * Downloads a remote audio URL to destination file path with retry logic and file validation
 */
export async function downloadFile(
  url: string,
  destinationPath: string,
  maxRetries: number = 2
): Promise<{ success: boolean; bytesWritten: number; error?: string }> {
  const dir = path.dirname(destinationPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const tempPath = `${destinationPath}.tmp-${Date.now()}`;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 35000);

      const res = await fetch(url, {
        headers: {
          'User-Agent': USER_AGENT,
          'Accept': 'audio/*,*/*;q=0.8',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok || !res.body) {
        throw new Error(`Server responded with HTTP ${res.status} ${res.statusText}`);
      }

      // Stream to temp file
      const fileStream = fs.createWriteStream(tempPath);
      const webStream = Readable.fromWeb(res.body as any);

      await new Promise<void>((resolve, reject) => {
        webStream.pipe(fileStream);
        fileStream.on('finish', () => resolve());
        fileStream.on('error', (err) => reject(err));
        webStream.on('error', (err) => reject(err));
      });

      const stat = fs.statSync(tempPath);

      // Verify file integrity
      if (isValidAudioFile(tempPath)) {
        if (fs.existsSync(destinationPath)) {
          fs.unlinkSync(destinationPath);
        }
        fs.renameSync(tempPath, destinationPath);
        return { success: true, bytesWritten: stat.size };
      } else {
        throw new Error(`File validation failed (size: ${stat.size} bytes, invalid header)`);
      }
    } catch (err: any) {
      if (fs.existsSync(tempPath)) {
        try {
          fs.unlinkSync(tempPath);
        } catch {}
      }

      if (attempt < maxRetries) {
        const delay = (attempt + 1) * 1200;
        await new Promise((res) => setTimeout(res, delay));
      } else {
        return { success: false, bytesWritten: 0, error: err.message || 'Download failed' };
      }
    }
  }

  return { success: false, bytesWritten: 0, error: 'Max retries exceeded' };
}
