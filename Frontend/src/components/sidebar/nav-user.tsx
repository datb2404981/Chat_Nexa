import { useState } from "react"
import {
  BadgeCheck,
  Bell,
  CreditCard,
  LogOut,
  Sparkles,
  Settings,
  User,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { LogOutButton } from "../auth/logout"
import { cn } from "@/lib/utils"
import { SettingsDialog } from "@/components/settings/SettingsDialog"
import { UserProfileDialog } from "../chat/UserProfileDialog"

export function NavUser({
  user,
}: {
  user: {
    _id: string
    name: string
    email: string
    avatar: string
    bio?: string
  }
}) {
  const { isMobile, open } = useSidebar()
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  // Construct user object compatible with UserProfileDialog
  const userProfile = {
      _id: user._id,
      username: user.name,
      email: user.email,
      avatar: user.avatar,
      bio: user.bio || "Chưa có giới thiệu.",// Mock bio or fetch if available
  }

  return (
    <>
      <UserProfileDialog 
         isOpen={isProfileOpen} 
         onClose={setIsProfileOpen} 
         user={userProfile} 
         currentUser={userProfile} 
         onEditProfile={() => { setIsProfileOpen(false); setIsSettingsOpen(true); }}
      />
      <SettingsDialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className={cn(
                  "group data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground transition-all duration-300 ease-in-out border border-transparent",
                  "hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:ring-2 hover:ring-blue-500 hover:shadow-xl hover:shadow-blue-500/20 hover:border-blue-500 hover:scale-[1.02] hover:z-10",
                  open 
                    ? "w-full h-16 justify-start gap-2 px-2" 
                    : "w-11 h-11 justify-center gap-0 p-0 rounded-xl mx-auto"
                )}
              >
                <Avatar className={cn("rounded-lg transition-transform duration-300 group-hover:rotate-3 group-hover:scale-110", open ? "h-12 w-12" : "h-9 w-9")}>
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg">
                    {user.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                {open && (
                   <>
                    <div className="grid flex-1 text-left text-sm leading-tight transition-all duration-200">
                      <span className="truncate font-semibold">{user.name}</span>
                      <span className="truncate text-xs">{user.email}</span>
                    </div>
                    <Settings className="ml-auto size-4 transition-transform duration-300 group-hover:rotate-90" />
                   </>
                )}
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg border border-border bg-popover text-popover-foreground shadow-lg"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div 
                  className="flex items-center gap-2 px-1 py-1.5 text-left text-sm cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors rounded-lg m-1"
                  onClick={() => setIsProfileOpen(true)}
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="rounded-lg">
                      {user.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user.name}</span>
                    <span className="truncate text-xs">{user.email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onSelect={(e) => {
                  e.preventDefault();
                  setIsSettingsOpen(true);
                }}>
                  <Settings />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Bell />
                  Notifications
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <LogOutButton/>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </>
  )
}
