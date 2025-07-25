
"use client";

import type { Note, UserProfile, Feedback } from '@/lib/types';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ThumbsUp, ThumbsDown, Star, Download, Eye, Flag } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Textarea } from './ui/textarea';
import { useApp } from '@/hooks/use-app';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { db } from '@/lib/firebase';
import { doc, updateDoc, increment, arrayUnion, arrayRemove, getDoc, writeBatch } from 'firebase/firestore';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';


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

export default function NoteCard({ note: initialNote }: { note: Note }) {
  const { user, userProfile } = useApp();
  const { toast } = useToast();
  const [note, setNote] = useState(initialNote);
  const [userInteraction, setUserInteraction] = useState<'liked' | 'disliked' | null>(null);
  const [hasReported, setHasReported] = useState(false);

  const [currentRating, setCurrentRating] = useState(0);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    if (user && note) {
      setUserInteraction(note.likedBy?.includes(user.uid) ? 'liked' : note.dislikedBy?.includes(user.uid) ? 'disliked' : null);
      setHasReported(note.reportedBy?.includes(user.uid) ?? false);
    } else {
      setUserInteraction(null);
      setHasReported(false);
    }
  }, [user, note]);

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

  const handleVote = async (voteType: 'like' | 'dislike') => {
    handleAuthAction(async () => {
      if (!user) return;
      const noteRef = doc(db, 'notes', note.id);
      
      const batch = writeBatch(db);

      // Create a deep copy for optimistic update, ensuring arrays exist
      const optimisticNote = JSON.parse(JSON.stringify(note));
      optimisticNote.likedBy = optimisticNote.likedBy || [];
      optimisticNote.dislikedBy = optimisticNote.dislikedBy || [];

      const userHasLiked = optimisticNote.likedBy.includes(user.uid);
      const userHasDisliked = optimisticNote.dislikedBy.includes(user.uid);

      if (voteType === 'like') {
        if (userHasLiked) { 
          batch.update(noteRef, { likes: increment(-1), likedBy: arrayRemove(user.uid) });
          optimisticNote.likes--;
          optimisticNote.likedBy = optimisticNote.likedBy.filter((id: string) => id !== user.uid);
          setUserInteraction(null);
        } else { 
          batch.update(noteRef, { likes: increment(1), likedBy: arrayUnion(user.uid) });
          optimisticNote.likes++;
          optimisticNote.likedBy.push(user.uid);
          if (userHasDisliked) {
            batch.update(noteRef, { dislikes: increment(-1), dislikedBy: arrayRemove(user.uid) });
            optimisticNote.dislikes--;
            optimisticNote.dislikedBy = optimisticNote.dislikedBy.filter((id: string) => id !== user.uid);
          }
          setUserInteraction('liked');
        }
      } else { 
        if (userHasDisliked) { 
          batch.update(noteRef, { dislikes: increment(-1), dislikedBy: arrayRemove(user.uid) });
          optimisticNote.dislikes--;
          optimisticNote.dislikedBy = optimisticNote.dislikedBy.filter((id: string) => id !== user.uid);
          setUserInteraction(null);
        } else { 
          batch.update(noteRef, { dislikes: increment(1), dislikedBy: arrayUnion(user.uid) });
          optimisticNote.dislikes++;
          optimisticNote.dislikedBy.push(user.uid);
          if (userHasLiked) {
            batch.update(noteRef, { likes: increment(-1), likedBy: arrayRemove(user.uid) });
            optimisticNote.likes--;
            optimisticNote.likedBy = optimisticNote.likedBy.filter((id: string) => id !== user.uid);
          }
          setUserInteraction('disliked');
        }
      }
      
      setNote(optimisticNote); 
      await batch.commit().catch(err => {
        console.error("Failed to vote:", err);
        setNote(initialNote); // Revert on failure
        toast({ title: "Error", description: "Could not cast vote. Please try again.", variant: "destructive" });
      });

    }, "You must be logged in to vote.");
  };

  const handleDownload = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!user) {
      e.preventDefault();
      handleAuthAction(() => {}, "Please log in to download files.");
      return;
    }
    try {
        const noteRef = doc(db, 'notes', note.id);
        await updateDoc(noteRef, { downloads: increment(1) });
        setNote(prev => ({...prev, downloads: prev.downloads + 1}));
    } catch (error) {
        console.error("Error incrementing download count", error)
    }
  };

  const handleFeedbackSubmit = () => handleAuthAction(async () => {
    if (currentRating === 0) {
        toast({ title: "Rating Required", description: "Please select a star rating.", variant: "destructive" });
        return;
    }
    const noteRef = doc(db, 'notes', note.id);
    const noteSnap = await getDoc(noteRef);
    if (!noteSnap.exists()) return;

    const noteData = noteSnap.data();
    const newRatingsCount = noteData.ratingsCount + 1;
    const newAverageRating = ((noteData.averageRating * noteData.ratingsCount) + currentRating) / newRatingsCount;

    await updateDoc(noteRef, {
        averageRating: newAverageRating,
        ratingsCount: newRatingsCount
    });

    setNote(prev => ({...prev, averageRating: newAverageRating, ratingsCount: newRatingsCount}));
    
    toast({ title: "Feedback Submitted", description: "Thank you for rating!" });
  });

  const handleCommentSubmit = () => handleAuthAction(async () => {
    if (newComment.trim() === "" || !userProfile) return;
    const noteRef = doc(db, 'notes', note.id);
    const commentData: Feedback = {
        id: crypto.randomUUID(),
        user: { id: userProfile.id, name: userProfile.name, avatarUrl: userProfile.avatarUrl },
        comment: newComment,
        createdAt: new Date(),
        rating: 0, // Comment is not a rating
    };
    await updateDoc(noteRef, { feedback: arrayUnion(commentData) });
    const updatedFeedback = [...(note.feedback || []), commentData];
    setNote(prev => ({...prev, feedback: updatedFeedback }));
    setNewComment("");
    toast({ title: "Comment Posted" });
  });
  
  const handleReportClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      handleAuthAction(() => {}, "You must be logged in to report content.");
    }
  };

  const confirmReport = async () => {
    if (!user) {
      toast({ title: "Login Required", description: "You must be logged in to report content.", variant: "destructive" });
      return;
    }
    if (hasReported) {
      toast({ title: "Already Reported", description: "You have already reported this content." });
      return;
    }
    
    try {
      const noteRef = doc(db, 'notes', note.id);
      await updateDoc(noteRef, {
        reportedBy: arrayUnion(user.uid),
        reportsCount: increment(1)
      });
      
      const optimisticNote = JSON.parse(JSON.stringify(note));
      optimisticNote.reportedBy = [...(optimisticNote.reportedBy || []), user.uid];
      optimisticNote.reportsCount++;
      setNote(optimisticNote);
      setHasReported(true);

      toast({ title: "Content Reported", description: "Thank you for your feedback. Admins will review this shortly." });
    } catch (error) {
      console.error("Error reporting note:", error);
      toast({ title: "Error", description: "An error occurred while reporting.", variant: "destructive"});
    }
  };


  return (
    <Card className="relative flex flex-col h-full overflow-hidden transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1 group">
      <AlertDialog>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <AlertDialogTrigger asChild>
                <Button
                  variant={hasReported ? "destructive" : "ghost"}
                  size="icon"
                  className="absolute top-2 right-2 z-10 h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  onClick={handleReportClick}
                  disabled={hasReported}
                >
                  <Flag className="h-4 w-4" />
                  <span className="sr-only">Report</span>
                </Button>
              </AlertDialogTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>{hasReported ? 'You have reported this' : 'Report this content'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to report this content?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will flag the content for review by an administrator for being fake, inappropriate, or irrelevant. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmReport} className={buttonVariants({ variant: "destructive" })}>Report</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <CardHeader>
        <div className="flex justify-between items-start gap-4">
          <CardTitle className="font-headline text-xl leading-tight pr-8">{note.title}</CardTitle>
        </div>
        <CardDescription className="flex flex-wrap gap-2">
          {note.category === 'questionPaper' && note.paperType && (
            <Badge variant="destructive">{note.paperType}</Badge>
          )}
          <Badge variant="secondary">{note.subject}</Badge>
          <Badge variant="outline">Sem {note.semester}</Badge>
          <Badge variant="outline">{note.course}</Badge>
          <Badge variant="outline">{note.batch}</Badge>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <div className="flex items-center space-x-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={(note.uploader as UserProfile)?.avatarUrl} alt={(note.uploader as UserProfile)?.name} />
            <AvatarFallback>{(note.uploader as UserProfile)?.name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium text-muted-foreground">{(note.uploader as UserProfile)?.name}</span>
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
            <Button variant={userInteraction === 'liked' ? 'default' : 'outline'} size="sm" className="flex-1" onClick={() => handleVote('like')}>
                <ThumbsUp className="h-4 w-4 mr-1" /> {note.likes || 0}
            </Button>
            <Button variant={userInteraction === 'disliked' ? 'destructive' : 'outline'} size="sm" className="flex-1" onClick={() => handleVote('dislike')}>
                <ThumbsDown className="h-4 w-4 mr-1" /> {note.dislikes || 0}
            </Button>
        </div>
        <div className="flex items-center justify-end gap-2">
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="outline" size="sm"><Eye className="h-4 w-4 mr-1" /> Preview</Button>
                </DialogTrigger>
                <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>{note.title}</DialogTitle>
                        <DialogDescription>
                            Uploaded by {(note.uploader as UserProfile)?.name} on {new Date(note.createdAt).toLocaleDateString()}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid md:grid-cols-5 gap-6 flex-grow min-h-0">
                      <div className="md:col-span-3 relative h-full rounded-lg overflow-hidden border">
                        <iframe src={note.fileUrl} className="w-full h-full" title="File Preview"></iframe>
                      </div>
                      <div className="md:col-span-2 flex flex-col h-full">
                        <Tabs defaultValue="discussion" className="flex flex-col h-full">
                            <TabsList className="mb-4 w-full grid grid-cols-2">
                                <TabsTrigger value="discussion">Discussion</TabsTrigger>
                                <TabsTrigger value="qna">Q&amp;A (WIP)</TabsTrigger>
                            </TabsList>
                            <TabsContent value="discussion" className="flex-grow flex flex-col min-h-0">
                                <ScrollArea className="flex-grow pr-6 -mr-6">
                                    {note.feedback?.length > 0 ? (
                                        note.feedback.map((fb) => (
                                        <div key={fb.id} className="flex items-start space-x-3 mb-4">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={fb.user.avatarUrl} alt={fb.user.name} />
                                                <AvatarFallback>{fb.user.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                <p className="text-sm font-medium">{fb.user.name}</p>
                                                <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(fb.createdAt), { addSuffix: true })}</p>
                                                </div>
                                                <p className="text-sm text-muted-foreground mt-1">{fb.comment}</p>
                                            </div>
                                        </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-muted-foreground text-center py-8">No comments yet.</p>
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
                            </TabsContent>
                            <TabsContent value="qna" className="flex-grow flex flex-col min-h-0 text-center text-muted-foreground pt-16">
                                <p>Q&A Functionality is a work in progress!</p>
                            </TabsContent>
                        </Tabs>
                      </div>
                    </div>
                </DialogContent>
            </Dialog>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button size="sm">
                  <Star className="h-4 w-4 mr-1" /> Rate
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium leading-none">Rate this content</h4>
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
        <a href={note.fileUrl} download target="_blank" rel="noopener noreferrer" onClick={handleDownload}>
            <Button variant="default" className="w-full mt-2 transition-transform transform hover:scale-105">
                <Download className="h-4 w-4 mr-2" /> Download
            </Button>
        </a>
      </div>
    </Card>
  );
}
