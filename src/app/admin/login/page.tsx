
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/hooks/use-app';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { BookOpenCheck, LogIn, Loader2 } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const { adminLogin } = useApp();
  const { toast } = useToast();
  const [email, setEmail] = useState('admin@mycecnotes.com');
  const [password, setPassword] = useState('admin123');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await adminLogin(email, password);
      if (result.success) {
        toast({
          title: 'Login Successful',
          description: 'Welcome back, Admin!',
        });
        router.replace('/admin/dashboard');
      } else {
        if (result.reason === 'unauthorized') {
            toast({
              title: 'Authorization Failed',
              description: 'You do not have permission to access the admin panel.',
              variant: 'destructive',
            });
        } else {
            toast({
              title: 'Login Failed',
              description: 'Invalid email or password.',
              variant: 'destructive',
            });
        }
      }
    } catch (error: any) {
      toast({
        title: 'An Error Occurred',
        description: error.message || 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm mx-auto shadow-2xl">
        <CardHeader className="text-center">
            <div className="flex justify-center items-center gap-2 mb-4">
                 <BookOpenCheck className="h-8 w-8 text-primary" />
                <span className="font-bold font-headline text-2xl">MyCECNotes</span>
            </div>
          <CardTitle className="text-2xl font-bold">Admin Panel</CardTitle>
          <CardDescription>Enter your credentials to continue.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@mycecnotes.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full font-semibold" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
