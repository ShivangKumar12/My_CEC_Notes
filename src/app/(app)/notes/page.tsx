
"use client";

import { useState, useMemo } from 'react';
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
import { Search, ListX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Note } from '@/lib/types';

export default function NotesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [sortBy, setSortBy] = useState('rating'); // Default sort by rating

  const subjects = [...new Set(mockNotes.map((note) => note.subject))];
  const semesters = [...new Set(mockNotes.map((note) => note.semester))].sort(
    (a, b) => a - b
  );

  const filteredNotes = useMemo(() => {
    return mockNotes.filter((note) => {
      const searchMatch = searchQuery
        ? note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          note.subject.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      const subjectMatch = selectedSubject ? note.subject === selectedSubject : true;
      const semesterMatch = selectedSemester
        ? String(note.semester) === selectedSemester
        : true;
      return searchMatch && subjectMatch && semesterMatch;
    });
  }, [searchQuery, selectedSubject, selectedSemester]);
  
  const allNotesSorted = useMemo(() => {
    const notes = [...filteredNotes];
    switch (sortBy) {
      case 'likes':
        return notes.sort((a, b) => b.likes - a.likes);
      case 'downloads':
        return notes.sort((a, b) => b.downloads - a.downloads);
      case 'rating':
        return notes.sort((a, b) => b.averageRating - a.averageRating);
      default:
        // Return a stable sort based on creation date if no specific sort is chosen
        return notes.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
  }, [filteredNotes, sortBy]);

  const topRatedNotes = useMemo(() => {
    return [...filteredNotes].sort((a, b) => b.averageRating - a.averageRating);
  }, [filteredNotes]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedSubject('');
    setSelectedSemester('');
    setSortBy('rating');
  }

  const isFiltered = searchQuery || selectedSubject || selectedSemester;

  const NoteGrid = ({ notes }: { notes: Note[] }) => {
    if (notes.length === 0) {
      return (
        <div className="text-center py-16 text-muted-foreground col-span-full">
          <h3 className="text-xl font-semibold">No notes found</h3>
          <p>Try adjusting your filters or search query.</p>
        </div>
      );
    }
    return (
      <>
        {notes.map((note) => (
          <NoteCard key={note.id} note={note} />
        ))}
      </>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-4 mb-8">
        <h1 className="text-4xl font-headline font-bold">Notes Library</h1>
        <p className="text-muted-foreground">Browse, search, and discover notes shared by your peers.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search by keyword..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by Subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Subjects</SelectItem>
              {subjects.map(subject => <SelectItem key={subject} value={subject}>{subject}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={selectedSemester} onValueChange={setSelectedSemester}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by Semester" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Semesters</SelectItem>
              {semesters.map(semester => <SelectItem key={semester} value={String(semester)}>Semester {semester}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger>
              <SelectValue placeholder="Sort by Popularity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="likes">Most Liked</SelectItem>
              <SelectItem value="downloads">Most Downloaded</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {isFiltered && (
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={resetFilters} className="text-muted-foreground hover:text-foreground">
                <ListX className="mr-2 h-4 w-4" />
                Clear Filters
              </Button>
            </div>
        )}
      </div>

      <Tabs defaultValue="all-notes">
        <TabsList className="mb-6">
          <TabsTrigger value="all-notes">All Notes</TabsTrigger>
          <TabsTrigger value="top-rated">Top Rated</TabsTrigger>
        </TabsList>
        <TabsContent value="all-notes">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <NoteGrid notes={allNotesSorted} />
          </div>
        </TabsContent>
        <TabsContent value="top-rated">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <NoteGrid notes={topRatedNotes} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
