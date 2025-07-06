"use client";

import { useState } from 'react';
import { mockBatches } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Pencil, Trash2 } from 'lucide-react';

export default function AdminBatchesPage() {
  const { toast } = useToast();
  const [batches, setBatches] = useState(mockBatches);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentBatch, setCurrentBatch] = useState<string | null>(null);
  const [batchName, setBatchName] = useState('');

  const handleOpenDialog = (batch?: string) => {
    if (batch) {
      setCurrentBatch(batch);
      setBatchName(batch);
    } else {
      setCurrentBatch(null);
      setBatchName('');
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setCurrentBatch(null);
    setBatchName('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchName.trim()) {
      toast({ title: 'Error', description: 'Batch name cannot be empty.', variant: 'destructive' });
      return;
    }

    if (currentBatch) {
      // Edit existing batch
      setBatches(batches.map(s => s === currentBatch ? batchName.trim() : s));
      toast({ title: 'Success', description: 'Batch updated successfully.' });
    } else {
      // Add new batch
      if (batches.find(s => s.toLowerCase() === batchName.trim().toLowerCase())) {
        toast({ title: 'Error', description: 'Batch already exists.', variant: 'destructive' });
        return;
      }
      setBatches([...batches, batchName.trim()]);
      toast({ title: 'Success', description: 'Batch added successfully.' });
    }

    handleCloseDialog();
  };
  
  const handleDelete = (batchToDelete: string) => {
    setBatches(batches.filter(s => s !== batchToDelete));
    toast({ title: 'Success', description: `Batch "${batchToDelete}" deleted.` });
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Manage Batches</h1>
        <Button onClick={() => handleOpenDialog()}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Batch
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Batches</CardTitle>
          <CardDescription>Add, edit, or remove batches available on the platform.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Batch Name</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {batches.sort().map((batch) => (
                <TableRow key={batch}>
                  <TableCell className="font-medium">{batch}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(batch)}>
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(batch)}>
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
              <DialogTitle>{currentBatch ? 'Edit Batch' : 'Add New Batch'}</DialogTitle>
              <DialogDescription>
                {currentBatch ? `Make changes to the batch name.` : 'Add a new batch to the list of available batches.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={batchName}
                  onChange={(e) => setBatchName(e.target.value)}
                  className="col-span-3"
                  placeholder="e.g., 2021-2025"
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
