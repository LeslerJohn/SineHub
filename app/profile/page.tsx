import { Container } from "@/components/ui/container";
import { AuthGuard } from "@/components/auth/auth-guard";

export default function ProfilePage() {
  return (
    <AuthGuard>
      <Container className="py-12">
        <h1 className="text-3xl font-heading font-bold">Profile</h1>
        <p className="text-muted-foreground mt-4">User settings coming soon...</p>
      </Container>
    </AuthGuard>
  );
}
