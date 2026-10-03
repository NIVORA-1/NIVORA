import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedMusicUser } from '@/lib/musicAuthHelper';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * GET /api/music/recently-played
 * Returns up to 20 recently played tracks for the authenticated user
 */
export async function GET() {
  const authUser = await getAuthenticatedMusicUser();
  if (!authUser) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Sign in to save your music.', items: [] },
      { status: 401 }
    );
  }

  try {
    const history: any = await prisma.$queryRawUnsafe(
      `SELECT id, youtube_video_id as "videoId", title, channel_title as "channelTitle", 
              thumbnail_url as "thumbnailUrl", duration, played_at as "playedAt"
       FROM public.music_recently_played
       WHERE user_id = $1::uuid
       ORDER BY played_at DESC
       LIMIT 20`,
      authUser.userId
    );

    return NextResponse.json({ items: history || [] });
  } catch (error: any) {
    console.error('Error fetching recently played tracks:', error);
    return NextResponse.json({ error: 'Failed to fetch history', items: [] }, { status: 500 });
  }
}

/**
 * POST /api/music/recently-played
 * Records a track play. Updates played_at if already exists, and trims history to 20 tracks.
 */
export async function POST(request: NextRequest) {
  const authUser = await getAuthenticatedMusicUser();
  if (!authUser) {
    // Graceful: Unauthenticated user can play music, simply skip saving history without crashing
    return NextResponse.json({ saved: false, message: 'Unauthenticated' }, { status: 200 });
  }

  try {
    const body = await request.json();
    const { videoId, title, channelTitle, thumbnailUrl, duration } = body;

    if (!videoId || !title) {
      return NextResponse.json({ error: 'videoId and title are required' }, { status: 400 });
    }

    // Upsert track into music_recently_played
    await prisma.$executeRawUnsafe(
      `INSERT INTO public.music_recently_played (id, user_id, youtube_video_id, title, channel_title, thumbnail_url, duration, played_at)
       VALUES (gen_random_uuid(), $1::uuid, $2, $3, $4, $5, $6, now())
       ON CONFLICT (user_id, youtube_video_id) 
       DO UPDATE SET 
         played_at = now(),
         title = EXCLUDED.title,
         channel_title = EXCLUDED.channel_title,
         thumbnail_url = EXCLUDED.thumbnail_url,
         duration = EXCLUDED.duration`,
      authUser.userId,
      videoId,
      title,
      channelTitle || 'YouTube Artist',
      thumbnailUrl || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      duration || '3:30'
    );

    // Prune user history beyond the latest 20 tracks
    await prisma.$executeRawUnsafe(
      `DELETE FROM public.music_recently_played
       WHERE user_id = $1::uuid
         AND id NOT IN (
           SELECT id FROM public.music_recently_played
           WHERE user_id = $1::uuid
           ORDER BY played_at DESC
           LIMIT 20
         )`,
      authUser.userId
    );

    return NextResponse.json({ saved: true, videoId });
  } catch (error: any) {
    console.error('Error recording recently played:', error);
    return NextResponse.json({ error: 'Failed to record playback' }, { status: 500 });
  }
}
