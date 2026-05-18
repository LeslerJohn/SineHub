-- ==========================================
-- SINEHUB: Database Schema
-- ==========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE,
    avatar_url TEXT,
    location TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 1.5 Admins Table
CREATE TABLE public.admins (
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. Movies Table
CREATE TABLE public.movies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tmdb_id INTEGER UNIQUE,
    title TEXT NOT NULL,
    synopsis TEXT,
    poster_url TEXT,
    backdrop_url TEXT,
    runtime INTEGER,
    genre TEXT[],
    mtrcb_rating TEXT,
    imdb_score NUMERIC(3, 1),
    rt_score INTEGER,
    release_date DATE,
    status TEXT CHECK (status IN ('now_showing', 'coming_soon')),
    trailer_youtube_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. Cinemas Table
CREATE TABLE public.cinemas (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    brand TEXT CHECK (brand IN ('SM', 'Robinsons', 'KCC', 'Ayala')),
    city TEXT NOT NULL,
    lat NUMERIC(9, 6),
    lng NUMERIC(9, 6),
    website_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. Showtimes Table
CREATE TABLE public.showtimes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    movie_id UUID REFERENCES public.movies(id) ON DELETE CASCADE NOT NULL,
    cinema_id UUID REFERENCES public.cinemas(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    format TEXT CHECK (format IN ('2D', '3D', 'IMAX', 'Directors Club')),
    ticket_url TEXT,
    scraped_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(movie_id, cinema_id, date, time, format)
);

-- 5. Collections Table (Curated Lists)
CREATE TABLE public.collections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    slug TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 6. Collection Movies (Junction Table)
CREATE TABLE public.collection_movies (
    collection_id UUID REFERENCES public.collections(id) ON DELETE CASCADE NOT NULL,
    movie_id UUID REFERENCES public.movies(id) ON DELETE CASCADE NOT NULL,
    display_order INTEGER NOT NULL,
    PRIMARY KEY (collection_id, movie_id)
);

-- 7. Moviebud Rooms Table
CREATE TABLE public.moviebud_rooms (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    host_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    guest_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    genre_filter TEXT[],
    cinema_filter UUID[],
    status TEXT CHECK (status IN ('waiting', 'active', 'completed', 'expired')) DEFAULT 'waiting',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 8. Moviebud Swipes Table
CREATE TABLE public.moviebud_swipes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    room_id UUID REFERENCES public.moviebud_rooms(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    movie_id UUID REFERENCES public.movies(id) ON DELETE CASCADE NOT NULL,
    direction TEXT CHECK (direction IN ('left', 'right')) NOT NULL,
    swiped_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(room_id, user_id, movie_id)
);

-- ==========================================
-- INDEXES FOR PERFORMANCE
-- ==========================================
CREATE INDEX idx_movies_status ON public.movies(status);
CREATE INDEX idx_showtimes_date_cinema ON public.showtimes(date, cinema_id);
CREATE INDEX idx_moviebud_rooms_status ON public.moviebud_rooms(status);
CREATE INDEX idx_moviebud_swipes_room_id ON public.moviebud_swipes(room_id);
CREATE INDEX idx_moviebud_swipes_user_id ON public.moviebud_swipes(user_id);

-- ==========================================
-- TRIGGERS FOR UPDATED_AT
-- ==========================================
CREATE OR REPLACE FUNCTION public.update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_modtime
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE PROCEDURE public.update_modified_column();

CREATE TRIGGER update_movies_modtime
    BEFORE UPDATE ON public.movies
    FOR EACH ROW EXECUTE PROCEDURE public.update_modified_column();

-- ==========================================
-- SCRAPER LOGS TABLE
-- ==========================================
CREATE TABLE public.scraper_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    provider TEXT NOT NULL,
    status TEXT CHECK (status IN ('success', 'partial', 'failed')) NOT NULL,
    showtimes_count INTEGER DEFAULT 0,
    errors JSONB DEFAULT '[]',
    duration_ms INTEGER,
    ran_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_scraper_logs_provider ON public.scraper_logs(provider);
CREATE INDEX idx_scraper_logs_ran_at ON public.scraper_logs(ran_at);
