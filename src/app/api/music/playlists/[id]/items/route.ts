import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedMusicUser } from '@/lib/musicAuthHelper';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: { id: string };
}

/**
 * POST /api/music/playlists/[id]/items
 * Adds a song to the user's playlist
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  const authUser = await getAuthenticatedMusicUser();
  if (!authUser) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Sign in to save your music.' },
      { status: 401 }
    );
  }

  try {
    const playlistId = params.id;
    const body = await request.json();
    const { videoId, title, channelTitle, thumbnailUrl, duration } = body;

    if (!videoId || !title) {
      return NextResponse.json({ error: 'videoId and title are required' }, { status: 400 });
    }

    // Verify user owns the playlist
    const ownerCheck: any = await prisma.$queryRawUnsafe(
      `SELECT id FROM public.music_playlists WHERE id = $1::uuid AND user_id = $2::uuid LIMIT 1`,
      playlistId,
      authUser.userId
    );

    if (!ownerCheck || ownerCheck.length === 0) {
      return NextResponse.json({ error: 'Playlist not found or unauthorized' }, { status: 404 });
    }

    // Determine max position
    const posRes: any = await prisma.$queryRawUnsafe(
      `SELECT COALESCE(MAX(position), 0) as "maxPos" FROM public.music_playlist_items WHERE playlist_id = $1::uuid`,
      playlistId
    );
    const nextPos = (posRes[0]?.maxPos || 0) + 1;

    // Insert item
    const inserted: any = await prisma.$queryRawUnsafe(
      `INSERT INTO public.music_playlist_items (id, playlist_id, youtube_video_id, title, channel_title, thumbnail_url, duration, position, created_at)
       VALUES (gen_random_uuid(), $1::uuid, $2, $3, $4, $5, $6, $7, now())
       RETURNING id, youtube_video_id as "videoId", title, channel_title as "channelTitle", 
                 thumbnail_url as "thumbnailUrl", duration, position, created_at as "createdAt"`,
      playlistId,
      videoId,
      title,
      channelTitle || 'YouTube Artist',
      thumbnailUrl || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      duration || '3:30',
      nextPos
    );

    return NextResponse.json({ item: inserted[0] });
  } catch (error: any) {
    console.error('Error adding track to playlist:', error);
    return NextResponse.json({ error: 'Failed to add track to playlist' }, { status: 500 });
  }
}

/**
 * DELETE /api/music/playlists/[id]/items?videoId=<id>&itemId=<id>
 * Removes a song from the user's playlist
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const authUser = await getAuthenticatedMusicUser();
  if (!authUser) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Sign in to save your music.' },
      { status: 401 }
    );
  }

  try {
    const playlistId = params.id;
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get('videoId');
    const itemId = searchParams.get('itemId');

    // Verify user owns the playlist
    const ownerCheck: any = await prisma.$queryRawUnsafe(
      `SELECT id FROM public.music_playlists WHERE id = $1::uuid AND user_id = $2::uuid LIMIT 1`,
      playlistId,
      authUser.userId
    );

    if (!ownerCheck || ownerCheck.length === 0) {
      return NextResponse.json({ error: 'Playlist not found or unauthorized' }, { status: 404 });
    }

    if (itemId) {
      await prisma.$executeRawUnsafe(
        `DELETE FROM public.music_playlist_items WHERE playlist_id = $1::uuid AND id = $2::uuid`,
        playlistId,
        itemId
      );
    } else if (videoId) {
      await prisma.$executeRawUnsafe(
        `DELETE FROM public.music_playlist_items WHERE playlist_id = $1::uuid AND youtube_video_id = $2`,
        playlistId,
        videoId
      );
    } else {
      return NextResponse.json({ error: 'itemId or videoId required' }, { status: 400 });
    }

    return NextResponse.json({ success: true, playlistId, videoId, itemId });
  } catch (error: any) {
    console.error('Error removing track from playlist:', error);
    return NextResponse.json({ error: 'Failed to remove track from playlist' }, { status: 500 });
  }
}
