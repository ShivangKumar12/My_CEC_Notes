
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

interface Subject {
  id: string;
  name: string;
}

export default function AdminSubjectsPage() {
  const { toast } = useToast();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentSubject, setCurrentSubject] = useState<Subject | null>(null);
  const [subjectName, setSubjectName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchSubjects = async () => {
    setIsLoading(true);
    const querySnapshot = await getDocs(collection(db, "subjects"));
    const subjectsData = querySnapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name as string }));
    setSubjects(subjectsData.sort((a, b) => a.name.localeCompare(b.name)));
    setIsLoading(false);
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleOpenDialog = (subject?: Subject) => {
    if (subject) {
      setCurrentSubject(subject);
      setSubjectName(subject.name);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectName.trim()) {
      toast({ title: 'Error', description: 'Subject name cannot be empty.', variant: 'destructive' });
      return;
    }

    try {
      if (currentSubject) {
        // Edit existing subject
        const subjectDoc = doc(db, 'subjects', currentSubject.id);
        await updateDoc(subjectDoc, { name: subjectName.trim() });
        toast({ title: 'Success', description: 'Subject updated successfully.' });
      } else {
        // Add new subject
        if (subjects.find(s => s.name.toLowerCase() === subjectName.trim().toLowerCase())) {
          toast({ title: 'Error', description: 'Subject already exists.', variant: 'destructive' });
          return;
        }
        await addDoc(collection(db, 'subjects'), { name: subjectName.trim() });
        toast({ title: 'Success', description: 'Subject added successfully.' });
      }
      fetchSubjects();
    } catch (error) {
      toast({ title: 'Error', description: 'An error occurred.', variant: 'destructive' });
      console.error(error);
    }
    
    handleCloseDialog();
  };
  
  const handleDelete = async (subjectId: string) => {
    try {
      await deleteDoc(doc(db, 'subjects', subjectId));
      toast({ title: 'Success', description: `Subject deleted.` });
      fetchSubjects();
    } catch (error) {
        toast({ title: 'Error', description: 'Failed to delete subject.', variant: 'destructive' });
    }
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
              {isLoading ? (
                <TableRow><TableCell colSpan={2}>Loading...</TableCell></TableRow>
              ) : (
                subjects.map((subject) => (
                  <TableRow key={subject.id}>
                    <TableCell className="font-medium">{subject.name}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(subject)}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(subject.id)}>
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
