import { mockNotes } from '@/lib/mock-data';
import NoteCard from '@/components/note-card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search } from 'lucide-react';

export default function NotesPage() {
  const allNotes = mockNotes;
  const topRatedNotes = [...mockNotes].sort((a, b) => b.averageRating - a.averageRating);

  const subjects = [...new Set(mockNotes.map(note => note.subject))];
  const semesters = [...new Set(mockNotes.map(note => note.semester))].sort((a, b) => a - b);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-4 mb-8">
        <h1 className="text-4xl font-headline font-bold">Notes Library</h1>
        <p className="text-muted-foreground">Browse, search, and discover notes shared by your peers.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input placeholder="Search by keyword..." className="pl-10" />
          </div>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Filter by Subject" />
            </SelectTrigger>
            <SelectContent>
              {subjects.map(subject => <SelectItem key={subject} value={subject}>{subject}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Filter by Semester" />
            </SelectTrigger>
            <SelectContent>
              {semesters.map(semester => <SelectItem key={semester} value={String(semester)}>Semester {semester}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Sort by Popularity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="likes">Most Liked</SelectItem>
              <SelectItem value="downloads">Most Downloaded</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="all-notes">
        <TabsList className="mb-6">
          <TabsTrigger value="all-notes">All Notes</TabsTrigger>
          <TabsTrigger value="top-rated">Top Rated</TabsTrigger>
        </TabsList>
        <TabsContent value="all-notes">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {allNotes.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="top-rated">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {topRatedNotes.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
