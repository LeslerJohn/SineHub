import { z } from "zod"

export const profileUpdateSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters")
    .regex(
      /^[a-zA-Z0-9_ -]+$/,
      "Username can only contain letters, numbers, spaces, underscores, and hyphens"
    )
    .trim()
    .optional()
    .or(z.literal("")),
  avatar_url: z
    .string()
    .url("Avatar URL must be a valid URL")
    .max(500, "Avatar URL must be at most 500 characters")
    .refine(
      (url) => url.startsWith("http://") || url.startsWith("https://"),
      "Avatar URL must use HTTP or HTTPS protocol"
    )
    .optional()
    .or(z.literal("")),
  location: z
    .string()
    .max(100, "Location must be at most 100 characters")
    .trim()
    .optional()
    .or(z.literal("")),
})

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>
