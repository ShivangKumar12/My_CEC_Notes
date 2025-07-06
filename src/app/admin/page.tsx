"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/hooks/use-app';

export default function AdminRootPage() {
  const router = useRouter();
  const { isAdmin } = useApp();

  useEffect(() => {
    if (typeof isAdmin === 'boolean') {
      if (isAdmin) {
        router.replace('/admin/dashboard');
      } else {
        router.replace('/admin/login');
      }
    }
  }, [isAdmin, router]);

  return null; // Render nothing while redirecting
}
