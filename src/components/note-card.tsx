
"use client";

import type { Note } from '@/lib/types';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ThumbsUp, ThumbsDown, Star, Download, Eye, FileText, File, Flag } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Textarea } from './ui/textarea';
import { useApp } from '@/hooks/use-app';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';

function StarRating({ rating, totalStars = 5, onRate, interactive = false }: { rating: number; totalStars?: number; onRate?: (rating: number) => void; interactive?: boolean; }) {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="flex items-center">
      {[...Array(totalStars)].map((_, index) => {
        const starValue = index + 1;
        return (
          <Star
            key={index}
            className={cn(
              'h-5 w-5',
              starValue <= (hoverRating || rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300',
              interactive && 'cursor-pointer transition-transform hover:scale-125'
            )}
            onClick={() => interactive && onRate?.(starValue)}
            onMouseEnter={() => interactive && setHoverRating(starValue)}
            onMouseLeave={() => interactive && setHoverRating(0)}
          />
        );
      })}
    </div>
  );
}


export default function NoteCard({ note }: { note: Note }) {
  const { user } = useApp();
  const { toast } = useToast();
  const [likes, setLikes] = useState(note.likes);
  const [dislikes, setDislikes] = useState(note.dislikes);
  const [voted, setVoted] = useState<'like' | 'dislike' | null>(null);
  const [currentRating, setCurrentRating] = useState(0);
  const [newComment, setNewComment] = useState("");

  const handleAuthAction = (action: () => void, message?: string) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: message || "You need to be logged in to perform this action.",
        variant: "destructive",
      });
      return;
    }
    action();
  };

  const handleLike = () => {
    if (voted === 'like') {
      setVoted(null);
      setLikes(l => l - 1);
    } else {
      if (voted === 'dislike') {
        setDislikes(d => d - 1);
      }
      setVoted('like');
      setLikes(l => l + 1);
    }
  };

  const handleDislike = () => {
    if (voted === 'dislike') {
      setVoted(null);
      setDislikes(d => d - 1);
    } else {
      if (voted === 'like') {
        setLikes(l => l - 1);
      }
      setVoted('dislike');
      setDislikes(d => d + 1);
    }
  };

  const handleDownload = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!user) {
      e.preventDefault();
      handleAuthAction(() => {}, "Please log in to download notes.");
    }
  };
  
  const handleFeedbackSubmit = () => {
    handleAuthAction(() => {
        if (currentRating === 0) {
            toast({
                title: "Rating Required",
                description: "Please select a star rating before submitting.",
                variant: "destructive"
            });
            return;
        }
        toast({
            title: "Feedback Submitted",
            description: "Thank you for rating this note!",
        });
    }, "Please log in to rate notes.");
  }
  
  const handleReport = () => {
    handleAuthAction(() => {
      toast({
        title: "Note Reported",
        description: "Thank you, our team will review this note shortly.",
      });
    }, "You need to be logged in to report notes.");
  }
  
  const handleCommentSubmit = () => {
    handleAuthAction(() => {
      if (newComment.trim() === "") return;
      toast({
        title: "Comment Posted",
        description: "Your comment has been added to the discussion.",
      });
      setNewComment("");
      // In a real app, you would also update the state to show the new comment immediately
    }, "You need to be logged in to comment.");
  }

  return (
    <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1">
      <CardHeader>
        <div className="flex justify-between items-start gap-4">
          <CardTitle className="font-headline text-xl leading-tight">{note.title}</CardTitle>
          <div className="flex items-center flex-shrink-0">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleReport}>
                  <Flag className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>Report note</p></TooltipContent>
            </Tooltip>
            {note.fileType === 'pdf' ? <File className="h-6 w-6 text-red-500" /> : <FileText className="h-6 w-6 text-blue-500" />}
          </div>
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
            <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleAuthAction(handleLike, "Please log in to like notes.")} 
                className="flex-1 group transition-colors duration-200"
            >
                <ThumbsUp className={cn("h-4 w-4 mr-1 group-hover:text-primary transition-colors", voted === 'like' && "text-primary fill-primary/20")} /> {likes}
            </Button>
            <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleAuthAction(handleDislike, "Please log in to dislike notes.")} 
                className="flex-1 group transition-colors duration-200"
            >
                <ThumbsDown className={cn("h-4 w-4 mr-1 group-hover:text-destructive transition-colors", voted === 'dislike' && "text-destructive fill-destructive/20")} /> {dislikes}
            </Button>
        </div>
        <div className="flex items-center gap-2">
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="flex-1"><Eye className="h-4 w-4 mr-1" /> Preview</Button>
                </DialogTrigger>
                <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>{note.title}</DialogTitle>
                        <DialogDescription>
                            Uploaded by {note.uploader.name} on {new Date(note.createdAt).toLocaleDateString()}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid md:grid-cols-5 gap-6 flex-grow min-h-0">
                      <div className="md:col-span-3 relative h-full rounded-lg overflow-hidden border">
                        <Image src="https://placehold.co/800x1100.png" alt="Note preview" layout="fill" objectFit="contain" data-ai-hint="document page" />
                      </div>
                      <div className="md:col-span-2 flex flex-col h-full">
                        <h3 className="text-lg font-semibold mb-2 font-headline">Discussion</h3>
                        <Separator className="mb-4" />
                        <ScrollArea className="flex-grow pr-6 -mr-6">
                            {note.feedback.length > 0 ? (
                                note.feedback.map((fb) => (
                                <div key={fb.id} className="flex items-start space-x-3 mb-4">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={fb.user.avatarUrl} alt={fb.user.name} />
                                        <AvatarFallback>{fb.user.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                        <p className="text-sm font-medium">{fb.user.name}</p>
                                        <p className="text-xs text-muted-foreground">{formatDistanceToNow(fb.createdAt, { addSuffix: true })}</p>
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-1">{fb.comment}</p>
                                    </div>
                                </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-8">No comments yet. Be the first to start the discussion!</p>
                            )}
                        </ScrollArea>
                        <Separator className="my-4" />
                        <div className="mt-auto">
                            <Textarea 
                                placeholder={user ? "Add your comment..." : "Log in to add a comment."}
                                className="mb-2"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                disabled={!user}
                            />
                            <Button onClick={handleCommentSubmit} disabled={!user || newComment.trim() === ""} className="w-full">Post Comment</Button>
                        </div>
                      </div>
                    </div>
                </DialogContent>
            </Dialog>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button size="sm" className="flex-1">
                  <Star className="h-4 w-4 mr-1" /> Rate
                </Button>
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
                    <StarRating rating={currentRating} onRate={setCurrentRating} interactive={true} />
                  </div>
                  <Button onClick={handleFeedbackSubmit}>Submit Rating</Button>
                </div>
              </PopoverContent>
            </Popover>
        </div>
      </CardFooter>
      <div className="p-4 pt-0 text-center">
        <a href={note.fileUrl} download onClick={handleDownload}>
            <Button variant="default" className="w-full mt-2 transition-transform transform hover:scale-105">
                <Download className="h-4 w-4 mr-2" /> Download
            </Button>
        </a>
      </div>
    </Card>
  );
}
