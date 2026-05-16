import { Container } from "@/components/ui/container";

export default async function MovieDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  
  return (
    <Container className="py-12">
      <h1 className="text-3xl font-heading font-bold">Movie Details: {params.id}</h1>
      <p className="text-muted-foreground mt-4">Movie information coming soon...</p>
    </Container>
  );
}
