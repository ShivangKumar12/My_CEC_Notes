"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { BookOpenCheck, FileText, Home, LayoutDashboard, Users, Settings } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ThemeToggle } from "./theme-toggle"
import { Button } from "./ui/button"
import UserAuthButton from "./user-auth-button"

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/notes", label: "Notes", icon: FileText },
  { href: "/admin/users", label: "Users", icon: Users },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const { isMobile } = useSidebar()

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
                isActive={pathname.startsWith(item.href)}
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
      {isMobile && (
        <div className="p-4 border-t">
            <div className="flex justify-between items-center">
                <ThemeToggle />
                <UserAuthButton />
            </div>
        </div>
      )}
    </Sidebar>
  )
}
