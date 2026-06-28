"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function addToMyList(tmdbId: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: "You must be signed in to add movies to your list." }
  }

  const { error } = await supabase
    .from("user_movie_lists")
    .insert({ user_id: user.id, tmdb_id: tmdbId })

  if (error) {
    if (error.code === "23505") {
      return { error: "This movie is already in your list." }
    }
    return { error: error.message }
  }

  revalidatePath("/")
  revalidatePath("/my-list")
  return { success: true }
}

export async function removeFromMyList(tmdbId: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: "You must be signed in to remove movies from your list." }
  }

  const { error } = await supabase
    .from("user_movie_lists")
    .delete()
    .eq("user_id", user.id)
    .eq("tmdb_id", tmdbId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/")
  revalidatePath("/my-list")
  return { success: true }
}

export async function getMyList(): Promise<number[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  const { data, error } = await supabase
    .from("user_movie_lists")
    .select("tmdb_id")
    .eq("user_id", user.id)
    .order("added_at", { ascending: false })

  if (error || !data) return []

  return data.map((item) => item.tmdb_id)
}
