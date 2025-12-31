import { useChatStore } from '@/store/useChatStore';
import React from 'react'
import GroupChatCard from './GroupChatCard';
import { ChevronUp, MoreHorizontal } from 'lucide-react';

const GroupChatList = () => {
  const { conversations } = useChatStore();
  const [isExpanded, setIsExpanded] = React.useState(false);
  
  if (!conversations) return null;

  const groupchats = conversations
    .filter((convo) => convo.isGroup === true)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  
  const LIMIT = 3;
  const visibleGroups = isExpanded ? groupchats : groupchats.slice(0, LIMIT);
  const hiddenCount = groupchats.length - LIMIT;
  const showButton = groupchats.length > LIMIT;

  return (
    <div className='flex-1 overflow-y-auto p-2 space-y-2'>
        {/* Animated container for list items */}
        <div className="space-y-2 transition-all duration-300 ease-in-out">
            {visibleGroups.map((convo) => (
                <GroupChatCard
                key={convo._id}
                convo={convo}
                />
            ))}
        </div>

      {showButton && (
        <button
           onClick={() => setIsExpanded(!isExpanded)}
           className="flex items-center gap-2 text-xs font-medium text-muted-foreground/80 hover:text-primary transition-colors py-1.5 px-2 rounded-lg hover:bg-muted/50 w-full group"
        >
          {isExpanded ? (
             <>
                <div className="flex items-center justify-center w-6 h-6 rounded-md bg-muted/50 group-hover:bg-background shadow-sm transition-all">
                    <ChevronUp className="h-3.5 w-3.5" />
                </div>
                <span>Thu gọn</span>
             </>
          ) : (
             <>
               <div className="flex items-center justify-center w-6 h-6 rounded-md bg-muted/50 group-hover:bg-background shadow-sm transition-all">
                   <MoreHorizontal className="h-3.5 w-3.5" />
               </div>
               <span>Xem thêm {hiddenCount} nhóm...</span>
             </>
          )}
        </button>
      )}
    </div>
  )
}

export default GroupChatList