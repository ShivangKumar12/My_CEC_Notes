
"use client";

import type { Note, UserProfile } from '@/lib/types';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ThumbsUp, ThumbsDown, Star, Download, Eye, Flag, User as UserIcon } from 'lucide-react';
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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { db } from '@/lib/firebase';
import { doc, updateDoc, increment, arrayUnion, arrayRemove, getDoc, writeBatch } from 'firebase/firestore';

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
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswers, setNewAnswers] = useState<{[key: string]: string}>({});

  useEffect(() => {
    if (user && note) {
      setUserInteraction(note.likedBy?.includes(user.uid) ? 'liked' : note.dislikedBy?.includes(user.uid) ? 'disliked' : null);
      setHasReported(note.reportedBy?.includes(user.uid));
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

      const userHasLiked = note.likedBy?.includes(user.uid);
      const userHasDisliked = note.dislikedBy?.includes(user.uid);
      
      // Create optimistic update objects
      const optimisticNote = JSON.parse(JSON.stringify(note));

      // Ensure arrays exist for optimistic update
      if (!optimisticNote.likedBy) optimisticNote.likedBy = [];
      if (!optimisticNote.dislikedBy) optimisticNote.dislikedBy = [];

      if (voteType === 'like') {
        if (userHasLiked) { // --- UNLIKE ---
          batch.update(noteRef, { likes: increment(-1), likedBy: arrayRemove(user.uid) });
          optimisticNote.likes--;
          optimisticNote.likedBy = optimisticNote.likedBy.filter((id: string) => id !== user.uid);
          setUserInteraction(null);
        } else { // --- LIKE ---
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
      } else { // voteType is 'dislike'
        if (userHasDisliked) { // --- UNDISLIKE ---
          batch.update(noteRef, { dislikes: increment(-1), dislikedBy: arrayRemove(user.uid) });
          optimisticNote.dislikes--;
          optimisticNote.dislikedBy = optimisticNote.dislikedBy.filter((id: string) => id !== user.uid);
          setUserInteraction(null);
        } else { // --- DISLIKE ---
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
      
      setNote(optimisticNote); // Optimistic UI update
      await batch.commit();

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
    const commentData = {
        id: crypto.randomUUID(),
        user: { id: userProfile.id, name: userProfile.name, avatarUrl: userProfile.avatarUrl },
        comment: newComment,
        createdAt: new Date(),
    };
    await updateDoc(noteRef, { feedback: arrayUnion(commentData) });
    setNote(prev => ({...prev, feedback: [...(prev.feedback || []), commentData]}));
    setNewComment("");
    toast({ title: "Comment Posted" });
  });
  
  const handleReport = () => {
    handleAuthAction(async () => {
        if (!user) return;
        if (hasReported) {
            toast({ title: "Already Reported", description: "You have already reported this content." });
            return;
        }
        if (window.confirm("Are you sure you want to report this content as inappropriate or fake?")) {
            const noteRef = doc(db, 'notes', note.id);
            await updateDoc(noteRef, {
                reportedBy: arrayUnion(user.uid),
                reportsCount: increment(1)
            });
            setHasReported(true);
            setNote(prev => ({...prev, reportsCount: prev.reportsCount + 1, reportedBy: [...(prev.reportedBy || []), user.uid]}));
            toast({ title: "Content Reported", description: "Thank you for your feedback. Admins will review this shortly." });
        }
    }, "You must be logged in to report content.");
  }


  return (
    <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1 group">
      <CardHeader>
        <div className="flex justify-between items-start gap-4">
          <CardTitle className="font-headline text-xl leading-tight">{note.title}</CardTitle>
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
        <div className="flex items-center gap-2">
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="flex-1"><Eye className="h-4 w-4 mr-1" /> Preview</Button>
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
                         <TooltipProvider>
                           <Tooltip>
                              <TooltipTrigger asChild>
                                  <Button variant="destructive" size="icon" className="absolute top-2 right-2 z-10 h-8 w-8" onClick={handleReport} disabled={hasReported}>
                                      <Flag className="h-4 w-4" />
                                  </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                  <p>{hasReported ? 'You have reported this' : 'Report this content'}</p>
                              </TooltipContent>
                           </Tooltip>
                         </TooltipProvider>
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
                <Button size="sm" className="flex-1">
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
