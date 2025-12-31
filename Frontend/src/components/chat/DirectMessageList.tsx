import { useChatStore } from '@/store/useChatStore'
import { useAuthStore } from '@/store/useAuthStore';
import React from 'react'
import DirectMessageCard from './DirectMessageCard';
import { ChevronUp, MoreHorizontal } from 'lucide-react';
import type { Conversation, Participant } from '@/types/chat';

const DirectMessageList = () => {
  const { conversations, friends, fetchFriends } = useChatStore();
  const [isExpanded, setIsExpanded] = React.useState(false);

  React.useEffect(() => {
    fetchFriends();
  }, [fetchFriends]);
  

  if (!friends && !conversations) return null;

  // 1. Get existing DM conversations
  const existingDMs = conversations.filter((convo) => convo.isGroup === false);

  // 2. Create a Map to direct conversations by participant/receiver ID for easy lookup
  // We want to combine Friends List + Active Conversations.
  const displayMap = new Map<string, Conversation>();

  // Add all existing active DMs first
  existingDMs.forEach(convo => {
    // Identify the "other" person
    const otherId = convo.receiver?._id || convo.participants?.find((p) => p._id !== useAuthStore.getState().user?._id)?._id; // Fallback finding
    if (otherId) {
      displayMap.set(otherId, convo);
    } else if (convo.receiver?._id) {
       displayMap.set(convo.receiver._id, convo);
    }
  });

  // Add friends who might NOT have an active DM yet
  if (friends && friends.length > 0) {
    friends.forEach(friend => {
      if (!displayMap.has(friend._id)) {
        // Create a mock conversation for this friend
        const mockConvo: Conversation = {
          _id: `temp_${friend._id}`,
          isGroup: false,
          group: { name: "", createdBy: "", avatar: null },
          participants: [{ // Needs to match how DirectMessageCard expects data
             _id: friend._id,
             username: friend.username,
             email: friend.email,
             avatar: friend.avatar || friend.avatarUrl,
             joinedAt: new Date().toISOString(),
             status: friend.isOnline ? 'online' : 'offline'
           } as Participant],
          lastMessageAt: new Date().toISOString(),
          readBy: [],
          lastMessage: null, // No message
          unreadCounts: {},
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(), // Recent
          receiver: {
             _id: friend._id,
             username: friend.username,
             avatar: friend.avatar || friend.avatarUrl,
             isOnline: friend.isOnline,
             status: friend.isOnline ? 'online' : 'offline'
          }
        };
        displayMap.set(friend._id, mockConvo);
      }
    });
  }

  // Convert map values to array and sort
  const allDirectChats = Array.from(displayMap.values());
  
  // Sort: Recent chats first (using updatedAt)
  // Mock conversations for friends have current date as updatedAt, so they show top if no message history?
  // Or maybe valid chats with messages should be on top?
  // Let's sort simply by updatedAt descending.
  const sortedChats = allDirectChats.sort((a, b) => {
      const timeA = new Date(a.updatedAt || 0).getTime();
      const timeB = new Date(b.updatedAt || 0).getTime();
      return timeB - timeA;
  });

  const LIMIT = 3;
  const visibleConversations = isExpanded ? sortedChats : sortedChats.slice(0, LIMIT);
  const hiddenCount = sortedChats.length - LIMIT;
  const showButton = sortedChats.length > LIMIT;

  return (
    <div className='flex-1 overflow-y-auto p-2 space-y-2'>
      {/* Animated container for list items */}
      <div className="space-y-2 transition-all duration-300 ease-in-out">
        {visibleConversations.map((convo) => (
            <DirectMessageCard
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
               <span>Xem thêm {hiddenCount} bạn bè...</span>
             </>
          )}
        </button>
      )}
    </div>
  )
}

export default DirectMessageList 