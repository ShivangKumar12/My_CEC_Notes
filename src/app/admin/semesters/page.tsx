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

const initialSemesters = [...new Set(mockNotes.map((note) => note.semester))];

export default function AdminSemestersPage() {
  const { toast } = useToast();
  const [semesters, setSemesters] = useState(initialSemesters);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentSemester, setCurrentSemester] = useState<number | null>(null);
  const [semesterValue, setSemesterValue] = useState('');

  const handleOpenDialog = (semester?: number) => {
    if (semester) {
      setCurrentSemester(semester);
      setSemesterValue(String(semester));
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newSemester = parseInt(semesterValue, 10);
    if (isNaN(newSemester) || newSemester < 1 || newSemester > 12) {
      toast({ title: 'Error', description: 'Please enter a valid semester number (1-12).', variant: 'destructive' });
      return;
    }

    if (currentSemester) {
      // Edit existing semester
      setSemesters(semesters.map(s => s === currentSemester ? newSemester : s));
      toast({ title: 'Success', description: 'Semester updated successfully.' });
    } else {
      // Add new semester
      if (semesters.includes(newSemester)) {
        toast({ title: 'Error', description: 'Semester already exists.', variant: 'destructive' });
        return;
      }
      setSemesters([...semesters, newSemester]);
      toast({ title: 'Success', description: 'Semester added successfully.' });
    }

    handleCloseDialog();
  };
  
  const handleDelete = (semesterToDelete: number) => {
    setSemesters(semesters.filter(s => s !== semesterToDelete));
    toast({ title: 'Success', description: `Semester "${semesterToDelete}" deleted.` });
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
              {semesters.sort((a,b) => a-b).map((semester) => (
                <TableRow key={semester}>
                  <TableCell className="font-medium">Semester {semester}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(semester)}>
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(semester)}>
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
