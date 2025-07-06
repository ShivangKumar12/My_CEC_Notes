
"use client";

import { useState, useMemo, useEffect } from 'react';
import type { Note } from '@/lib/types';
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
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';


export default function NotesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedSemester, setSelectedSemester] = useState('all');
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [selectedBatch, setSelectedBatch] = useState('all');
  const [sortBy, setSortBy] = useState('rating'); // Default sort by rating

  const [allNotes, setAllNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [subjects, setSubjects] = useState<string[]>([]);
  const [semesters, setSemesters] = useState<number[]>([]);
  const [courses, setCourses] = useState<string[]>([]);
  const [batches, setBatches] = useState<string[]>([]);
  
  useEffect(() => {
    const fetchMetadata = async () => {
      const [subjectsSnap, semestersSnap, coursesSnap, batchesSnap] = await Promise.all([
        getDocs(collection(db, 'subjects')),
        getDocs(collection(db, 'semesters')),
        getDocs(collection(db, 'courses')),
        getDocs(collection(db, 'batches')),
      ]);
      setSubjects(subjectsSnap.docs.map(d => d.data().name).sort());
      setSemesters(semestersSnap.docs.map(d => d.data().value).sort((a: number, b: number) => a - b));
      setCourses(coursesSnap.docs.map(d => d.data().name).sort());
      setBatches(batchesSnap.docs.map(d => d.data().name).sort());
    };
    
    fetchMetadata();
  }, []);
  
  useEffect(() => {
    const fetchNotes = async () => {
      setIsLoading(true);
      try {
        let q = query(collection(db, 'notes'), where('category', '==', 'note'));
        
        // Filtering
        if (selectedSubject !== 'all') q = query(q, where('subject', '==', selectedSubject));
        if (selectedSemester !== 'all') q = query(q, where('semester', '==', Number(selectedSemester)));
        if (selectedCourse !== 'all') q = query(q, where('course', '==', selectedCourse));
        if (selectedBatch !== 'all') q = query(q, where('batch', '==', selectedBatch));
        
        // Sorting
        if(sortBy === 'rating') q = query(q, orderBy('averageRating', 'desc'));
        if(sortBy === 'likes') q = query(q, orderBy('likes', 'desc'));
        if(sortBy === 'downloads') q = query(q, orderBy('downloads', 'desc'));

        const querySnapshot = await getDocs(q);
        const notesData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt.toDate(),
          } as Note;
        });

        // Client-side search after fetching
        const filtered = notesData.filter(note => 
          searchQuery ? note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        note.subject.toLowerCase().includes(searchQuery.toLowerCase())
                      : true
        );
        
        setAllNotes(filtered);
      } catch (error) {
        console.error("Error fetching notes:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchNotes();
  }, [searchQuery, selectedSubject, selectedSemester, selectedCourse, selectedBatch, sortBy]);
  
  const topRatedNotes = useMemo(() => {
    return [...allNotes].sort((a, b) => b.averageRating - a.averageRating).slice(0, 10);
  }, [allNotes]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedSubject('all');
    setSelectedSemester('all');
    setSelectedCourse('all');
    setSelectedBatch('all');
    setSortBy('rating');
  }

  const isFiltered = searchQuery || selectedSubject !== 'all' || selectedSemester !== 'all' || selectedCourse !== 'all' || selectedBatch !== 'all';

  const NoteGrid = ({ notes }: { notes: Note[] }) => {
    if (isLoading) {
      return (
        <>
          {[...Array(8)].map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-6 w-5/6" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </>
      );
    }

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
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mt-4">
          <div className="relative xl:col-span-2">
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
              <SelectItem value="all">All Subjects</SelectItem>
              {subjects.map(subject => <SelectItem key={subject} value={subject}>{subject}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={selectedSemester} onValueChange={setSelectedSemester}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by Semester" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Semesters</SelectItem>
              {semesters.map(semester => <SelectItem key={semester} value={String(semester)}>Semester {semester}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={selectedCourse} onValueChange={setSelectedCourse}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by Course" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              {courses.map(course => <SelectItem key={course} value={course}>{course}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={selectedBatch} onValueChange={setSelectedBatch}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by Batch" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Batches</SelectItem>
              {batches.map(batch => <SelectItem key={batch} value={batch}>{batch}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mt-2">
            <div className="xl:col-start-3">
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
        </div>

        {isFiltered && (
            <div className="flex items-center gap-2 mt-2">
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
            <NoteGrid notes={allNotes} />
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
