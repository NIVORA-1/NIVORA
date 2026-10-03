import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedMusicUser } from '@/lib/musicAuthHelper';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * GET /api/music/playlists
 * Returns all playlists created by the authenticated user with item count & cover
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
    const playlists: any = await prisma.$queryRawUnsafe(
      `SELECT p.id, p.name, p.description, p.created_at as "createdAt",
              COUNT(i.id)::int as "trackCount",
              (
                SELECT i2.thumbnail_url 
                FROM public.music_playlist_items i2 
                WHERE i2.playlist_id = p.id 
                ORDER BY i2.position ASC, i2.created_at ASC 
                LIMIT 1
              ) as "artwork"
       FROM public.music_playlists p
       LEFT JOIN public.music_playlist_items i ON i.playlist_id = p.id
       WHERE p.user_id = $1::uuid
       GROUP BY p.id
       ORDER BY p.created_at DESC`,
      authUser.userId
    );

    return NextResponse.json({ items: playlists || [] });
  } catch (error: any) {
    console.error('Error fetching playlists:', error);
    return NextResponse.json({ error: 'Failed to fetch playlists', items: [] }, { status: 500 });
  }
}

/**
 * POST /api/music/playlists
 * Creates a new custom playlist for the authenticated user
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
    const name = (body.name || '').trim();
    const description = (body.description || '').trim();

    if (!name) {
      return NextResponse.json({ error: 'Playlist name is required' }, { status: 400 });
    }

    const created: any = await prisma.$queryRawUnsafe(
      `INSERT INTO public.music_playlists (id, user_id, name, description, created_at)
       VALUES (gen_random_uuid(), $1::uuid, $2, $3, now())
       RETURNING id, name, description, created_at as "createdAt"`,
      authUser.userId,
      name,
      description || 'Curated student focus playlist'
    );

    return NextResponse.json({
      playlist: {
        ...created[0],
        trackCount: 0,
        artwork: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80',
        items: [],
      },
    });
  } catch (error: any) {
    console.error('Error creating playlist:', error);
    return NextResponse.json({ error: 'Failed to create playlist' }, { status: 500 });
  }
}
