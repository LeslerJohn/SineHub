import { Container } from "@/components/ui/container";
import { AuthGuard } from "@/components/auth/auth-guard";

export default function AdminPage() {
  return (
    <AuthGuard>
      <Container className="py-12">
        <h1 className="text-3xl font-heading font-bold text-destructive">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-4">Data management tools coming soon...</p>
      </Container>
    </AuthGuard>
  );
}
