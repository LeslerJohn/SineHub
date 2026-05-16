'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { AlertCircle } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Unhandled error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <Container className="flex h-screen w-full flex-col items-center justify-center space-y-4">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <h2 className="text-2xl font-bold font-heading">Something went wrong!</h2>
          <p className="text-muted-foreground text-center max-w-md">
            An unexpected error occurred. Please try again or contact support if the issue persists.
          </p>
          <Button onClick={() => reset()} variant="default" className="mt-4">
            Try again
          </Button>
        </Container>
      </body>
    </html>
  );
}
