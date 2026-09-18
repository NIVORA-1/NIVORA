import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

/**
 * HTTP 206 Partial Content Audio Streaming Route for /music/<category>/<filename>
 * Serves downloaded tracks from nivora-music/ and public/music/ with byte-range seeking.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string[] } }
) {
  try {
    const slug = params.slug;
    if (!slug || slug.length === 0) {
      return new NextResponse('File path not provided', { status: 400 });
    }

    const relativePath = slug.join('/');
    const cwd = process.cwd();

    // Check nivora-music, public/music, and music directories
    const candidatePaths = [
      path.join(cwd, 'nivora-music', relativePath),
      path.join(cwd, 'public', 'music', relativePath),
      path.join(cwd, 'music', relativePath),
      path.join(cwd, 'public', 'audio', relativePath),
    ];

    let targetFilePath = '';
    for (const p of candidatePaths) {
      if (fs.existsSync(p) && fs.statSync(p).isFile()) {
        targetFilePath = p;
        break;
      }
    }

    if (!targetFilePath) {
      return new NextResponse('Audio file not found', { status: 404 });
    }

    const stat = fs.statSync(targetFilePath);
    const fileSize = stat.size;
    const range = request.headers.get('range');

    // Detect MIME type based on extension
    const ext = path.extname(targetFilePath).toLowerCase();
    const mimeType =
      ext === '.wav'
        ? 'audio/wav'
        : ext === '.ogg'
        ? 'audio/ogg'
        : ext === '.m4a'
        ? 'audio/mp4'
        : 'audio/mpeg';

    if (range) {
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
      const fileStream = fs.createReadStream(targetFilePath, { start, end });

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
        status: 206,
        headers: {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunkSize.toString(),
          'Content-Type': mimeType,
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    }

    // Full file stream response
    const fileStream = fs.createReadStream(targetFilePath);
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
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error: any) {
    console.error('Audio stream handler error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
