
"use client";

import { useState, useEffect } from 'react';
import { useApp } from '@/hooks/use-app';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import type { Note } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const { user } = useApp();
  const [userNotes, setUserNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserNotes = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const notesRef = collection(db, 'notes');
        const q = query(notesRef, where('uploader.id', '==', user.uid), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const notes = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt.toDate(),
          } as Note;
        });
        setUserNotes(notes);
      } catch (error) {
        console.error("Error fetching user notes: ", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserNotes();
  }, [user]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-4 mb-8">
        <h1 className="text-4xl font-headline font-bold">My Dashboard</h1>
        <p className="text-muted-foreground">Manage your uploaded notes and view your contributions.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My Uploaded Notes</CardTitle>
          <CardDescription>You have uploaded {userNotes.length} notes.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead className="text-center">Likes</TableHead>
                  <TableHead className="text-center">Rating</TableHead>
                  <TableHead>Date Uploaded</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userNotes.map((note) => (
                  <TableRow key={note.id}>
                    <TableCell className="font-medium">{note.title}</TableCell>
                    <TableCell><Badge variant="secondary">{note.subject}</Badge></TableCell>
                    <TableCell className="text-center">{note.likes}</TableCell>
                    <TableCell className="text-center">{note.averageRating.toFixed(1)}</TableCell>
                    <TableCell>{format(note.createdAt, 'PPP')}</TableCell>
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
                          <DropdownMenuItem className="text-destructive focus:text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
