import prisma from '../src/lib/prisma';

async function migrate() {
  console.log('Creating music tables in Supabase PostgreSQL...');
  try {
    // 1. music_favorites
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS public.music_favorites (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        youtube_video_id text NOT NULL,
        title text NOT NULL,
        channel_title text,
        thumbnail_url text,
        duration text,
        created_at timestamptz DEFAULT now(),
        CONSTRAINT uq_user_youtube_favorite UNIQUE (user_id, youtube_video_id)
      );
    `);
    console.log('✓ music_favorites created');

    // 2. music_recently_played
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS public.music_recently_played (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        youtube_video_id text NOT NULL,
        title text NOT NULL,
        channel_title text,
        thumbnail_url text,
        duration text,
        played_at timestamptz DEFAULT now(),
        CONSTRAINT uq_user_youtube_recent UNIQUE (user_id, youtube_video_id)
      );
    `);
    console.log('✓ music_recently_played created');

    // 3. music_playlists
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS public.music_playlists (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        name text NOT NULL,
        description text,
        created_at timestamptz DEFAULT now()
      );
    `);
    console.log('✓ music_playlists created');

    // 4. music_playlist_items
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS public.music_playlist_items (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        playlist_id uuid NOT NULL REFERENCES public.music_playlists(id) ON DELETE CASCADE,
        youtube_video_id text NOT NULL,
        title text NOT NULL,
        channel_title text,
        thumbnail_url text,
        duration text,
        position integer DEFAULT 0,
        created_at timestamptz DEFAULT now()
      );
    `);
    console.log('✓ music_playlist_items created');

    // Indexes
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS idx_music_fav_user ON public.music_favorites(user_id)`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS idx_music_recent_user_played ON public.music_recently_played(user_id, played_at DESC)`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS idx_music_playlists_user ON public.music_playlists(user_id)`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS idx_music_playlist_items_playlist ON public.music_playlist_items(playlist_id, position ASC)`);
    console.log('✓ Indexes created');

    // Enable RLS
    await prisma.$executeRawUnsafe(`ALTER TABLE public.music_favorites ENABLE ROW LEVEL SECURITY`);
    await prisma.$executeRawUnsafe(`ALTER TABLE public.music_recently_played ENABLE ROW LEVEL SECURITY`);
    await prisma.$executeRawUnsafe(`ALTER TABLE public.music_playlists ENABLE ROW LEVEL SECURITY`);
    await prisma.$executeRawUnsafe(`ALTER TABLE public.music_playlist_items ENABLE ROW LEVEL SECURITY`);
    console.log('✓ RLS enabled');

    // Drop old policies
    const dropPolicies = [
      `DROP POLICY IF EXISTS "Users can read own favorites" ON public.music_favorites`,
      `DROP POLICY IF EXISTS "Users can insert own favorites" ON public.music_favorites`,
      `DROP POLICY IF EXISTS "Users can update own favorites" ON public.music_favorites`,
      `DROP POLICY IF EXISTS "Users can delete own favorites" ON public.music_favorites`,

      `DROP POLICY IF EXISTS "Users can read own recently played" ON public.music_recently_played`,
      `DROP POLICY IF EXISTS "Users can insert own recently played" ON public.music_recently_played`,
      `DROP POLICY IF EXISTS "Users can update own recently played" ON public.music_recently_played`,
      `DROP POLICY IF EXISTS "Users can delete own recently played" ON public.music_recently_played`,

      `DROP POLICY IF EXISTS "Users can read own playlists" ON public.music_playlists`,
      `DROP POLICY IF EXISTS "Users can insert own playlists" ON public.music_playlists`,
      `DROP POLICY IF EXISTS "Users can update own playlists" ON public.music_playlists`,
      `DROP POLICY IF EXISTS "Users can delete own playlists" ON public.music_playlists`,

      `DROP POLICY IF EXISTS "Users can read own playlist items" ON public.music_playlist_items`,
      `DROP POLICY IF EXISTS "Users can insert own playlist items" ON public.music_playlist_items`,
      `DROP POLICY IF EXISTS "Users can update own playlist items" ON public.music_playlist_items`,
      `DROP POLICY IF EXISTS "Users can delete own playlist items" ON public.music_playlist_items`,
    ];

    for (const sql of dropPolicies) {
      await prisma.$executeRawUnsafe(sql);
    }
    console.log('✓ Old policies dropped');

    // Create policies
    const createPolicies = [
      `CREATE POLICY "Users can read own favorites" ON public.music_favorites FOR SELECT USING (auth.uid() = user_id)`,
      `CREATE POLICY "Users can insert own favorites" ON public.music_favorites FOR INSERT WITH CHECK (auth.uid() = user_id)`,
      `CREATE POLICY "Users can update own favorites" ON public.music_favorites FOR UPDATE USING (auth.uid() = user_id)`,
      `CREATE POLICY "Users can delete own favorites" ON public.music_favorites FOR DELETE USING (auth.uid() = user_id)`,

      `CREATE POLICY "Users can read own recently played" ON public.music_recently_played FOR SELECT USING (auth.uid() = user_id)`,
      `CREATE POLICY "Users can insert own recently played" ON public.music_recently_played FOR INSERT WITH CHECK (auth.uid() = user_id)`,
      `CREATE POLICY "Users can update own recently played" ON public.music_recently_played FOR UPDATE USING (auth.uid() = user_id)`,
      `CREATE POLICY "Users can delete own recently played" ON public.music_recently_played FOR DELETE USING (auth.uid() = user_id)`,

      `CREATE POLICY "Users can read own playlists" ON public.music_playlists FOR SELECT USING (auth.uid() = user_id)`,
      `CREATE POLICY "Users can insert own playlists" ON public.music_playlists FOR INSERT WITH CHECK (auth.uid() = user_id)`,
      `CREATE POLICY "Users can update own playlists" ON public.music_playlists FOR UPDATE USING (auth.uid() = user_id)`,
      `CREATE POLICY "Users can delete own playlists" ON public.music_playlists FOR DELETE USING (auth.uid() = user_id)`,

      `CREATE POLICY "Users can read own playlist items" ON public.music_playlist_items FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.music_playlists
          WHERE public.music_playlists.id = public.music_playlist_items.playlist_id
            AND public.music_playlists.user_id = auth.uid()
        )
      )`,
      `CREATE POLICY "Users can insert own playlist items" ON public.music_playlist_items FOR INSERT WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.music_playlists
          WHERE public.music_playlists.id = public.music_playlist_items.playlist_id
            AND public.music_playlists.user_id = auth.uid()
        )
      )`,
      `CREATE POLICY "Users can update own playlist items" ON public.music_playlist_items FOR UPDATE USING (
        EXISTS (
          SELECT 1 FROM public.music_playlists
          WHERE public.music_playlists.id = public.music_playlist_items.playlist_id
            AND public.music_playlists.user_id = auth.uid()
        )
      )`,
      `CREATE POLICY "Users can delete own playlist items" ON public.music_playlist_items FOR DELETE USING (
        EXISTS (
          SELECT 1 FROM public.music_playlists
          WHERE public.music_playlists.id = public.music_playlist_items.playlist_id
            AND public.music_playlists.user_id = auth.uid()
        )
      )`,
    ];

    for (const sql of createPolicies) {
      await prisma.$executeRawUnsafe(sql);
    }
    console.log('✓ All RLS policies successfully applied!');
  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrate();
