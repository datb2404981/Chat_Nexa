import * as React from "react"
import { Plus } from "lucide-react"

import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
} from "@/components/ui/sidebar"

export function TeamSwitcher() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground h-16"
        >
          <div className="flex aspect-square size-11 items-center justify-center rounded-lg">
            <img src="/Logo%20App%20Chat.png" alt="Logo" className="size-11 object-contain rounded-lg" />
          </div>
          <div className="grid flex-1 text-left leading-tight">
            <span className="bg-gradient-to-r from-[#3b82f6] to-[#06b6d4] bg-clip-text text-transparent text-xl font-extrabold drop-shadow-sm">Chat Nexa !</span>
            <span className="truncate text-sm font-medium text-muted-foreground">Messaging App</span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
