import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BookOpenCheck, ArrowRight, Library, GraduationCap } from 'lucide-react';
import Footer from '@/components/footer';
import Header from '@/components/header';
import { mockNotes } from '@/lib/mock-data';
import NoteCard from '@/components/note-card';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

export default function HomePage() {
  const featuredNotes = [...mockNotes].sort((a, b) => b.likes - a.likes).slice(0, 6);
  const recentNotes = [...mockNotes].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 4);
  const subjects = [...new Set(mockNotes.map((note) => note.subject))].slice(0, 6);
  const semesters = [...new Set(mockNotes.map((note) => note.semester))].sort((a, b) => a - b).slice(0, 6);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full py-20 md:py-32 lg:py-40 text-center">
           <div className="absolute inset-0 w-full h-full bg-background bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#374151_1px,transparent_1px)] [background-size:16px_16px]"></div>
          <div className="container mx-auto px-4 z-10 relative">
            <div className="bg-primary/10 border border-primary/20 p-4 rounded-full inline-block mb-4">
              <BookOpenCheck className="w-12 h-12 text-primary" />
            </div>
            <h1 className="text-5xl md:text-7xl font-headline font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-primary via-blue-400 to-accent">
              Welcome to MyCECNotes
            </h1>
            <p className="max-w-2xl mx-auto mt-4 text-lg text-muted-foreground">
              Your centralized hub for sharing and discovering student-authored notes. Upload your study materials, rate contributions, and collaborate for academic success.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="font-bold text-lg py-7 px-8 shadow-lg transition-transform transform hover:scale-105">
                <Link href="/notes">Explore Notes</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="font-bold text-lg py-7 px-8 shadow-lg transition-transform transform hover:scale-105">
                <Link href="/upload">Upload a Note</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Featured Notes Section */}
        <section className="py-16 md:py-24 bg-card">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-headline font-bold text-center mb-12">Featured Notes</h2>
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-4">
                {featuredNotes.map((note) => (
                  <CarouselItem key={note.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                    <div className="p-1 h-full">
                       <NoteCard note={note} />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden lg:flex" />
              <CarouselNext className="hidden lg:flex" />
            </Carousel>
          </div>
        </section>

        {/* Browse by Subject Section */}
        <section className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-headline font-bold text-center mb-12">Browse by Subject</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {subjects.map(subject => (
                <Link key={subject} href={`/notes?subject=${encodeURIComponent(subject)}`}>
                  <Card className="text-center hover:shadow-lg hover:-translate-y-1 transition-transform group">
                    <CardHeader>
                      <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit group-hover:bg-primary/20 transition-colors">
                        <Library className="h-8 w-8 text-primary" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <h3 className="font-bold text-lg">{subject}</h3>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Browse by Semester Section */}
        <section className="py-16 md:py-24 bg-card">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-headline font-bold text-center mb-12">Browse by Semester</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {semesters.map(semester => (
                <Link key={semester} href={`/notes?semester=${semester}`}>
                  <Card className="text-center hover:shadow-lg hover:-translate-y-1 transition-transform group">
                    <CardHeader>
                       <div className="mx-auto bg-accent/20 p-4 rounded-full w-fit group-hover:bg-accent/30 transition-colors">
                        <GraduationCap className="h-8 w-8 text-accent-foreground" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <h3 className="font-bold text-lg">Semester {semester}</h3>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Recent Notes Section */}
        <section className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-headline font-bold text-center mb-12">Recently Added Notes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {recentNotes.map((note) => (
                <NoteCard key={note.id} note={note} />
              ))}
            </div>
          </div>
        </section>
        
        {/* Call to Action Section */}
        <section className="py-20 bg-primary/10">
            <div className="container mx-auto px-4 text-center">
                <h2 className="text-3xl font-headline font-bold">Join the Community!</h2>
                <p className="mt-2 text-muted-foreground max-w-xl mx-auto">
                    Ready to contribute your knowledge and help fellow students? Upload your first note today and become part of our growing academic community.
                </p>
                <Button asChild size="lg" className="mt-6 font-bold text-lg py-6 px-8 shadow-lg transition-transform transform hover:scale-105">
                    <Link href="/upload">
                        Upload a Note <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                </Button>
            </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
