'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { AlertCircle } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App error:', error);
  }, [error]);

  return (
    <Container className="flex min-h-[60vh] w-full flex-col items-center justify-center space-y-4">
      <AlertCircle className="h-12 w-12 text-destructive" />
      <h2 className="text-2xl font-bold font-heading">Oops, something went wrong!</h2>
      <p className="text-muted-foreground text-center max-w-md">
        An error occurred while loading this page. You can try again or go back home.
      </p>
      <Button onClick={() => reset()} variant="default" className="mt-4">
        Try again
      </Button>
    </Container>
  );
}
