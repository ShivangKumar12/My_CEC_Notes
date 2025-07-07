
"use client";

import { useState, useMemo, useEffect } from 'react';
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
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

export default function QuestionPapersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedSemester, setSelectedSemester] = useState('all');
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [selectedBatch, setSelectedBatch] = useState('all');

  const [questionPapers, setQuestionPapers] = useState<Note[]>([]);
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
    const fetchPapers = async () => {
      setIsLoading(true);
      try {
        const notesRef = collection(db, 'notes');
        const q = query(notesRef, orderBy('createdAt', 'desc'));

        const querySnapshot = await getDocs(q);
        const papersData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt.toDate(),
          } as Note;
        });
        setQuestionPapers(papersData.filter(p => p.category === 'questionPaper'));
      } catch (error) {
        console.error("Error fetching question papers:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPapers();
  }, []);

  const filteredPapers = useMemo(() => {
    return questionPapers.filter((note) => {
      const searchMatch = searchQuery
        ? note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          note.subject.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      const subjectMatch = selectedSubject !== 'all' ? note.subject === selectedSubject : true;
      const semesterMatch = selectedSemester !== 'all'
        ? String(note.semester) === selectedSemester
        : true;
      const courseMatch = selectedCourse !== 'all' ? note.course === selectedCourse : true;
      const batchMatch = selectedBatch !== 'all' ? note.batch === selectedBatch : true;
      return searchMatch && subjectMatch && semesterMatch && courseMatch && batchMatch;
    });
  }, [searchQuery, selectedSubject, selectedSemester, selectedCourse, selectedBatch, questionPapers]);

  const ptuPapers = useMemo(() => filteredPapers.filter(p => p.paperType === 'PTU'), [filteredPapers]);
  const mst1Papers = useMemo(() => filteredPapers.filter(p => p.paperType === 'MST1'), [filteredPapers]);
  const mst2Papers = useMemo(() => filteredPapers.filter(p => p.paperType === 'MST2'), [filteredPapers]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedSubject('all');
    setSelectedSemester('all');
    setSelectedCourse('all');
    setSelectedBatch('all');
  }

  const isFiltered = searchQuery || selectedSubject !== 'all' || selectedSemester !== 'all' || selectedCourse !== 'all' || selectedBatch !== 'all';

  const PaperGrid = ({ papers }: { papers: Note[] }) => {
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
    if (papers.length === 0) {
      return (
        <div className="text-center py-16 text-muted-foreground col-span-full">
          <h3 className="text-xl font-semibold">No papers found</h3>
          <p>Try adjusting your filters or search query.</p>
        </div>
      );
    }
    return (
      <>
        {papers.map((note) => (
          <NoteCard key={note.id} note={note} />
        ))}
      </>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-4 mb-8">
        <h1 className="text-4xl font-headline font-bold">Question Papers Library</h1>
        <p className="text-muted-foreground">Find previous year question papers for your exams.</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-4">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search by keyword..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger><SelectValue placeholder="Filter by Subject" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {subjects.map(subject => <SelectItem key={subject} value={subject}>{subject}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={selectedSemester} onValueChange={setSelectedSemester}>
            <SelectTrigger><SelectValue placeholder="Filter by Semester" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Semesters</SelectItem>
              {semesters.map(semester => <SelectItem key={semester} value={String(semester)}>Semester {semester}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={selectedCourse} onValueChange={setSelectedCourse}>
            <SelectTrigger><SelectValue placeholder="Filter by Course" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              {courses.map(course => <SelectItem key={course} value={course}>{course}</SelectItem>)}
            </SelectContent>
          </Select>
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

      <Tabs defaultValue="all">
        <TabsList className="mb-6 grid w-full grid-cols-4">
          <TabsTrigger value="all">All Papers</TabsTrigger>
          <TabsTrigger value="ptu">PTU</TabsTrigger>
          <TabsTrigger value="mst1">MST1</TabsTrigger>
          <TabsTrigger value="mst2">MST2</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <PaperGrid papers={filteredPapers} />
          </div>
        </TabsContent>
        <TabsContent value="ptu">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <PaperGrid papers={ptuPapers} />
          </div>
        </TabsContent>
        <TabsContent value="mst1">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <PaperGrid papers={mst1Papers} />
          </div>
        </TabsContent>
        <TabsContent value="mst2">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <PaperGrid papers={mst2Papers} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
