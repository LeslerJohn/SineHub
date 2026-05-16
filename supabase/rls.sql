-- ==========================================
-- SINEHUB: Row Level Security (RLS) Policies
-- ==========================================

-- 1. Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cinemas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.showtimes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moviebud_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moviebud_swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- 2. Create is_admin() helper function
-- This checks if the user's ID exists in the admins table
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admins 
    WHERE user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Profiles Policies
-- Users can read profiles if they are authenticated
CREATE POLICY "Profiles are viewable by authenticated users" ON public.profiles
  FOR SELECT USING (auth.role() = 'authenticated');

-- Users can update only their own profile
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 4. Public Read, Admin-Only Write Policies

-- Movies
CREATE POLICY "Movies are viewable by everyone" ON public.movies FOR SELECT USING (true);
CREATE POLICY "Admins can insert movies" ON public.movies FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update movies" ON public.movies FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete movies" ON public.movies FOR DELETE USING (public.is_admin());

-- Cinemas
CREATE POLICY "Cinemas are viewable by everyone" ON public.cinemas FOR SELECT USING (true);
CREATE POLICY "Admins can insert cinemas" ON public.cinemas FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update cinemas" ON public.cinemas FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete cinemas" ON public.cinemas FOR DELETE USING (public.is_admin());

-- Showtimes
CREATE POLICY "Showtimes are viewable by everyone" ON public.showtimes FOR SELECT USING (true);
CREATE POLICY "Admins can insert showtimes" ON public.showtimes FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update showtimes" ON public.showtimes FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete showtimes" ON public.showtimes FOR DELETE USING (public.is_admin());

-- Collections
CREATE POLICY "Collections are viewable by everyone" ON public.collections FOR SELECT USING (true);
CREATE POLICY "Admins can insert collections" ON public.collections FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update collections" ON public.collections FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete collections" ON public.collections FOR DELETE USING (public.is_admin());

-- Collection Movies
CREATE POLICY "Collection movies are viewable by everyone" ON public.collection_movies FOR SELECT USING (true);
CREATE POLICY "Admins can insert collection movies" ON public.collection_movies FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update collection movies" ON public.collection_movies FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete collection movies" ON public.collection_movies FOR DELETE USING (public.is_admin());

-- 5. Moviebud Rooms Policies
-- Only host or guest can read/update their rooms
CREATE POLICY "Room participants can view their rooms" ON public.moviebud_rooms
  FOR SELECT USING (auth.uid() = host_user_id OR auth.uid() = guest_user_id);

CREATE POLICY "Room participants can update their rooms" ON public.moviebud_rooms
  FOR UPDATE USING (auth.uid() = host_user_id OR auth.uid() = guest_user_id);

CREATE POLICY "Any authenticated user can create a room" ON public.moviebud_rooms
  FOR INSERT WITH CHECK (auth.uid() = host_user_id);

CREATE POLICY "Host can delete their room" ON public.moviebud_rooms
  FOR DELETE USING (auth.uid() = host_user_id);

-- 6. Moviebud Swipes Policies
-- Only the swiping user can insert
CREATE POLICY "Users can insert their own swipes" ON public.moviebud_swipes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Room participants can read swipes for their room
CREATE POLICY "Room participants can view swipes" ON public.moviebud_swipes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.moviebud_rooms r
      WHERE r.id = moviebud_swipes.room_id AND (r.host_user_id = auth.uid() OR r.guest_user_id = auth.uid())
    )
  );
