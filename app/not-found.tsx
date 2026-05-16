import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { Film } from 'lucide-react';

export default function NotFound() {
  return (
    <Container className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-center">
      <div className="rounded-full bg-muted p-6 mb-4">
        <Film className="h-12 w-12 text-muted-foreground" />
      </div>
      <h2 className="text-3xl font-bold font-heading">Page Not Found</h2>
      <p className="text-muted-foreground max-w-md">
        We couldn't find the page you were looking for. It might have been moved or doesn't exist.
      </p>
      <Button asChild className="mt-8">
        <Link href="/">Return Home</Link>
      </Button>
    </Container>
  );
}
