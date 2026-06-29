"use client"

import * as React from "react"
import {
  MessageSquareIcon,
  FileTextIcon,
  CheckSquareIcon,
  PenToolIcon,
  BellIcon,
  FolderIcon,
  SearchIcon,
  SettingsIcon,
  ShieldIcon,
  UsersIcon,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import { authClient } from "@/lib/auth-client"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  navMain: [
    {
      title: "Chat",
      url: "/chat",
      icon: <MessageSquareIcon />,
      isActive: true,
      items: [
        { title: "General", url: "/chat/general" },
        { title: "Engineering", url: "/chat/engineering" },
        { title: "Direct Messages", url: "/chat/dm" },
      ],
    },
    {
      title: "Documents",
      url: "/docs",
      icon: <FileTextIcon />,
      items: [
        { title: "All Docs", url: "/docs" },
        { title: "My Docs", url: "/docs/mine" },
        { title: "Shared with me", url: "/docs/shared" },
      ],
    },
    {
      title: "Tasks",
      url: "/tasks",
      icon: <CheckSquareIcon />,
      items: [
        { title: "My Tasks", url: "/tasks/mine" },
        { title: "Board", url: "/tasks/board" },
        { title: "All Tasks", url: "/tasks/all" },
      ],
    },
    {
      title: "Whiteboard",
      url: "/whiteboard",
      icon: <PenToolIcon />,
      items: [
        { title: "All Boards", url: "/whiteboard" },
        { title: "New Board", url: "/whiteboard/new" },
      ],
    },
    {
      title: "Files",
      url: "/files",
      icon: <FolderIcon />,
      items: [
        { title: "All Files", url: "/files" },
        { title: "My Uploads", url: "/files/mine" },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Search",
      url: "/search",
      icon: <SearchIcon />,
    },
    {
      title: "Notifications",
      url: "/notifications",
      icon: <BellIcon />,
    },
    {
      title: "Settings",
      url: "/settings",
      icon: <SettingsIcon />,
    },
  ],
  teams: [
    {
      name: "Engineering",
      url: "/teams/engineering",
      icon: <ShieldIcon />,
    },
    {
      name: "Marketing",
      url: "/teams/marketing",
      icon: <UsersIcon />,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = authClient.useSession()

  const user = session?.user
    ? { name: session.user.name, email: session.user.email, avatar: session.user.image }
    : { name: "…", email: "", avatar: null }

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<a href="/dashboard" />}>
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground font-bold text-sm">
                Z
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Zenno</span>
                <span className="truncate text-xs text-muted-foreground">Private workspace</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.teams} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
