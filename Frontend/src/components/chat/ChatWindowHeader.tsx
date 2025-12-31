import React from 'react'
import { SidebarTrigger } from '../ui/sidebar'
import { useChatStore } from '@/store/useChatStore'
import { useAuthStore } from '@/store/useAuthStore'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import GroupChatAvatar from './GroupChatAvatar'
import { Separator } from '@/components/ui/separator'


const ChatWindowHeader = () => {
    const { activeConversationId, conversations } = useChatStore();
    const { user } = useAuthStore();
    const conversation = conversations.find(c => c._id === activeConversationId);

    if (!conversation || !user) {
        return (
            <header className="flex h-16 items-center gap-2 border-b px-4 w-full bg-white dark:bg-background">
              <SidebarTrigger className="scale-125 ml-2"/>
              <Separator orientation="vertical" className="mr-2 h-4 w-[3px]" />
           </header>
        )
    };

    const isGroup = conversation.isGroup;
    
    // Logic for Group Chat
    if (isGroup) {
        return (
            <header className="flex h-16 items-center gap-4 border-b px-4 w-full bg-white dark:bg-background justify-between sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <SidebarTrigger className="scale-125 ml-2" />
                    <Separator orientation="vertical" className="mr-2 h-4 w-[2px]" />
                    <div className="flex items-center gap-3">
                        <GroupChatAvatar 
                             participants={conversation.participants} 
                             type="chat" 
                             groupAvatar={conversation.group?.avatar} 
                        />
                        <div className='flex flex-col'>
                            <h3 className="font-medium text-sm">{conversation.group?.name || "Unnamed Group"}</h3>
                            <span className="text-xs text-muted-foreground">
                                {conversation.participants?.length || 0} thành viên
                            </span>
                        </div>
                    </div>
                </div>
                
                 {/* Actions */}
                <div className="flex items-center gap-2">
                    {/* Add header actions here */}
                </div>
            </header>
        )
    }

    // Logic for Direct Message
    const receiver = conversation.receiver || conversation.participants?.find((p) => p._id !== user._id);
    
    if(!receiver) return null;

  return (
    <header className="flex h-16 items-center gap-4 border-b px-4 w-full bg-white dark:bg-background justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
              <SidebarTrigger className="scale-125 ml-2" />
              <Separator orientation="vertical" className="mr-2 h-4 w-[3px]" />
            <div className="flex items-center gap-3">
                <Avatar>
                    <AvatarImage src={receiver.avatar || (receiver as any).avatarUrl || undefined} />
                    <AvatarImage src="/default.jpg" />
                    <AvatarFallback>{receiver.displayName?.[0] || receiver.username?.[0] || "?"}</AvatarFallback>
                </Avatar>
                <div className='flex flex-col'>
                    <h3 className="font-medium text-sm">{receiver.displayName || receiver.username}</h3>
                    <span className="text-xs text-muted-foreground capitalize flex items-center gap-1">
                        <span className={`w-2 h-2 rounded-full ${receiver.status === 'online' ? "bg-green-500" : "bg-gray-300" }`}></span>
                        {receiver.status || "offline"}
                    </span>
                </div>
            </div>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-2">
            {/* Add header actions here (Call, Video, Info, etc.) */}
        </div>
    </header>
  )
}

export default ChatWindowHeader