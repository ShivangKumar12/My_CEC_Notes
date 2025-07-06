import AdminSidebar from "@/components/admin-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import UserAuthButton from "@/components/user-auth-button";
import { Home } from "lucide-react";
import Link from "next/link";


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
        <AdminSidebar />
        <SidebarInset>
            <header className="flex h-16 items-center justify-between border-b px-4 md:justify-end">
                <SidebarTrigger className="md:hidden" />
                <div className="flex items-center gap-4">
                    <Button variant="ghost" asChild>
                        <Link href="/">
                            <Home className="mr-2" />
                            <span>Home</span>
                        </Link>
                    </Button>
                    <ThemeToggle />
                    <UserAuthButton />
                </div>
            </header>
            <main className="p-4 md:p-8">
                {children}
            </main>
        </SidebarInset>
    </SidebarProvider>
  );
}
