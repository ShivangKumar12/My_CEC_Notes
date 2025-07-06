"use client";

import Loader from "@/components/loader";
import { useApp } from "@/hooks/use-app";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";

export default function AppContent({ children }: { children: React.ReactNode }) {
  const { isLoading } = useApp();

  return (
    <>
      {isLoading && <Loader />}
      <TooltipProvider>
        {children}
        <Toaster />
      </TooltipProvider>
    </>
  );
}
