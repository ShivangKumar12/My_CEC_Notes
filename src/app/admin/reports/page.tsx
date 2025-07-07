
"use client";

import { useState, useEffect } from 'react';
import type { Note, UserProfile } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MoreHorizontal, ShieldOff, Trash2, Eye } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs, orderBy, query, doc, deleteDoc, where, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminReportsPage() {
  const [reportedNotes, setReportedNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchReportedNotes = async () => {
    setIsLoading(true);
    try {
      const notesRef = collection(db, 'notes');
      const q = query(notesRef, where('reportsCount', '>', 0), orderBy('reportsCount', 'desc'));
      const querySnapshot = await getDocs(q);
      const notesData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt.toDate(),
        } as Note;
      });
      setReportedNotes(notesData);
    } catch (error) {
      console.error("Error fetching reported notes:", error);
      toast({ title: 'Error', description: 'Could not fetch reported content.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReportedNotes();
  }, []);

  const handleDelete = async (noteId: string) => {
    if (!window.confirm("Are you sure you want to delete this content? This cannot be undone.")) return;
    try {
      await deleteDoc(doc(db, 'notes', noteId));
      toast({ title: 'Success', description: 'Content deleted successfully.' });
      fetchReportedNotes(); // Refresh list
    } catch (error) {
      console.error("Error deleting note:", error);
      toast({ title: 'Error', description: 'Failed to delete content.', variant: 'destructive' });
    }
  };
  
  const handleDismiss = async (noteId: string) => {
    if (!window.confirm("Are you sure you want to dismiss all reports for this content?")) return;
    try {
        const noteRef = doc(db, 'notes', noteId);
        await updateDoc(noteRef, {
            reportedBy: [],
            reportsCount: 0
        });
        toast({ title: 'Success', description: 'Reports dismissed.' });
        fetchReportedNotes(); // Refresh list
    } catch (error) {
        console.error("Error dismissing reports:", error);
        toast({ title: 'Error', description: 'Failed to dismiss reports.', variant: 'destructive' });
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold">Manage Reported Content</h1>
      <Card>
        <CardHeader>
          <CardTitle>Reported Content</CardTitle>
          <CardDescription>
            Review content that has been reported by users for being fake, inappropriate, or irrelevant.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Uploader</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead className="text-center">Reports</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={5}><Skeleton className="h-8 w-full" /></TableCell>
                  </TableRow>
                ))
              ) : reportedNotes.length === 0 ? (
                 <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No reported content found.
                    </TableCell>
                  </TableRow>
              ) : (
                reportedNotes.map((note) => (
                  <TableRow key={note.id}>
                    <TableCell className="font-medium">{note.title}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={(note.uploader as UserProfile).avatarUrl} alt={(note.uploader as UserProfile).name} />
                          <AvatarFallback>{(note.uploader as UserProfile).name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span>{(note.uploader as UserProfile).name}</span>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="outline">{note.subject}</Badge></TableCell>
                    <TableCell className="text-center font-bold text-destructive">{note.reportsCount}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                           <DropdownMenuItem onClick={() => handleDismiss(note.id)}>
                            <ShieldOff className="mr-2 h-4 w-4" />
                            <span>Dismiss Reports</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => window.open(note.fileUrl, '_blank')}>
                            <Eye className="mr-2 h-4 w-4" />
                            <span>Preview</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDelete(note.id)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
