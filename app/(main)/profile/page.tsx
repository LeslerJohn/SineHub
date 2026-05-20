import { Container } from "@/components/ui/container";
import { AuthGuard } from "@/components/auth/auth-guard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/server";
import { EditProfileForm } from "@/components/profile/edit-profile-form";
import { Card } from "@/components/ui/card";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null; // AuthGuard handles redirect

  // Fetch profile data from database
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const initials = user.email?.substring(0, 2).toUpperCase() || "U";
  const displayName = profile?.username || user.user_metadata?.full_name || user.email?.split("@")[0];

  return (
    <AuthGuard>
      <Container className="py-12 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-[350px_1fr] gap-8 items-start animate-in fade-in slide-in-from-bottom-4 duration-1000">
          
          {/* Left Column: Minimalist Profile Display */}
          <Card className="overflow-hidden border-border/50 shadow-sm bg-card rounded-2xl pb-8">
            <div className="h-32 bg-muted relative">
              {/* Optional background element */}
              <div className="absolute inset-0 bg-gradient-to-r from-muted/50 to-muted opacity-50" />
            </div>
            
            <div className="flex flex-col items-center px-6 relative -mt-16">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-accent/30 rounded-full blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
                <Avatar className="h-32 w-32 border-4 border-background relative bg-background">
                  <AvatarImage src={profile?.avatar_url || user.user_metadata?.avatar_url || undefined} className="object-cover" />
                  <AvatarFallback className="text-4xl bg-muted/50 font-light tracking-wider">{initials}</AvatarFallback>
                </Avatar>
              </div>
              
              <div className="text-center mt-6 space-y-1.5 w-full">
                <h1 className="text-2xl font-semibold tracking-tight truncate px-2">
                  {displayName}
                </h1>
                <p className="text-muted-foreground text-sm truncate px-2">
                  {user.email}
                </p>
                {profile?.location && (
                  <p className="text-sm text-muted-foreground/80 truncate px-2 pt-2">
                    {profile.location}
                  </p>
                )}
              </div>
            </div>
          </Card>

          {/* Right Column: Edit Profile Form */}
          <div className="space-y-6">
            <EditProfileForm 
              profile={profile}
              userEmail={user.email || ""}
            />
          </div>

        </div>
      </Container>
    </AuthGuard>
  );
}
