import { BookOpenCheck } from 'lucide-react';

export default function Loader() {
  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-background/90 backdrop-blur-sm">
      <div className="relative flex h-24 w-24 items-center justify-center rounded-full">
        <div className="absolute h-full w-full animate-spin rounded-full border-4 border-dashed border-primary"></div>
        <BookOpenCheck className="h-10 w-10 text-primary" />
      </div>
      <p className="mt-4 text-lg font-semibold text-muted-foreground">Loading...</p>
    </div>
  );
}
