
"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Upload, Loader2 } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useState, useEffect } from 'react';
import { useApp } from '@/hooks/use-app';
import { db, storage } from '@/lib/firebase';
import { collection, addDoc, getDocs, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

const uploadSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters long.'),
  category: z.enum(['note', 'questionPaper'], { required_error: 'Please select a category.' }),
  paperType: z.enum(['PTU', 'MST1', 'MST2']).optional(),
  subject: z.string({ required_error: 'Subject is required.' }).min(1, 'Subject is required.'),
  semester: z.coerce.number({ required_error: 'Semester is required.' }).min(1).max(10),
  course: z.string({ required_error: 'Course is required.' }).min(1, 'Course is required.'),
  batch: z.string({ required_error: 'Batch is required.' }).min(1, 'Batch is required.'),
  file: z.any().refine((files) => files?.length === 1, 'File is required.'),
}).refine(data => {
    if (data.category === 'questionPaper' && !data.paperType) {
        return false;
    }
    return true;
}, {
    message: 'Paper type is required for question papers.',
    path: ['paperType']
});

export default function UploadPage() {
  const { user } = useApp();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [semesters, setSemesters] = useState<number[]>([]);
  const [courses, setCourses] = useState<string[]>([]);
  const [batches, setBatches] = useState<string[]>([]);

  const form = useForm<z.infer<typeof uploadSchema>>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      title: '',
      category: 'note',
    },
  });
  
  useEffect(() => {
    const fetchMetadata = async () => {
      const [subjectsSnap, semestersSnap, coursesSnap, batchesSnap] = await Promise.all([
        getDocs(collection(db, 'subjects')),
        getDocs(collection(db, 'semesters')),
        getDocs(collection(db, 'courses')),
        getDocs(collection(db, 'batches')),
      ]);
      setSubjects(subjectsSnap.docs.map(d => d.data().name).sort());
      setSemesters(semestersSnap.docs.map(d => d.data().value).sort((a:number, b:number) => a - b));
      setCourses(coursesSnap.docs.map(d => d.data().name).sort());
      setBatches(batchesSnap.docs.map(d => d.data().name).sort());
    };
    
    fetchMetadata();
  }, []);
  
  const category = form.watch('category');

  async function onSubmit(values: z.infer<typeof uploadSchema>) {
    if (!user) {
      toast({ title: 'Error', description: 'You must be logged in to upload.', variant: 'destructive' });
      return;
    }
    setIsUploading(true);
    try {
      const file = values.file[0] as File;
      const fileId = uuidv4();
      const fileExtension = file.name.split('.').pop();
      const storageRef = ref(storage, `notes/${fileId}.${fileExtension}`);
      
      const uploadTask = uploadBytesResumable(storageRef, file);

      await uploadTask;
      
      const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

      const noteData = {
        title: values.title,
        category: values.category,
        paperType: values.paperType || null,
        subject: values.subject,
        semester: values.semester,
        course: values.course,
        batch: values.batch,
        fileUrl: downloadURL,
        fileType: fileExtension === 'pdf' ? 'pdf' : 'doc',
        thumbnailUrl: 'https://placehold.co/400x300.png',
        uploader: {
          id: user.uid,
          name: user.displayName,
          avatarUrl: user.photoURL,
        },
        likes: 0,
        dislikes: 0,
        averageRating: 0,
        ratingsCount: 0,
        downloads: 0,
        feedback: [],
        qna: [],
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'notes'), noteData);

      toast({
        title: "Upload Successful!",
        description: `Your ${values.category === 'note' ? 'note' : 'paper'} "${values.title}" has been submitted.`,
      });
      form.reset();
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: 'Upload Failed',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="font-headline text-3xl flex items-center gap-2">
            <Upload className="h-8 w-8 text-primary" />
            Upload Notes & Question Papers
          </CardTitle>
          <CardDescription>Share your study notes or previous year question papers with the community.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Content Type</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={(value) => {
                          field.onChange(value);
                          if (value === 'note') {
                            form.setValue('paperType', undefined);
                          }
                        }}
                        defaultValue={field.value}
                        className="flex items-center space-x-4"
                        disabled={isUploading}
                      >
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="note" />
                          </FormControl>
                          <FormLabel className="font-normal">Note</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="questionPaper" />
                          </FormControl>
                          <FormLabel className="font-normal">Question Paper</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {category === 'questionPaper' && (
                <FormField
                  control={form.control}
                  name="paperType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Paper Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isUploading}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a paper type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="PTU">PTU</SelectItem>
                          <SelectItem value="MST1">MST1</SelectItem>
                          <SelectItem value="MST2">MST2</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Summary of Quantum Physics Chapter 3" {...field} disabled={isUploading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isUploading}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a subject" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {subjects.map((subject) => (
                            <SelectItem key={subject} value={subject}>
                              {subject}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="semester"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Semester</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={String(field.value)} disabled={isUploading}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a semester" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {semesters.map((semester) => (
                            <SelectItem key={semester} value={String(semester)}>
                              Semester {semester}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="course"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isUploading}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a course" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {courses.map((course) => (
                            <SelectItem key={course} value={course}>
                              {course}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="batch"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Batch</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isUploading}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a batch" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {batches.map((batch) => (
                            <SelectItem key={batch} value={batch}>
                              {batch}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="file"
                render={({ field: { onChange, value, ...rest } }) => (
                  <FormItem>
                    <FormLabel>File (PDF or DOC/DOCX)</FormLabel>
                    <FormControl>
                      <Input type="file" accept=".pdf,.doc,.docx" onChange={(e) => onChange(e.target.files)} {...rest} disabled={isUploading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full text-lg font-bold py-6" disabled={isUploading}>
                {isUploading ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : null}
                {isUploading ? 'Uploading...' : 'Upload Content'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
