-- Migration: Add user_movie_lists table for "My List" feature
-- Users can save TMDB movies to a personal watchlist

CREATE TABLE public.user_movie_lists (
    id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id    UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    tmdb_id    INTEGER NOT NULL,
    added_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, tmdb_id)
);

CREATE INDEX idx_user_movie_lists_user_id ON public.user_movie_lists(user_id);

ALTER TABLE public.user_movie_lists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own list" ON public.user_movie_lists
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert into their own list" ON public.user_movie_lists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete from their own list" ON public.user_movie_lists
  FOR DELETE USING (auth.uid() = user_id);
