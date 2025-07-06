import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BookOpenCheck } from 'lucide-react';
import Footer from '@/components/footer';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="relative flex-grow w-full flex flex-col items-center justify-center p-4 overflow-hidden">
        <div className="absolute inset-0 w-full h-full bg-background bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#374151_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <main className="z-10 flex flex-col items-center justify-center text-center space-y-8">
          <header className="flex flex-col items-center space-y-4">
            <div className="bg-primary/10 border border-primary/20 p-4 rounded-full">
              <BookOpenCheck className="w-12 h-12 text-primary" />
            </div>
            <h1 className="text-5xl md:text-7xl font-headline font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-primary via-blue-400 to-accent">
              NoteVault
            </h1>
            <p className="max-w-2xl text-lg text-muted-foreground">
              Your centralized hub for sharing and discovering student-authored notes. Upload your study materials, rate contributions, and collaborate for academic success.
            </p>
          </header>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Button asChild size="lg" className="font-bold text-lg py-7 px-8 shadow-lg transition-transform transform hover:scale-105">
              <Link href="/notes">Explore Notes</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="font-bold text-lg py-7 px-8 shadow-lg transition-transform transform hover:scale-105">
              <Link href="/upload">Upload a Note</Link>
            </Button>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
