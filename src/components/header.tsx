'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpenCheck, Home, Upload, User as UserIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import UserAuthButton from './user-auth-button';

const navLinks = [
  { href: '/notes', label: 'Notes', icon: Home },
  { href: '/upload', label: 'Upload', icon: Upload },
  { href: '/dashboard', label: 'Dashboard', icon: UserIcon },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex items-center">
          <Link href="/" className="flex items-center gap-2 font-bold font-headline text-lg">
            <BookOpenCheck className="h-6 w-6 text-primary" />
            <span>NoteVault</span>
          </Link>
        </div>
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'transition-colors hover:text-foreground/80',
                pathname === link.href ? 'text-foreground' : 'text-foreground/60'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <UserAuthButton />
        </div>
      </div>
    </header>
  );
}
