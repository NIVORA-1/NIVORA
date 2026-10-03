import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedMusicUser } from '@/lib/musicAuthHelper';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * GET /api/music/favorites
 * Returns all favorites for the authenticated user
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
    const favorites: any = await prisma.$queryRawUnsafe(
      `SELECT id, youtube_video_id as "videoId", title, channel_title as "channelTitle", 
              thumbnail_url as "thumbnailUrl", duration, created_at as "createdAt"
       FROM public.music_favorites
       WHERE user_id = $1::uuid
       ORDER BY created_at DESC`,
      authUser.userId
    );

    return NextResponse.json({ items: favorites || [] });
  } catch (error: any) {
    console.error('Error fetching favorites:', error);
    return NextResponse.json({ error: 'Failed to fetch favorites', items: [] }, { status: 500 });
  }
}

/**
 * POST /api/music/favorites
 * Toggles or adds favorite for the authenticated user
 */
export async function POST(request: NextRequest) {
  const authUser = await getAuthenticatedMusicUser();
  if (!authUser) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Sign in to save your music.' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { videoId, title, channelTitle, thumbnailUrl, duration, action } = body;

    if (!videoId || !title) {
      return NextResponse.json({ error: 'videoId and title are required' }, { status: 400 });
    }

    // Check if already in favorites
    const existing: any = await prisma.$queryRawUnsafe(
      `SELECT id FROM public.music_favorites WHERE user_id = $1::uuid AND youtube_video_id = $2 LIMIT 1`,
      authUser.userId,
      videoId
    );

    if (action === 'delete' || (action !== 'add' && existing && existing.length > 0)) {
      // Toggle off / remove
      await prisma.$executeRawUnsafe(
        `DELETE FROM public.music_favorites WHERE user_id = $1::uuid AND youtube_video_id = $2`,
        authUser.userId,
        videoId
      );
      return NextResponse.json({ favorited: false, videoId });
    }

    // Insert new favorite
    const inserted: any = await prisma.$queryRawUnsafe(
      `INSERT INTO public.music_favorites (id, user_id, youtube_video_id, title, channel_title, thumbnail_url, duration, created_at)
       VALUES (gen_random_uuid(), $1::uuid, $2, $3, $4, $5, $6, now())
       ON CONFLICT (user_id, youtube_video_id) DO NOTHING
       RETURNING id, youtube_video_id as "videoId", title, channel_title as "channelTitle", 
                 thumbnail_url as "thumbnailUrl", duration, created_at as "createdAt"`,
      authUser.userId,
      videoId,
      title,
      channelTitle || 'YouTube Artist',
      thumbnailUrl || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      duration || '3:30'
    );

    return NextResponse.json({
      favorited: true,
      item: inserted[0] || { videoId, title },
    });
  } catch (error: any) {
    console.error('Error modifying favorites:', error);
    return NextResponse.json({ error: 'Failed to update favorites' }, { status: 500 });
  }
}

/**
 * DELETE /api/music/favorites?videoId=<id>
 * Removes favorite by videoId
 */
export async function DELETE(request: NextRequest) {
  const authUser = await getAuthenticatedMusicUser();
  if (!authUser) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Sign in to save your music.' },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get('videoId');

    if (!videoId) {
      return NextResponse.json({ error: 'videoId is required' }, { status: 400 });
    }

    await prisma.$executeRawUnsafe(
      `DELETE FROM public.music_favorites WHERE user_id = $1::uuid AND youtube_video_id = $2`,
      authUser.userId,
      videoId
    );

    return NextResponse.json({ success: true, videoId, favorited: false });
  } catch (error: any) {
    console.error('Error deleting favorite:', error);
    return NextResponse.json({ error: 'Failed to delete favorite' }, { status: 500 });
  }
}
