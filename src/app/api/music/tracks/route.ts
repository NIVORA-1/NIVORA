import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import prisma from '@/lib/prisma';
import { storeAudioFile, deleteAudioFile } from '@/lib/audioStorage';

export const dynamic = 'force-dynamic';

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * GET /api/music/tracks
 * Returns all custom & imported music tracks from PostgreSQL database
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const query = searchParams.get('q')?.toLowerCase().trim();

    const where: any = {};
    if (category && category !== 'all') {
      where.category = category;
    }
    if (query) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { artist: { contains: query, mode: 'insensitive' } },
        { album: { contains: query, mode: 'insensitive' } },
        { genre: { contains: query, mode: 'insensitive' } },
      ];
    }

    const rawTracks = await prisma.musicTrack.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    const dbTracks = rawTracks.map((t) => ({
      ...t,
      fileSizeBytes: t.fileSizeBytes ? t.fileSizeBytes.toString() : null,
    }));

    // Read seeded library.json if available
    const libraryPath = path.join(process.cwd(), 'nivora-music', 'library.json');
    let libraryTracks: any[] = [];

    if (fs.existsSync(libraryPath)) {
      try {
        const raw = fs.readFileSync(libraryPath, 'utf8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const mapped = parsed.map((item) => ({
            id: item.id,
            title: item.title,
            artist: item.artist,
            album: item.category ? `${item.category} Sessions` : 'Nivora Music',
            genre: item.category || 'Focus',
            category: (item.category || 'focus').toLowerCase(),
            duration: formatDuration(item.duration || 180),
            durationSec: item.duration || 180,
            audioUrl: item.audio,
            artworkUrl: item.artwork || null,
            fileName: path.basename(item.audio),
            fileSize: item.fileSizeBytes ? formatFileSize(item.fileSizeBytes) : '3.5 MB',
            fileSizeBytes: item.fileSizeBytes ? item.fileSizeBytes.toString() : null,
            source: item.source,
            sourceUrl: item.sourceUrl,
            license: item.license,
            licenseUrl: item.licenseUrl,
            downloadedAt: item.downloadedAt,
            createdAt: item.downloadedAt || new Date().toISOString(),
          }));

          libraryTracks = mapped;
        }
      } catch (e) {
        console.warn('Could not read nivora-music/library.json:', e);
      }
    }

    // Apply category & query filters to library tracks
    if (category && category !== 'all') {
      libraryTracks = libraryTracks.filter((t) => t.category === category.toLowerCase());
    }
    if (query) {
      libraryTracks = libraryTracks.filter(
        (t) =>
          t.title.toLowerCase().includes(query) ||
          t.artist.toLowerCase().includes(query) ||
          t.genre.toLowerCase().includes(query)
      );
    }

    // Combine database tracks and library tracks, deduplicating by ID and audioUrl
    const trackMap = new Map<string, any>();
    dbTracks.forEach((t) => trackMap.set(t.id, t));
    libraryTracks.forEach((t) => {
      if (!trackMap.has(t.id)) {
        trackMap.set(t.id, t);
      }
    });

    const combinedTracks = Array.from(trackMap.values());

    return NextResponse.json({ success: true, tracks: combinedTracks });
  } catch (error) {
    console.error('Failed to fetch music tracks:', error);
    return NextResponse.json({ success: false, error: 'Database query failed' }, { status: 500 });
  }
}

/**
 * POST /api/music/tracks
 * Handles bulk upload of multiple audio files with metadata
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const metadataRaw = formData.get('metadata') as string | null;

    if (!metadataRaw) {
      return NextResponse.json({ error: 'Metadata payload is required' }, { status: 400 });
    }

    const parsedMetadata = JSON.parse(metadataRaw);
    const metadataList: any[] = Array.isArray(parsedMetadata) ? parsedMetadata : [parsedMetadata];
    if (metadataList.length === 0) {
      return NextResponse.json({ error: 'No tracks to import' }, { status: 400 });
    }

    const results: any[] = [];
    const errors: { fileName: string; error: string }[] = [];
    let skippedCount = 0;

    for (let i = 0; i < metadataList.length; i++) {
      const meta = metadataList[i];
      const audioFile = (formData.get(`file_${i}`) || formData.get('file')) as File | null;
      const artworkFile = (formData.get(`artwork_${i}`) || formData.get('artwork')) as File | null;

      if (!audioFile) {
        errors.push({ fileName: meta.fileName || `Track ${i + 1}`, error: 'Audio file missing from payload' });
        continue;
      }

      try {
        // 1. Check duplicate detection
        const existingTrack = await prisma.musicTrack.findFirst({
          where: {
            OR: [
              meta.fileHash ? { fileHash: meta.fileHash } : {},
              { fileName: audioFile.name },
              {
                title: meta.title,
                artist: meta.artist,
              },
            ].filter((condition) => Object.keys(condition).length > 0),
          },
        });

        if (existingTrack) {
          if (meta.duplicateResolution === 'skip') {
            skippedCount++;
            continue;
          } else if (meta.duplicateResolution === 'replace') {
            // Delete previous storage files if replacing
            await deleteAudioFile(existingTrack.audioUrl, existingTrack.artworkUrl);
          }
        }

        // 2. Read audio buffer
        const arrayBuffer = await audioFile.arrayBuffer();
        const fileBuffer = Buffer.from(arrayBuffer);

        // Read optional embedded artwork buffer
        let artworkBuffer: Buffer | null = null;
        if (artworkFile) {
          const artArray = await artworkFile.arrayBuffer();
          artworkBuffer = Buffer.from(artArray);
        }

        const trackId = existingTrack && meta.duplicateResolution === 'replace'
          ? existingTrack.id
          : `track-import-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

        // 3. Store file into storage engine (Supabase or Local streaming)
        const storageResult = await storeAudioFile({
          trackId,
          fileBuffer,
          fileName: audioFile.name,
          mimeType: audioFile.type || 'audio/mpeg',
          artworkBuffer,
        });

        const durationSec = Math.round(meta.duration || 180);
        const durationFormatted = formatDuration(durationSec);
        const formattedSize = formatFileSize(audioFile.size);

        // 4. Save/Update record in PostgreSQL database
        const savedTrack = await prisma.musicTrack.upsert({
          where: { id: trackId },
          update: {
            title: meta.title || audioFile.name,
            artist: meta.artist || 'Nivora Sounds',
            album: meta.album || 'Nivora Music',
            genre: meta.genre || 'Focus',
            category: meta.category || 'focus',
            duration: durationFormatted,
            durationSec,
            audioUrl: storageResult.audioUrl,
            artworkUrl: storageResult.artworkUrl || meta.artworkUrl || null,
            fileName: audioFile.name,
            fileSize: formattedSize,
            fileSizeBytes: BigInt(audioFile.size),
            fileHash: meta.fileHash || null,
            mimeType: audioFile.type || 'audio/mpeg',
          },
          create: {
            id: trackId,
            title: meta.title || audioFile.name,
            subtitle: meta.artist || 'Nivora Sounds',
            artist: meta.artist || 'Nivora Sounds',
            album: meta.album || 'Nivora Music',
            genre: meta.genre || 'Focus',
            category: meta.category || 'focus',
            duration: durationFormatted,
            durationSec,
            audioUrl: storageResult.audioUrl,
            artworkUrl: storageResult.artworkUrl || meta.artworkUrl || null,
            fileName: audioFile.name,
            fileSize: formattedSize,
            fileSizeBytes: BigInt(audioFile.size),
            fileHash: meta.fileHash || null,
            mimeType: audioFile.type || 'audio/mpeg',
          },
        });

        results.push({
          ...savedTrack,
          fileSizeBytes: savedTrack.fileSizeBytes?.toString(),
        });
      } catch (trackError: any) {
        console.error(`Failed to import track ${meta.fileName}:`, trackError);
        errors.push({
          fileName: meta.fileName || audioFile.name,
          error: trackError.message || 'Storage write failed',
        });
      }
    }

    return NextResponse.json({
      success: true,
      importedTracks: results,
      importedCount: results.length,
      skippedCount,
      failedCount: errors.length,
      errors,
    });
  } catch (error: any) {
    console.error('Bulk music import endpoint failed:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/music/tracks
 * Deletes one or multiple tracks by ID
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const singleId = searchParams.get('id');

    let idsToDelete: string[] = [];
    if (singleId) {
      idsToDelete = [singleId];
    } else {
      const body = await request.json();
      idsToDelete = body.ids || [];
    }

    if (idsToDelete.length === 0) {
      return NextResponse.json({ error: 'No track IDs provided' }, { status: 400 });
    }

    // Find tracks to clean up their storage files
    const tracksToDelete = await prisma.musicTrack.findMany({
      where: { id: { in: idsToDelete } },
    });

    for (const t of tracksToDelete) {
      await deleteAudioFile(t.audioUrl, t.artworkUrl);
    }

    // Delete database records
    const deleteResult = await prisma.musicTrack.deleteMany({
      where: { id: { in: idsToDelete } },
    });

    return NextResponse.json({
      success: true,
      deletedCount: deleteResult.count,
    });
  } catch (error: any) {
    console.error('Delete tracks API failed:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete tracks' }, { status: 500 });
  }
}

/**
 * PATCH /api/music/tracks
 * Bulk category update or metadata modifications
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids, category, playlistId } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'IDs array is required' }, { status: 400 });
    }

    if (category) {
      const updateResult = await prisma.musicTrack.updateMany({
        where: { id: { in: ids } },
        data: { category },
      });

      return NextResponse.json({
        success: true,
        updatedCount: updateResult.count,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Update tracks API failed:', error);
    return NextResponse.json({ error: error.message || 'Failed to update tracks' }, { status: 500 });
  }
}
