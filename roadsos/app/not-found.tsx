import Link from 'next/link';
import { MapPinOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex h-[80vh] w-full flex-col items-center justify-center p-4 text-center">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
        <MapPinOff className="h-12 w-12 text-slate-400 dark:text-slate-500" />
      </div>
      <h1 className="mb-2 text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
        404
      </h1>
      <h2 className="mb-6 text-xl font-medium text-slate-600 dark:text-slate-400">
        Destination Not Found
      </h2>
      <p className="mb-8 max-w-md text-slate-500 dark:text-slate-400">
        The emergency route or page you are looking for does not exist or has been moved.
      </p>
      <Link href="/">
        <Button size="lg" className="rounded-full">
          Return to Dashboard
        </Button>
      </Link>
    </div>
  );
}
