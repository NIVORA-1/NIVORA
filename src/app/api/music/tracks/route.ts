import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import prisma from '@/lib/prisma';
import { validateAudioUrl, validateCoverUrl } from '@/lib/audioUrlValidator';

export const dynamic = 'force-dynamic';

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function parseDurationSeconds(durationInput: any): number {
  if (typeof durationInput === 'number' && !isNaN(durationInput) && durationInput > 0) {
    return Math.round(durationInput);
  }
  if (typeof durationInput === 'string') {
    const trimmed = durationInput.trim();
    if (trimmed.includes(':')) {
      const [minStr, secStr] = trimmed.split(':');
      const min = parseInt(minStr, 10) || 0;
      const sec = parseInt(secStr, 10) || 0;
      return min * 60 + sec;
    }
    const parsedNum = parseFloat(trimmed);
    if (!isNaN(parsedNum) && parsedNum > 0) {
      return Math.round(parsedNum);
    }
  }
  return 180; // default 3 mins
}

/**
 * GET /api/music/tracks
 * Returns all custom & library music tracks with external HTTPS audio URLs
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
      coverUrl: t.artworkUrl,
    }));

    // Read seeded library.json if available
    const libraryPath = path.join(process.cwd(), 'nivora-music', 'library.json');
    let libraryTracks: any[] = [];

    if (fs.existsSync(libraryPath)) {
      try {
        const raw = fs.readFileSync(libraryPath, 'utf8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const mapped = parsed.map((item) => {
            const audioUrl = item.audioUrl || (item.audio && item.audio.startsWith('http') ? item.audio : '');
            const durationSec = item.durationSec || item.duration || 180;
            return {
              id: item.id,
              title: item.title,
              artist: item.artist,
              album: item.album || (item.category ? `${item.category} Sessions` : 'Nivora Music'),
              genre: item.genre || item.category || 'Focus',
              category: (item.category || 'focus').toLowerCase(),
              duration: formatDuration(durationSec),
              durationSec,
              audioUrl,
              artworkUrl: item.artwork || item.coverUrl || null,
              coverUrl: item.artwork || item.coverUrl || null,
              source: item.source || 'External CDN Stream',
              sourceUrl: item.sourceUrl,
              license: item.license,
              licenseUrl: item.licenseUrl,
              createdAt: item.downloadedAt || new Date().toISOString(),
            };
          });

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
 * Creates one or more tracks using validated external HTTPS audio URLs
 */
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';

    // 1. JSON Payload Handler (Target Architecture for External Audio URLs)
    if (contentType.includes('application/json')) {
      const body = await request.json();
      const items: any[] = Array.isArray(body) ? body : body.tracks ? body.tracks : [body];

      if (items.length === 0) {
        return NextResponse.json({ success: false, error: 'No track data provided' }, { status: 400 });
      }

      const createdTracks = [];
      const validationErrors: { title?: string; error: string }[] = [];

      for (const item of items) {
        const rawTitle = item.title ? String(item.title).trim() : '';
        const rawAudioUrl = item.audioUrl ? String(item.audioUrl).trim() : '';

        if (!rawTitle) {
          validationErrors.push({ error: 'Track title is required.' });
          continue;
        }

        // Validate Audio URL
        const audioValidation = validateAudioUrl(rawAudioUrl);
        if (!audioValidation.isValid || !audioValidation.cleanUrl) {
          validationErrors.push({
            title: rawTitle,
            error: audioValidation.error || 'Invalid HTTPS audio URL.',
          });
          continue;
        }

        // Validate Cover URL if provided
        const rawCoverUrl = item.coverUrl || item.artworkUrl || null;
        let cleanCoverUrl: string | null = null;
        if (rawCoverUrl) {
          const coverValidation = validateCoverUrl(rawCoverUrl);
          if (!coverValidation.isValid) {
            validationErrors.push({
              title: rawTitle,
              error: coverValidation.error || 'Invalid cover image URL.',
            });
            continue;
          }
          cleanCoverUrl = coverValidation.cleanUrl || null;
        }

        const durationSec = parseDurationSeconds(item.duration || item.durationSec);
        const durationFormatted = formatDuration(durationSec);
        const artist = item.artist ? String(item.artist).trim() : 'Nivora Sounds';
        const album = item.album ? String(item.album).trim() : 'Nivora Music';
        const genre = item.genre ? String(item.genre).trim() : 'Focus';
        const category = (item.category ? String(item.category).trim() : 'focus').toLowerCase();

        const trackId = item.id && typeof item.id === 'string' && item.id.trim()
          ? item.id.trim()
          : `track-ext-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

        const savedTrack = await prisma.musicTrack.upsert({
          where: { id: trackId },
          update: {
            title: rawTitle,
            artist,
            album,
            genre,
            category,
            duration: durationFormatted,
            durationSec,
            audioUrl: audioValidation.cleanUrl,
            artworkUrl: cleanCoverUrl,
          },
          create: {
            id: trackId,
            title: rawTitle,
            subtitle: artist,
            artist,
            album,
            genre,
            category,
            duration: durationFormatted,
            durationSec,
            audioUrl: audioValidation.cleanUrl,
            artworkUrl: cleanCoverUrl,
          },
        });

        createdTracks.push({
          ...savedTrack,
          coverUrl: savedTrack.artworkUrl,
          fileSizeBytes: savedTrack.fileSizeBytes ? savedTrack.fileSizeBytes.toString() : null,
        });
      }

      if (createdTracks.length === 0 && validationErrors.length > 0) {
        return NextResponse.json(
          {
            success: false,
            error: validationErrors[0].error,
            validationErrors,
          },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        tracks: createdTracks,
        track: createdTracks[0],
        createdCount: createdTracks.length,
        errors: validationErrors,
      });
    }

    // 2. Reject legacy multipart upload for local MP3 files per Step 6
    return NextResponse.json(
      {
        success: false,
        error: 'Binary audio upload is disabled. Please provide external HTTPS audio URLs as JSON: { title, artist, album, genre, audioUrl, coverUrl, duration }.',
      },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Music track creation API error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/music/tracks
 * Deletes one or multiple tracks by ID from database
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const singleId = searchParams.get('id');

    let idsToDelete: string[] = [];
    if (singleId) {
      idsToDelete = [singleId];
    } else {
      const body = await request.json().catch(() => ({}));
      idsToDelete = body.ids || [];
    }

    if (idsToDelete.length === 0) {
      return NextResponse.json({ success: false, error: 'No track IDs provided' }, { status: 400 });
    }

    const deleteResult = await prisma.musicTrack.deleteMany({
      where: { id: { in: idsToDelete } },
    });

    return NextResponse.json({
      success: true,
      deletedCount: deleteResult.count,
    });
  } catch (error: any) {
    console.error('Delete tracks API failed:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to delete tracks' }, { status: 500 });
  }
}

/**
 * PATCH /api/music/tracks
 * Bulk category update or metadata modifications
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids, category } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ success: false, error: 'IDs array is required' }, { status: 400 });
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
    return NextResponse.json({ success: false, error: error.message || 'Failed to update tracks' }, { status: 500 });
  }
}
