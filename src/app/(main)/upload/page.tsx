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
import { Upload } from 'lucide-react';

const uploadSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters long.'),
  subject: z.string().min(3, 'Subject is required.'),
  semester: z.coerce.number().min(1).max(10),
  file: z.any().refine((files) => files?.length === 1, 'File is required.'),
});

export default function UploadPage() {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof uploadSchema>>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      title: '',
      subject: '',
      semester: 1,
    },
  });

  function onSubmit(values: z.infer<typeof uploadSchema>) {
    console.log(values);
    toast({
      title: "Upload Successful!",
      description: `Your note "${values.title}" has been submitted for review.`,
    });
    form.reset();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="font-headline text-3xl flex items-center gap-2">
            <Upload className="h-8 w-8 text-primary" />
            Upload a Note
          </CardTitle>
          <CardDescription>Share your knowledge with the community. Fill out the details below to upload your note.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Note Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Summary of Quantum Physics Chapter 3" {...field} />
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
                      <FormControl>
                        <Input placeholder="e.g., Physics" {...field} />
                      </FormControl>
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
                      <Select onValueChange={field.onChange} defaultValue={String(field.value)}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a semester" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {[...Array(8)].map((_, i) => (
                            <SelectItem key={i + 1} value={String(i + 1)}>
                              Semester {i + 1}
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
                    <FormLabel>Note File (PDF or DOC)</FormLabel>
                    <FormControl>
                      <Input type="file" accept=".pdf,.doc,.docx" onChange={(e) => onChange(e.target.files)} {...rest} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full text-lg font-bold py-6">
                Upload Note
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
