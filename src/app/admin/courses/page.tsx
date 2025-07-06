
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Pencil, Trash2 } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';

interface Course {
  id: string;
  name: string;
}

export default function AdminCoursesPage() {
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentCourse, setCurrentCourse] = useState<Course | null>(null);
  const [courseName, setCourseName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchCourses = async () => {
    setIsLoading(true);
    const querySnapshot = await getDocs(collection(db, "courses"));
    const coursesData = querySnapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name as string }));
    setCourses(coursesData.sort((a, b) => a.name.localeCompare(b.name)));
    setIsLoading(false);
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleOpenDialog = (course?: Course) => {
    if (course) {
      setCurrentCourse(course);
      setCourseName(course.name);
    } else {
      setCurrentCourse(null);
      setCourseName('');
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setCurrentCourse(null);
    setCourseName('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseName.trim()) {
      toast({ title: 'Error', description: 'Course name cannot be empty.', variant: 'destructive' });
      return;
    }

    try {
      if (currentCourse) {
        // Edit existing course
        const courseDoc = doc(db, 'courses', currentCourse.id);
        await updateDoc(courseDoc, { name: courseName.trim() });
        toast({ title: 'Success', description: 'Course updated successfully.' });
      } else {
        // Add new course
        if (courses.find(s => s.name.toLowerCase() === courseName.trim().toLowerCase())) {
          toast({ title: 'Error', description: 'Course already exists.', variant: 'destructive' });
          return;
        }
        await addDoc(collection(db, 'courses'), { name: courseName.trim() });
        toast({ title: 'Success', description: 'Course added successfully.' });
      }
      fetchCourses();
    } catch (error) {
      toast({ title: 'Error', description: 'An error occurred.', variant: 'destructive' });
      console.error(error);
    }

    handleCloseDialog();
  };
  
  const handleDelete = async (courseId: string) => {
    try {
      await deleteDoc(doc(db, 'courses', courseId));
      toast({ title: 'Success', description: `Course deleted.` });
      fetchCourses();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete course.', variant: 'destructive' });
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Manage Courses</h1>
        <Button onClick={() => handleOpenDialog()}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Course
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Courses</CardTitle>
          <CardDescription>Add, edit, or remove courses available on the platform.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course Name</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={2}>Loading...</TableCell></TableRow>
              ) : (
                courses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell className="font-medium">{course.name}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(course)}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(course.id)}>
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]" onEscapeKeyDown={handleCloseDialog}>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{currentCourse ? 'Edit Course' : 'Add New Course'}</DialogTitle>
              <DialogDescription>
                {currentCourse ? `Make changes to the course name.` : 'Add a new course to the list of available courses.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  className="col-span-3"
                  placeholder="e.g., B.Tech CSE"
                  autoFocus
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">Cancel</Button>
              </DialogClose>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
