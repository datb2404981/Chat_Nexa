import { cn, formatMessageTime } from "@/lib/utils";
import React from "react";


import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Pin, Trash2, MoreHorizontal } from "lucide-react"

interface ChatCardProps {
  convoId: string;
  name: string;
  timestamp?: Date | string;
  isActive: boolean;
  onSelect: (id: string) => void;
  unreadCount?: number;
  leftSection: React.ReactNode; // Avatar
  subtitle: React.ReactNode; // Last message content
}

const ChatCard = ({
  convoId,
  name,
  timestamp,
  isActive,
  onSelect,
  unreadCount = 0,
  leftSection,
  subtitle
}: ChatCardProps) => {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div key={convoId}
          className={cn(
            "group relative flex items-center gap-2.5 p-2 rounded-xl cursor-pointer transition-all duration-300 ease-in-out border",
            isActive 
              ? "bg-blue-100 dark:bg-blue-900/40 border-blue-500 shadow-md" 
              : "border-transparent hover:bg-blue-50 dark:hover:bg-blue-900/20",
            // Hover effect matching the requested style "pop out"
            "hover:ring-2 hover:ring-blue-500 hover:shadow-xl hover:shadow-blue-500/20 hover:border-blue-500 hover:scale-[1.02] hover:z-10"
          )}
          onClick={() => onSelect(convoId)}
        >
          <div className="relative shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">{leftSection}</div>
          
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <div className="flex items-center justify-between gap-2">
              <h3 className={cn("text-sm transition-colors truncate",
                isActive ? "font-bold text-primary" : "font-semibold text-foreground"
              )}>
                {name}
              </h3>
              <div className="flex items-center gap-2">
                 <span className={cn("text-[10px] whitespace-nowrap shrink-0 transition-opacity group-hover:opacity-0",
                    unreadCount && unreadCount > 0 ? "font-bold text-primary" : "text-muted-foreground/60"
                 )}>
                   {timestamp ? formatMessageTime(new Date(timestamp)) : ""}
                 </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-1 h-4">
              <div className={cn("flex items-center gap-1 flex-1 min-w-0 text-xs truncate pr-8",
                 isActive ? "text-primary/80" : "text-muted-foreground"
              )}>
                {subtitle}
              </div>
              {unreadCount && unreadCount > 0 ? (
                 <span className="flex items-center justify-center min-w-[20px] h-[20px] rounded-full bg-red-500 text-white text-[10px] font-bold shadow-sm">
                   {unreadCount}
                 </span>
              ) : null}
            </div>  
          </div>

          {/* Quick Action Button - Visible on Hover */}
          <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div 
                  role="button"
                  className="p-1.5 rounded-full hover:bg-background/80 text-muted-foreground hover:text-foreground shadow-sm bg-background/50 backdrop-blur-sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="size-4" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); console.log('Pin', convoId); }}>
                   <Pin className="mr-2 size-4" />
                   <span>Ghim tin nhắn</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); console.log('Delete', convoId); }} className="text-destructive focus:text-destructive">
                   <Trash2 className="mr-2 size-4" />
                   <span>Xóa cuộc trò chuyện</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuItem onClick={() => console.log('Pin', convoId)}>
           <Pin className="mr-2 size-4" />
           <span>Ghim tin nhắn</span>
        </ContextMenuItem>
        <ContextMenuItem onClick={() => console.log('Delete', convoId)} className="text-destructive focus:text-destructive">
           <Trash2 className="mr-2 size-4" />
           <span>Xóa cuộc trò chuyện</span>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default ChatCard;