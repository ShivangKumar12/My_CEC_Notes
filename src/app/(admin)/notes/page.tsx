import { mockNotes } from '@/lib/mock-data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MoreHorizontal, Pencil, Trash2, Download, ThumbsUp } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminNotesPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Notes</CardTitle>
        <CardDescription>
          There are currently {mockNotes.length} notes on the platform.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Uploader</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead className="text-center">Likes</TableHead>
              <TableHead className="text-center">Downloads</TableHead>
              <TableHead>Uploaded On</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockNotes.map((note) => (
              <TableRow key={note.id}>
                <TableCell className="font-medium">{note.title}</TableCell>
                <TableCell className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={note.uploader.avatarUrl} alt={note.uploader.name} />
                        <AvatarFallback>{note.uploader.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span>{note.uploader.name}</span>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{note.subject}</Badge>
                </TableCell>
                <TableCell className="text-center">{note.likes}</TableCell>
                <TableCell className="text-center">{note.downloads}</TableCell>
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
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
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
      </CardContent>
    </Card>
  );
}
