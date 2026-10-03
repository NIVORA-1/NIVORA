import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedMusicUser } from '@/lib/musicAuthHelper';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: { id: string };
}

/**
 * GET /api/music/playlists/[id]
 * Returns playlist with all items
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  const authUser = await getAuthenticatedMusicUser();
  if (!authUser) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Sign in to save your music.' },
      { status: 401 }
    );
  }

  try {
    const playlistId = params.id;

    // Fetch playlist (verifying ownership)
    const playlists: any = await prisma.$queryRawUnsafe(
      `SELECT id, name, description, created_at as "createdAt"
       FROM public.music_playlists
       WHERE id = $1::uuid AND user_id = $2::uuid
       LIMIT 1`,
      playlistId,
      authUser.userId
    );

    if (!playlists || playlists.length === 0) {
      return NextResponse.json({ error: 'Playlist not found' }, { status: 404 });
    }

    const playlist = playlists[0];

    // Fetch items
    const items: any = await prisma.$queryRawUnsafe(
      `SELECT id, youtube_video_id as "videoId", title, channel_title as "channelTitle", 
              thumbnail_url as "thumbnailUrl", duration, position, created_at as "createdAt"
       FROM public.music_playlist_items
       WHERE playlist_id = $1::uuid
       ORDER BY position ASC, created_at ASC`,
      playlistId
    );

    return NextResponse.json({
      playlist: {
        ...playlist,
        trackCount: items.length,
        artwork: items[0]?.thumbnailUrl || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80',
        items,
      },
    });
  } catch (error: any) {
    console.error('Error fetching playlist detail:', error);
    return NextResponse.json({ error: 'Failed to fetch playlist' }, { status: 500 });
  }
}

/**
 * PATCH /api/music/playlists/[id]
 * Updates playlist name and/or description
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
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
    const name = body.name ? body.name.trim() : undefined;
    const description = body.description !== undefined ? body.description.trim() : undefined;

    const updated: any = await prisma.$queryRawUnsafe(
      `UPDATE public.music_playlists
       SET name = COALESCE($1, name),
           description = COALESCE($2, description)
       WHERE id = $3::uuid AND user_id = $4::uuid
       RETURNING id, name, description, created_at as "createdAt"`,
      name,
      description,
      playlistId,
      authUser.userId
    );

    if (!updated || updated.length === 0) {
      return NextResponse.json({ error: 'Playlist not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({ playlist: updated[0] });
  } catch (error: any) {
    console.error('Error updating playlist:', error);
    return NextResponse.json({ error: 'Failed to update playlist' }, { status: 500 });
  }
}

/**
 * DELETE /api/music/playlists/[id]
 * Deletes playlist and cascaded items
 */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const authUser = await getAuthenticatedMusicUser();
  if (!authUser) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Sign in to save your music.' },
      { status: 401 }
    );
  }

  try {
    const playlistId = params.id;

    await prisma.$executeRawUnsafe(
      `DELETE FROM public.music_playlists WHERE id = $1::uuid AND user_id = $2::uuid`,
      playlistId,
      authUser.userId
    );

    return NextResponse.json({ success: true, id: playlistId });
  } catch (error: any) {
    console.error('Error deleting playlist:', error);
    return NextResponse.json({ error: 'Failed to delete playlist' }, { status: 500 });
  }
}
