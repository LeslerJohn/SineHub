'use server'

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { profileUpdateSchema } from "@/lib/schemas/profile"

// Simple in-memory rate limiter (5 requests per 60 seconds per user)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(userId: string): { allowed: boolean; error?: string } {
  const now = Date.now()
  const windowMs = 60_000 // 60 seconds
  const maxRequests = 5

  const record = rateLimitMap.get(userId)

  if (!record || now > record.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + windowMs })
    return { allowed: true }
  }

  if (record.count >= maxRequests) {
    const retryAfter = Math.ceil((record.resetAt - now) / 1000)
    return {
      allowed: false,
      error: `Rate limit exceeded. Try again in ${retryAfter} seconds.`,
    }
  }

  record.count += 1
  return { allowed: true }
}

function sanitizeUsername(username: string | undefined | null): string | null {
  if (!username || username.trim() === "") return null
  return username.trim().toLowerCase()
}

function sanitizeAvatarUrl(url: string | undefined | null): string | null {
  if (!url || url.trim() === "") return null
  return url.trim()
}

function sanitizeLocation(location: string | undefined | null): string | null {
  if (!location || location.trim() === "") return null
  return location.trim()
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: "You must be logged in to update your profile." }
  }

  // Rate limiting
  const rateLimitResult = checkRateLimit(user.id)
  if (!rateLimitResult.allowed) {
    return { error: rateLimitResult.error }
  }

  let newAvatarUrl = formData.get("avatar_url") as string | null
  console.log("[updateProfile] Received avatar_url:", newAvatarUrl)
  
  // Extract form data
  const rawData = {
    username: formData.get("username") as string | null,
    avatar_url: newAvatarUrl,
    location: formData.get("location") as string | null,
  }
  
  console.log("[updateProfile] rawData:", rawData)

  // Validate with Zod
  const validationResult = profileUpdateSchema.safeParse(rawData)

  if (!validationResult.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of validationResult.error.issues) {
      const path = issue.path[0]
      if (typeof path === "string") {
        fieldErrors[path] = issue.message
      }
    }
    return { error: "Validation failed.", fieldErrors }
  }

  const validatedData = validationResult.data

  // Sanitize values
  const updatePayload = {
    username: sanitizeUsername(validatedData.username),
    avatar_url: sanitizeAvatarUrl(validatedData.avatar_url),
    location: sanitizeLocation(validatedData.location),
  }

  // Remove null values to avoid overwriting with null unexpectedly
  const cleanedPayload: Record<string, string | null> = {}
  for (const [key, value] of Object.entries(updatePayload)) {
    if (value !== undefined) {
      cleanedPayload[key] = value
    }
  }

  console.log("[updateProfile] cleanedPayload for DB:", cleanedPayload)

  const { error: updateError } = await supabase
    .from("profiles")
    .upsert(
      {
        id: user.id,
        ...cleanedPayload,
      },
      { onConflict: "id" }
    )

  if (updateError) {
    // Sanitize error messages to avoid leaking internal details
    if (updateError.code === "23505") {
      return { error: "This username is already taken. Please choose another." }
    }

    if (updateError.code === "23514") {
      return {
        error: "Your input does not meet the requirements. Please check your username, avatar URL, or location.",
      }
    }

    return { error: "Failed to update profile. Please try again later." }
  }

  revalidatePath("/profile")

  return { success: true }
}
