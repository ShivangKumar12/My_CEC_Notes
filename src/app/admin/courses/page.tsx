"use client";

import { useState } from 'react';
import { mockCourses } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Pencil, Trash2 } from 'lucide-react';

export default function AdminCoursesPage() {
  const { toast } = useToast();
  const [courses, setCourses] = useState(mockCourses);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentCourse, setCurrentCourse] = useState<string | null>(null);
  const [courseName, setCourseName] = useState('');

  const handleOpenDialog = (course?: string) => {
    if (course) {
      setCurrentCourse(course);
      setCourseName(course);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseName.trim()) {
      toast({ title: 'Error', description: 'Course name cannot be empty.', variant: 'destructive' });
      return;
    }

    if (currentCourse) {
      // Edit existing course
      setCourses(courses.map(s => s === currentCourse ? courseName.trim() : s));
      toast({ title: 'Success', description: 'Course updated successfully.' });
    } else {
      // Add new course
      if (courses.find(s => s.toLowerCase() === courseName.trim().toLowerCase())) {
        toast({ title: 'Error', description: 'Course already exists.', variant: 'destructive' });
        return;
      }
      setCourses([...courses, courseName.trim()]);
      toast({ title: 'Success', description: 'Course added successfully.' });
    }

    handleCloseDialog();
  };
  
  const handleDelete = (courseToDelete: string) => {
    setCourses(courses.filter(s => s !== courseToDelete));
    toast({ title: 'Success', description: `Course "${courseToDelete}" deleted.` });
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
              {courses.sort().map((course) => (
                <TableRow key={course}>
                  <TableCell className="font-medium">{course}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(course)}>
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(course)}>
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
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
