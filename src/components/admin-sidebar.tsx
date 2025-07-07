
"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { BookOpenCheck, FileText, GraduationCap, LayoutDashboard, Library, Users, BookCopy, Users2, LogOut, Flag } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useApp } from "@/hooks/use-app"

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/notes", label: "Content", icon: FileText },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/reports", label: "Reports", icon: Flag },
  { href: "/admin/subjects", label: "Subjects", icon: Library },
  { href: "/admin/semesters", label: "Semesters", icon: GraduationCap },
  { href: "/admin/courses", label: "Courses", icon: BookCopy },
  { href: "/admin/batches", label: "Batches", icon: Users2 },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter();
  const { adminLogout } = useApp();

  const handleLogout = () => {
    adminLogout();
    router.push('/admin/login');
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 group-data-[collapsible=icon]:hidden">
                <BookOpenCheck className="h-6 w-6 text-primary" />
                <span className="font-bold text-lg">MyCECNotes</span>
            </div>
            <SidebarTrigger />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href || (item.href !== "/admin/dashboard" && pathname.startsWith(item.href))}
                tooltip={{ children: item.label }}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout} tooltip={{ children: 'Logout' }}>
                    <LogOut />
                    <span>Logout</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
