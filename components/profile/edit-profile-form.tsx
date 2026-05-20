"use client"

import { useState, useRef, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { profileUpdateSchema, type ProfileUpdateInput } from "@/lib/schemas/profile"
import { updateProfile } from "@/lib/actions/profile"
import type { Profile } from "@/types"
import { User, MapPin, Save, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface EditProfileFormProps {
  profile: Profile | null
  userEmail: string
}

export function EditProfileForm({ profile, userEmail }: EditProfileFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const form = useForm<ProfileUpdateInput>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      username: profile?.username || "",
      avatar_url: profile?.avatar_url || "",
      location: profile?.location || "",
    },
  })

  useEffect(() => {
    if (avatarFile) {
      const objectUrl = URL.createObjectURL(avatarFile)
      setPreviewUrl(objectUrl)
      return () => URL.revokeObjectURL(objectUrl)
    }
  }, [avatarFile])

  async function onSubmit(values: ProfileUpdateInput) {
    setIsSubmitting(true)

    try {
      let finalAvatarUrl = values.avatar_url

      if (avatarFile) {
        if (!avatarFile.type.startsWith("image/")) {
          toast.error("Avatar must be an image file.")
          setIsSubmitting(false)
          return
        }
        if (avatarFile.size > 5 * 1024 * 1024) {
          toast.error("Avatar file size must be less than 5MB.")
          setIsSubmitting(false)
          return
        }

        const supabase = createClient()
        const fileExt = avatarFile.name.split('.').pop()
        const fileName = `${profile?.id || 'unknown'}-${Date.now()}.${fileExt}`
        
        const { error: uploadError } = await supabase.storage
          .from("public")
          .upload(`avatars/${fileName}`, avatarFile, { upsert: true })

        if (uploadError) {
          toast.error(`Failed to upload avatar: ${uploadError.message}`)
          setIsSubmitting(false)
          return
        }

        const { data: { publicUrl } } = supabase.storage
          .from("public")
          .getPublicUrl(`avatars/${fileName}`)
          
        finalAvatarUrl = publicUrl
      }

      const formData = new FormData()
      if (values.username !== undefined) {
        formData.append("username", values.username || "")
      }
      
      if (finalAvatarUrl !== undefined) {
        formData.append("avatar_url", finalAvatarUrl || "")
      }

      if (values.location !== undefined) {
        formData.append("location", values.location || "")
      }

      const result = await updateProfile(formData)

      if (result.error) {
        if (result.fieldErrors) {
          for (const [field, message] of Object.entries(result.fieldErrors)) {
            form.setError(field as keyof ProfileUpdateInput, {
              type: "manual",
              message,
            })
          }
        }
        toast.error(result.error)
        return
      }

      toast.success("Profile updated successfully")
      
      // Update form state with the new URL so isDirty resets correctly
      form.reset({
        ...values,
        avatar_url: finalAvatarUrl || ""
      })
      
      // Clear file inputs and preview
      setAvatarFile(null)
      setPreviewUrl(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
      
      // Force Next.js router to refresh the page data
      router.refresh()
    } catch {
      toast.error("An unexpected error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const currentAvatarUrl = previewUrl || profile?.avatar_url
  const initials = userEmail.substring(0, 2).toUpperCase()

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Basic Information Card */}
        <Card className="border-border/50 shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="bg-muted/30 border-b border-border/50 px-6 py-5">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </div>
            <CardDescription className="pt-1">
              Manage your personal details and how you appear on the platform.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-5">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground/90 font-medium">Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your full name" className="bg-background" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormItem>
                  <FormLabel className="text-foreground/90 font-medium">Email Address</FormLabel>
                  <FormControl>
                    <Input value={userEmail} disabled className="bg-muted/50 cursor-not-allowed opacity-70" />
                  </FormControl>
                  <p className="text-[0.8rem] text-muted-foreground">
                    Email address cannot be changed directly.
                  </p>
                </FormItem>
              </div>

              <div className="space-y-3">
                <FormLabel className="text-foreground/90 font-medium block">Profile Picture</FormLabel>
                <div className="flex flex-col items-center justify-center p-6 border border-border/50 bg-muted/20 rounded-xl gap-4 h-[180px]">
                  <Avatar className="h-20 w-20 border shadow-sm">
                    <AvatarImage src={currentAvatarUrl || undefined} className="object-cover" />
                    <AvatarFallback className="text-xl bg-muted/80">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="bg-background relative"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Choose File
                      </Button>
                      <span className="text-xs text-muted-foreground max-w-[120px] truncate">
                        {avatarFile ? avatarFile.name : "No file chosen"}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground text-center">
                      Recommended size: 256x256px. Max 5MB.
                    </p>
                    <Input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      ref={fileInputRef}
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          setAvatarFile(file)
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location Card */}
        <Card className="border-border/50 shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="bg-muted/30 border-b border-border/50 px-6 py-5">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">Location Information</CardTitle>
            </div>
            <CardDescription className="pt-1">
              This information will be used to customize your experience based on your region.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-5">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground/90 font-medium">Location</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your location (e.g. Manila, Philippines)" className="bg-background" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            disabled={isSubmitting || (!form.formState.isDirty && !avatarFile)}
            className="rounded-full px-8 gap-2 transition-all"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isSubmitting ? "Saving changes..." : "Save Changes"}
          </Button>
        </div>

      </form>
    </Form>
  )
}
