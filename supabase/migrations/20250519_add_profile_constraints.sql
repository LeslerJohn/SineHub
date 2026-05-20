-- ==========================================
-- Migration: Add CHECK constraints to profiles table
-- Purpose: Enforce data integrity at the database level
-- ==========================================

-- Add CHECK constraint for username (3-30 chars, alphanumeric + underscore + hyphen)
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_username_check
  CHECK (
    username IS NULL OR (
      LENGTH(username) BETWEEN 3 AND 30
      AND username ~ '^[a-zA-Z0-9_-]+$'
    )
  );

-- Add CHECK constraint for avatar_url (valid URL, max 500 chars)
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_avatar_url_check
  CHECK (
    avatar_url IS NULL OR (
      LENGTH(avatar_url) <= 500
      AND avatar_url ~ '^https?://'
    )
  );

-- Add CHECK constraint for location (max 100 chars)
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_location_check
  CHECK (
    location IS NULL OR (
      LENGTH(location) <= 100
    )
  );
