import type { Metadata } from 'next';
import { AppProvider } from '@/providers/app-provider';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import './globals.css';
import { ThemeProvider } from '@/providers/theme-provider';

export const metadata: Metadata = {
  title: 'MyCECNotes',
  description: 'A Student Notes Sharing Platform',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AppProvider>
            <TooltipProvider>
              {children}
              <Toaster />
            </TooltipProvider>
          </AppProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
