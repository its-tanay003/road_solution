import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex h-[60vh] w-full flex-col items-center justify-center gap-4">
      <div className="relative flex items-center justify-center">
        <div className="absolute h-16 w-16 animate-ping rounded-full bg-red-500/20" />
        <Loader2 className="h-10 w-10 animate-spin text-red-600" />
      </div>
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 animate-pulse">
        Establishing connection...
      </p>
    </div>
  );
}
