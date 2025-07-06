"use client";

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from '@/hooks/use-app';
import AdminSidebar from '@/components/admin-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAdmin } = useApp();

  useEffect(() => {
    // This effect handles the auth protection logic on the client-side.
    if (typeof isAdmin === 'boolean') {
      if (!isAdmin && pathname !== '/admin/login') {
        router.push('/admin/login');
      } else if (isAdmin && pathname === '/admin/login') {
        router.push('/admin/dashboard');
      }
    }
  }, [isAdmin, pathname, router]);
  
  // While checking auth, render nothing to prevent content flashing.
  if (typeof isAdmin !== 'boolean' && pathname !== '/admin/login') {
    return null; 
  }

  // The login page has its own full-page layout, so we don't render the sidebar.
  if (!isAdmin && pathname === '/admin/login') {
    return <>{children}</>;
  }
  
  // If the user is an admin, show the main admin layout.
  if (isAdmin) {
    return (
      <SidebarProvider>
          <div className="flex min-h-screen bg-muted/40">
              <AdminSidebar />
              <main className="flex-1 p-4 sm:p-6 lg:p-8">
                  {children}
              </main>
          </div>
      </SidebarProvider>
    );
  }

  return null;
}
