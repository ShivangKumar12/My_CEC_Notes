
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

interface Semester {
  id: string;
  value: number;
}

export default function AdminSemestersPage() {
  const { toast } = useToast();
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentSemester, setCurrentSemester] = useState<Semester | null>(null);
  const [semesterValue, setSemesterValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchSemesters = async () => {
    setIsLoading(true);
    const querySnapshot = await getDocs(collection(db, "semesters"));
    const semestersData = querySnapshot.docs.map(doc => ({ id: doc.id, value: doc.data().value as number }));
    setSemesters(semestersData.sort((a, b) => a.value - b.value));
    setIsLoading(false);
  };

  useEffect(() => {
    fetchSemesters();
  }, []);

  const handleOpenDialog = (semester?: Semester) => {
    if (semester) {
      setCurrentSemester(semester);
      setSemesterValue(String(semester.value));
    } else {
      setCurrentSemester(null);
      setSemesterValue('');
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setCurrentSemester(null);
    setSemesterValue('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newSemester = parseInt(semesterValue, 10);
    if (isNaN(newSemester) || newSemester < 1 || newSemester > 12) {
      toast({ title: 'Error', description: 'Please enter a valid semester number (1-12).', variant: 'destructive' });
      return;
    }

    try {
      if (currentSemester) {
        // Edit existing semester
        const semesterDoc = doc(db, 'semesters', currentSemester.id);
        await updateDoc(semesterDoc, { value: newSemester });
        toast({ title: 'Success', description: 'Semester updated successfully.' });
      } else {
        // Add new semester
        if (semesters.find(s => s.value === newSemester)) {
          toast({ title: 'Error', description: 'Semester already exists.', variant: 'destructive' });
          return;
        }
        await addDoc(collection(db, 'semesters'), { value: newSemester });
        toast({ title: 'Success', description: 'Semester added successfully.' });
      }
      fetchSemesters();
    } catch (error) {
      toast({ title: 'Error', description: 'An error occurred.', variant: 'destructive' });
      console.error(error);
    }

    handleCloseDialog();
  };
  
  const handleDelete = async (semesterId: string) => {
    try {
      await deleteDoc(doc(db, 'semesters', semesterId));
      toast({ title: 'Success', description: `Semester deleted.` });
      fetchSemesters();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete semester.', variant: 'destructive' });
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Manage Semesters</h1>
        <Button onClick={() => handleOpenDialog()}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Semester
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Semesters</CardTitle>
          <CardDescription>Add, edit, or remove semesters available on the platform.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Semester Number</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={2}>Loading...</TableCell></TableRow>
              ) : (
                semesters.map((semester) => (
                  <TableRow key={semester.id}>
                    <TableCell className="font-medium">Semester {semester.value}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(semester)}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(semester.id)}>
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
              <DialogTitle>{currentSemester ? 'Edit Semester' : 'Add New Semester'}</DialogTitle>
              <DialogDescription>
                {currentSemester ? `Make changes to the semester number.` : 'Add a new semester to the list.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="semester" className="text-right">
                  Semester
                </Label>
                <Input
                  id="semester"
                  type="number"
                  value={semesterValue}
                  onChange={(e) => setSemesterValue(e.target.value)}
                  className="col-span-3"
                  placeholder="e.g., 5"
                  min="1"
                  max="12"
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
