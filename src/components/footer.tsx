
import Link from 'next/link';
import { BookOpenCheck, Github, Linkedin, Instagram } from 'lucide-react';

const subjects = ['Data Structures', 'Operating Systems', 'Computer Networks', 'Database Systems', 'Machine Learning', 'Mathematics'];
const socialLinks = [
  { icon: Instagram, href: '#', name: 'Instagram' },
  { icon: Github, href: '#', name: 'GitHub' },
  { icon: Linkedin, href: '#', name: 'LinkedIn' },
];

export default function Footer() {
  return (
    <footer className="bg-card border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-8">
          <div className="col-span-1 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 font-bold font-headline text-xl mb-2">
              <BookOpenCheck className="h-7 w-7 text-primary" />
              <span>MyCECNotes</span>
            </Link>
            <p className="text-muted-foreground text-sm max-w-xs">
              Your centralized hub for sharing and discovering student-authored notes.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-card-foreground mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/notes" className="text-muted-foreground hover:text-primary transition-colors">Explore Notes</Link></li>
              <li><Link href="/upload" className="text-muted-foreground hover:text-primary transition-colors">Upload a Note</Link></li>
              <li><Link href="/dashboard" className="text-muted-foreground hover:text-primary transition-colors">My Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-card-foreground mb-4">Popular Subjects</h3>
            <ul className="space-y-2 text-sm">
              {subjects.slice(0, 4).map(subject => (
                <li key={subject}>
                  <Link href={`/notes?subject=${encodeURIComponent(subject)}`} className="text-muted-foreground hover:text-primary transition-colors">
                    {subject}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-card-foreground mb-4">Follow Us</h3>
            <div className="flex items-center space-x-4">
              {socialLinks.map(link => (
                <a key={link.name} href={link.href} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                  <link.icon className="h-5 w-5" />
                  <span className="sr-only">{link.name}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t flex flex-col sm:flex-row justify-between items-center text-sm text-muted-foreground">
          <div className="text-center sm:text-left">
            <p>&copy; {new Date().getFullYear()} MyCECNotes. All Rights Reserved.</p>
          </div>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-primary transition-colors">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
