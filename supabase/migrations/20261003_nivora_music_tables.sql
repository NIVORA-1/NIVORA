-- NIVORA Music Tables & Row Level Security Policies
-- Migration: 20261003_nivora_music_tables.sql

-- 1. music_favorites
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

-- 2. music_recently_played
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

-- 3. music_playlists
CREATE TABLE IF NOT EXISTS public.music_playlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- 4. music_playlist_items
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

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_music_fav_user ON public.music_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_music_recent_user_played ON public.music_recently_played(user_id, played_at DESC);
CREATE INDEX IF NOT EXISTS idx_music_playlists_user ON public.music_playlists(user_id);
CREATE INDEX IF NOT EXISTS idx_music_playlist_items_playlist ON public.music_playlist_items(playlist_id, position ASC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.music_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.music_recently_played ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.music_playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.music_playlist_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can read own favorites" ON public.music_favorites;
DROP POLICY IF EXISTS "Users can insert own favorites" ON public.music_favorites;
DROP POLICY IF EXISTS "Users can update own favorites" ON public.music_favorites;
DROP POLICY IF EXISTS "Users can delete own favorites" ON public.music_favorites;

DROP POLICY IF EXISTS "Users can read own recently played" ON public.music_recently_played;
DROP POLICY IF EXISTS "Users can insert own recently played" ON public.music_recently_played;
DROP POLICY IF EXISTS "Users can update own recently played" ON public.music_recently_played;
DROP POLICY IF EXISTS "Users can delete own recently played" ON public.music_recently_played;

DROP POLICY IF EXISTS "Users can read own playlists" ON public.music_playlists;
DROP POLICY IF EXISTS "Users can insert own playlists" ON public.music_playlists;
DROP POLICY IF EXISTS "Users can update own playlists" ON public.music_playlists;
DROP POLICY IF EXISTS "Users can delete own playlists" ON public.music_playlists;

DROP POLICY IF EXISTS "Users can read own playlist items" ON public.music_playlist_items;
DROP POLICY IF EXISTS "Users can insert own playlist items" ON public.music_playlist_items;
DROP POLICY IF EXISTS "Users can update own playlist items" ON public.music_playlist_items;
DROP POLICY IF EXISTS "Users can delete own playlist items" ON public.music_playlist_items;

-- Recreate RLS Policies
-- Favorites
CREATE POLICY "Users can read own favorites" ON public.music_favorites
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own favorites" ON public.music_favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own favorites" ON public.music_favorites
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own favorites" ON public.music_favorites
  FOR DELETE USING (auth.uid() = user_id);

-- Recently Played
CREATE POLICY "Users can read own recently played" ON public.music_recently_played
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own recently played" ON public.music_recently_played
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own recently played" ON public.music_recently_played
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own recently played" ON public.music_recently_played
  FOR DELETE USING (auth.uid() = user_id);

-- Playlists
CREATE POLICY "Users can read own playlists" ON public.music_playlists
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own playlists" ON public.music_playlists
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own playlists" ON public.music_playlists
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own playlists" ON public.music_playlists
  FOR DELETE USING (auth.uid() = user_id);

-- Playlist Items
CREATE POLICY "Users can read own playlist items" ON public.music_playlist_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.music_playlists
      WHERE public.music_playlists.id = public.music_playlist_items.playlist_id
        AND public.music_playlists.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can insert own playlist items" ON public.music_playlist_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.music_playlists
      WHERE public.music_playlists.id = public.music_playlist_items.playlist_id
        AND public.music_playlists.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can update own playlist items" ON public.music_playlist_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.music_playlists
      WHERE public.music_playlists.id = public.music_playlist_items.playlist_id
        AND public.music_playlists.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can delete own playlist items" ON public.music_playlist_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.music_playlists
      WHERE public.music_playlists.id = public.music_playlist_items.playlist_id
        AND public.music_playlists.user_id = auth.uid()
    )
  );
