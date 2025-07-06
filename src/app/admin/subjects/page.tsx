"use client";

import { useState } from 'react';
import { mockNotes } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Pencil, Trash2 } from 'lucide-react';

const initialSubjects = [...new Set(mockNotes.map((note) => note.subject))];

export default function AdminSubjectsPage() {
  const { toast } = useToast();
  const [subjects, setSubjects] = useState(initialSubjects);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentSubject, setCurrentSubject] = useState<string | null>(null);
  const [subjectName, setSubjectName] = useState('');

  const handleOpenDialog = (subject?: string) => {
    if (subject) {
      setCurrentSubject(subject);
      setSubjectName(subject);
    } else {
      setCurrentSubject(null);
      setSubjectName('');
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setCurrentSubject(null);
    setSubjectName('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectName.trim()) {
      toast({ title: 'Error', description: 'Subject name cannot be empty.', variant: 'destructive' });
      return;
    }

    if (currentSubject) {
      // Edit existing subject
      setSubjects(subjects.map(s => s === currentSubject ? subjectName.trim() : s));
      toast({ title: 'Success', description: 'Subject updated successfully.' });
    } else {
      // Add new subject
      if (subjects.find(s => s.toLowerCase() === subjectName.trim().toLowerCase())) {
        toast({ title: 'Error', description: 'Subject already exists.', variant: 'destructive' });
        return;
      }
      setSubjects([...subjects, subjectName.trim()]);
      toast({ title: 'Success', description: 'Subject added successfully.' });
    }

    handleCloseDialog();
  };
  
  const handleDelete = (subjectToDelete: string) => {
    setSubjects(subjects.filter(s => s !== subjectToDelete));
    toast({ title: 'Success', description: `Subject "${subjectToDelete}" deleted.` });
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Manage Subjects</h1>
        <Button onClick={() => handleOpenDialog()}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Subject
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Subjects</CardTitle>
          <CardDescription>Add, edit, or remove subjects available on the platform.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject Name</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subjects.sort().map((subject) => (
                <TableRow key={subject}>
                  <TableCell className="font-medium">{subject}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(subject)}>
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(subject)}>
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
              <DialogTitle>{currentSubject ? 'Edit Subject' : 'Add New Subject'}</DialogTitle>
              <DialogDescription>
                {currentSubject ? `Make changes to the subject name.` : 'Add a new subject to the list of available subjects.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  className="col-span-3"
                  placeholder="e.g., Quantum Computing"
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
