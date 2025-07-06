
"use client";

import { useState, useEffect } from 'react';
import type { Note, UserProfile } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MoreHorizontal, Pencil, Trash2, Eye } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs, orderBy, query, doc, deleteDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminNotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchNotes = async () => {
    setIsLoading(true);
    try {
      const notesRef = collection(db, 'notes');
      const q = query(notesRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const notesData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt.toDate(),
        } as Note;
      });
      setNotes(notesData);
    } catch (error) {
      console.error("Error fetching notes:", error);
      toast({ title: 'Error', description: 'Could not fetch notes.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleDelete = async (noteId: string) => {
    if (!window.confirm("Are you sure you want to delete this content? This cannot be undone.")) return;
    try {
      await deleteDoc(doc(db, 'notes', noteId));
      toast({ title: 'Success', description: 'Content deleted successfully.' });
      fetchNotes(); // Refresh list
    } catch (error) {
      console.error("Error deleting note:", error);
      toast({ title: 'Error', description: 'Failed to delete content.', variant: 'destructive' });
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold">Manage Content</h1>
      <Card>
        <CardHeader>
          <CardTitle>All Content</CardTitle>
          <CardDescription>
            A list of all notes and question papers uploaded to the platform.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Uploader</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Downloads</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={7}><Skeleton className="h-8 w-full" /></TableCell>
                  </TableRow>
                ))
              ) : (
                notes.map((note) => (
                  <TableRow key={note.id}>
                    <TableCell className="font-medium">{note.title}</TableCell>
                    <TableCell>
                      {note.category === 'questionPaper' ? (
                        <Badge variant="destructive">{note.paperType}</Badge>
                      ) : (
                        <Badge variant="secondary">Note</Badge>
                      )}
                    </TableCell>
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
                    <TableCell>{note.downloads}</TableCell>
                    <TableCell>{note.averageRating.toFixed(1)} ({note.ratingsCount})</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Pencil className="mr-2 h-4 w-4" />
                            <span>Edit</span>
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
