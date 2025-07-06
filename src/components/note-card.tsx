"use client";

import type { Note } from '@/lib/types';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ThumbsUp, ThumbsDown, Star, Download, Eye, FileText, File } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Textarea } from './ui/textarea';

function StarRating({ rating, totalStars = 5 }: { rating: number; totalStars?: number }) {
  return (
    <div className="flex items-center">
      {[...Array(totalStars)].map((_, index) => (
        <Star
          key={index}
          className={cn(
            'h-5 w-5',
            index < Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
          )}
        />
      ))}
    </div>
  );
}

export default function NoteCard({ note }: { note: Note }) {
  const [likes, setLikes] = useState(note.likes);
  const [dislikes, setDislikes] = useState(note.dislikes);

  const handleLike = () => {
    setLikes(likes + 1);
  };

  const handleDislike = () => {
    setDislikes(dislikes + 1);
  };

  return (
    <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="font-headline text-xl leading-tight pr-4">{note.title}</CardTitle>
          {note.fileType === 'pdf' ? <File className="h-6 w-6 text-red-500 flex-shrink-0" /> : <FileText className="h-6 w-6 text-blue-500 flex-shrink-0" />}
        </div>
        <CardDescription>
          <Badge variant="secondary">{note.subject}</Badge>
          <Badge variant="outline" className="ml-2">Sem {note.semester}</Badge>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <div className="flex items-center space-x-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={note.uploader.avatarUrl} alt={note.uploader.name} />
            <AvatarFallback>{note.uploader.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium text-muted-foreground">{note.uploader.name}</span>
        </div>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
                <StarRating rating={note.averageRating} />
                <span>({note.ratingsCount})</span>
            </div>
          <div className="flex items-center gap-1">
            <Download className="h-4 w-4" />
            <span>{note.downloads}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="grid grid-cols-2 gap-2">
        <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleLike} className="flex-1 group transition-colors duration-200">
                <ThumbsUp className="h-4 w-4 mr-1 group-hover:text-primary transition-colors" /> {likes}
            </Button>
            <Button variant="outline" size="sm" onClick={handleDislike} className="flex-1 group transition-colors duration-200">
                <ThumbsDown className="h-4 w-4 mr-1 group-hover:text-destructive transition-colors" /> {dislikes}
            </Button>
        </div>
        <div className="flex items-center gap-2">
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="flex-1"><Eye className="h-4 w-4 mr-1" /> Preview</Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl h-[90vh]">
                    <DialogHeader>
                        <DialogTitle>{note.title}</DialogTitle>
                        <DialogDescription>
                            A preview of the document. For demo purposes, this is an image.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="relative h-full w-full mt-4">
                        <Image src="https://placehold.co/800x1100.png" alt="Note preview" layout="fill" objectFit="contain" data-ai-hint="document page" />
                    </div>
                </DialogContent>
            </Dialog>
            
            <Popover>
                <PopoverTrigger asChild>
                    <Button size="sm" className="flex-1"><Star className="h-4 w-4 mr-1" /> Rate</Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium leading-none">Rate this note</h4>
                      <p className="text-sm text-muted-foreground">
                        Share your feedback with the community.
                      </p>
                    </div>
                    <div className="flex justify-center">
                      <StarRating rating={0} />
                    </div>
                    <Textarea placeholder="Optional: Add a comment..." />
                    <Button>Submit Feedback</Button>
                  </div>
                </PopoverContent>
            </Popover>
        </div>
      </CardFooter>
      <div className="p-1 text-center">
        <a href={note.fileUrl} download>
            <Button variant="default" className="w-full mt-2 transition-transform transform hover:scale-105">
                <Download className="h-4 w-4 mr-2" /> Download
            </Button>
        </a>
      </div>
    </Card>
  );
}
