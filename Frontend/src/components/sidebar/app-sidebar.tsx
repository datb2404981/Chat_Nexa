import * as React from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar"
import { Search, Users, User } from "lucide-react"
import { cn, getAvatarUrl } from "@/lib/utils"
import { useAuthStore } from "@/store/useAuthStore"
import { useChatStore } from "@/store/useChatStore"
import { NavUser } from "@/components/sidebar/nav-user"

import { SidebarNavItem } from "./SidebarNavItem"
import SearchChat from "../chat/SearchChat"
import NewGroupChat from "../chat/NewGroupChat"
import GroupChatList from "../chat/GroupChatList"
import AddFriendModal from "../chat/AddFriendModal"
import DirectMessageList from "../chat/DirectMessageList"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { open, setOpen } = useSidebar()
  const { user } = useAuthStore()
  const { isSearching } = useChatStore()

  const currentUser = {
    _id: user?._id || "",
    name: user?.username || "Guest",
    email: user?.email || "user@example.com",
    avatar: getAvatarUrl(user?.avatar || user?.avatarUrl),
    bio: user?.bio,
  }

  const searchRef = React.useRef<HTMLDivElement>(null)
  const groupsRef = React.useRef<HTMLDivElement>(null)
  const friendsRef = React.useRef<HTMLDivElement>(null)

  const [flashSection, setFlashSection] = React.useState<string | null>(null)

  const handleNavClick = (ref: React.RefObject<HTMLDivElement | null>, focusId?: string, sectionKey?: string) => {
    setOpen(true)
    // Wait for the sidebar to open and render content before scrolling
    setTimeout(() => {
      // Use 'start' for sections to snap to top, 'center' for inputs to keep context
      const blockPosition = focusId ? 'center' : 'start'
      ref.current?.scrollIntoView({ behavior: 'smooth', block: blockPosition })
      
      if (focusId) {
        const element = document.getElementById(focusId)
        element?.focus()
      }

      if (sectionKey) {
        setFlashSection(sectionKey)
        setTimeout(() => setFlashSection(null), 500) // Highlight for 0.1 seconds
      }
    }, 300)
  }

  // Effect to listen for flash trigger from other components (like Welcome Screen)
  React.useEffect(() => {
    const handleFlash = () => {
       // Ensure sidebar is open
       setOpen(true);
       // Trigger flash
       setFlashSection('search');
       // Scroll to search
       searchRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
       // Reset flash
       setTimeout(() => setFlashSection(null), 1000);
    };

    window.addEventListener('trigger-search-flash', handleFlash);
    return () => window.removeEventListener('trigger-search-flash', handleFlash);
  }, [setOpen]);

  return (
    // Thêm overflow-visible để Tooltip không bị cắt nếu lỡ nó render trong DOM
    <Sidebar collapsible="icon" {...props} className="bg-sidebar border-r border-sidebar-border shadow-sm z-20 overflow-visible relative">
      
      {/* 🟢 BACKDROP SPOTLIGHT: Covers entire sidebar when searching */}
      {isSearching && (
         <div 
           className="absolute inset-0 z-40 bg-white/50 dark:bg-black/60 backdrop-blur-[2px] animate-in fade-in duration-200"
           onClick={() => useChatStore.getState().setSearching(false)}
         />
      )}

      {/* 👇 1. FIX LOGO: Ép padding = 0 và dùng Flex Center */}
      <SidebarHeader className={cn(
        "h-16 transition-all duration-300 ease-in-out border-b border-transparent relative z-30", // Ensure header is below backdrop if needed, or adjust z if it should pop (User requested backdrop covers Logo) -> Backdrop z-40 covers z-30
        open ? "px-4" : "p-0 items-center justify-center" 
      )}>
        {open ? (
          <div className="flex items-center gap-3 pl-2 pr-4 mt-2 transition-all duration-300 animate-in fade-in zoom-in-95">
             <div className="flex items-center justify-center size-10 bg-gradient-to-tr from-blue-600 to-cyan-500 rounded-xl shadow-lg shadow-blue-500/20 shrink-0">
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6 text-white">
                 <path fillRule="evenodd" d="M4.804 21.644A6.707 6.707 0 0 0 6 21.75a6.721 6.721 0 0 0 3.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 0 1-.814 1.686.75.75 0 0 0 .44 1.223ZM8.25 9.75a.75.75 0 0 1 .75-.75h6a.75.75 0 0 1 0 1.5h-6a.75.75 0 0 1-.75-.75Zm0 4.5a.75.75 0 0 1 .75-.75h6a.75.75 0 0 1 0 1.5h-6a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
               </svg>
             </div>
             <div className="flex flex-col">
                <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-cyan-600">Chat Nexa</span>
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider leading-none">Messenger</span>
             </div>
          </div>
        ) : (
          <div 
            onClick={() => setOpen(true)}
            className="group relative flex items-center justify-center w-10 h-10 mt-2 bg-gradient-to-tr from-blue-600 to-cyan-500 rounded-xl shadow-xl shadow-blue-500/30 cursor-pointer overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-blue-500/40"
          >
            {/* Shine effect */}
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
            
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="currentColor" 
              className="w-6 h-6 text-white relative z-10 transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110"
            >
               <path fillRule="evenodd" d="M4.804 21.644A6.707 6.707 0 0 0 6 21.75a6.721 6.721 0 0 0 3.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 0 1-.814 1.686.75.75 0 0 0 .44 1.223ZM8.25 9.75a.75.75 0 0 1 .75-.75h6a.75.75 0 0 1 0 1.5h-6a.75.75 0 0 1-.75-.75Zm0 4.5a.75.75 0 0 1 .75-.75h6a.75.75 0 0 1 0 1.5h-6a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className={cn(
        "custom-scrollbar py-2 px-3",
        open ? "overflow-y-auto overflow-x-hidden" : "overflow-visible"
      )}> 
        
        {open ? (
          <>
            <div ref={searchRef} className="relative z-50"> 
              {/* Ensure Search is z-50 to stay ABOVE z-40 backdrop */}
              <SidebarGroup className="mb-2">
                <SidebarGroupLabel className="text-xs font-bold uppercase text-muted-foreground/70 px-4">Tìm kiếm</SidebarGroupLabel>
                <SidebarGroupContent className="px-2"><SearchChat isFlashing={flashSection === 'search'} /></SidebarGroupContent>
              </SidebarGroup>  
            </div>
            
            {/* Old Partial Backdrop Removed */}

            <div ref={groupsRef} className="group/section">
              <SidebarGroup className={cn(
                "border rounded-2xl mx-1 mt-1 mb-2 pb-2 transition-all duration-500",
                flashSection === 'groups' 
                  ? "ring-2 ring-blue-500 shadow-xl shadow-blue-500/20 bg-blue-50 dark:bg-blue-900/20 border-blue-500 mb-6 scale-[1.02]" 
                  : "border-blue-100/50 dark:border-blue-800/50 hover:border-blue-300 dark:hover:border-blue-600 bg-blue-50/10 dark:bg-blue-900/10 hover:bg-blue-50/30 dark:hover:bg-blue-900/20"
              )}>
                 <div className="flex items-center justify-between px-4 mb-2">
                   <SidebarGroupLabel className={cn("text-xs font-bold uppercase p-0 transition-colors duration-300", flashSection === 'groups' ? "text-blue-600 dark:text-blue-400" : "text-muted-foreground/70")}>Nhóm Chat</SidebarGroupLabel>
                   <NewGroupChat /> 
                </div>
                <SidebarGroupContent className="px-1"><GroupChatList /></SidebarGroupContent>
              </SidebarGroup>
            </div>

            <div ref={friendsRef} className="group/section">
              <SidebarGroup className={cn(
                "border rounded-2xl mx-1 mt-1 mb-2 pb-2 transition-all duration-500",
                flashSection === 'friends'
                  ? "ring-2 ring-blue-500 shadow-xl shadow-blue-500/20 bg-blue-50 dark:bg-blue-900/20 border-blue-500 mb-6 scale-[1.02]"
                  : "border-blue-100/50 dark:border-blue-800/50 hover:border-blue-300 dark:hover:border-blue-600 bg-blue-50/10 dark:bg-blue-900/10 hover:bg-blue-50/30 dark:hover:bg-blue-900/20"
              )}>
                <div className="flex items-center justify-between px-4 mb-2">
                  <SidebarGroupLabel className={cn("text-xs font-bold uppercase p-0 transition-colors duration-300", flashSection === 'friends' ? "text-blue-600 dark:text-blue-400" : "text-muted-foreground/70")}>Bạn bè</SidebarGroupLabel>
                  <AddFriendModal/>
                </div>
                <SidebarGroupContent className="px-1"><DirectMessageList /></SidebarGroupContent>
              </SidebarGroup>
            </div>
          </>
        ) : (
          /* ... Phần nội dung khi ĐÓNG ... */
          <div className="flex flex-col items-center gap-3 mt-4 w-full px-0"> 
             {/* px-0 để container không bị bóp nghẹt */}
            <SidebarNavItem icon={Search} label="Tìm kiếm" isCollapsed={true} onClick={() => handleNavClick(searchRef, "search-chat-input", "search")} />
            <SidebarNavItem icon={Users} label="Nhóm Chat" isCollapsed={true} onClick={() => handleNavClick(groupsRef, undefined, 'groups')} />
            <SidebarNavItem icon={User} label="Bạn bè" isCollapsed={true} onClick={() => handleNavClick(friendsRef, undefined, 'friends')} />
          </div>
        )}
      </SidebarContent>

      <SidebarFooter className={cn("border-t border-sidebar-border transition-all duration-300 mt-auto bg-sidebar z-50", open ? "p-4" : "p-0 py-4 items-center justify-center")}>
        <NavUser user={currentUser}/>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}