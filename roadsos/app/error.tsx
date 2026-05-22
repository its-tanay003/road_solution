'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service in production
    console.error('Unhandled application error:', error);
  }, [error]);

  return (
    <div className="flex h-[80vh] w-full flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md border-red-500/20 bg-red-500/5 shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
            <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-500" />
          </div>
          <CardTitle className="text-xl text-red-700 dark:text-red-400">System Error</CardTitle>
          <CardDescription className="text-red-600/80 dark:text-red-500/80">
            A critical component failed to load.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-6">
          <div className="w-full rounded-md bg-white/50 p-4 text-sm font-mono text-slate-800 dark:bg-black/50 dark:text-slate-300 overflow-auto">
            {error.message || 'An unexpected error occurred'}
          </div>
          
          <div className="flex gap-4">
            <Button 
              variant="default"
              onClick={reset}
              className="gap-2 bg-red-600 hover:bg-red-700 text-white"
            >
              <RefreshCcw className="h-4 w-4" />
              Try Again
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.href = '/'}
              className="border-red-200 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-900/20"
            >
              Return Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
