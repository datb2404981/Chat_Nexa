import { useAuthStore } from '@/store/useAuthStore';
import { useChatStore } from '@/store/useChatStore';
import type { Conversation } from '@/types/chat'
import React from 'react'
import ChatCard from './ChatCard'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import StatusBadge from '@/components/ui/statusBadge';
import { cn } from '@/lib/utils';
import UnreadCountBadge from './UnreadCountBadge';

const DirectMessageCard =  ({ convo }: {
  convo: Conversation 
}) => {
  const { activeConversationId, setActiveConversation, messages,fetchMessages, accessConversation } = useChatStore();
  const { user } = useAuthStore();
  
  
  if (!user) return null;

  // Uses the convenience 'receiver' field from backend if available, 
  // otherwise fallback to finding participant manually.
  const receiver = convo.receiver || convo.participants?.find((p) => p._id !== user._id);
  
  if (!receiver) return null;

  const unreadCount = convo.unreadCounts?.[user._id] || 0;
  const lastMessage = convo.lastMessage?.content ?? "";

  const handleSelectConversation = async() => {
    if(receiver) {
      await accessConversation(receiver._id);
    } else {
      setActiveConversation(convo._id);
      if (!messages[convo._id]) {
        await fetchMessages()
      }
    }
  };

  const hasRead = convo.readBy?.some(r => {
      const uId = (r.userId as any)?._id || r.userId;
      return uId?.toString() === user._id;
  }) ?? false;

  const isUnread = !hasRead && !!convo.lastMessage;
  
  // Prioritize readBy logic as requested, fallback to unreadCounts
  const showUnreadBadge = isUnread || unreadCount > 0;

  const leftSection = (
  <>
      {showUnreadBadge && <UnreadCountBadge unreadCount={unreadCount || 1} />}
    <Avatar className="size-10">
      <AvatarImage src={receiver.avatar || undefined} />
      <AvatarImage src="/default.jpg" />
      <AvatarFallback>{receiver.displayName?.[0] || receiver.username?.[0] || "?"}</AvatarFallback>
    </Avatar>
      <StatusBadge status={receiver.status || "offline"} />
  </>
  );

  return (
    <ChatCard
      convoId={convo._id}
      name={receiver.displayName || receiver?.username || "Unknown User "}
      timestamp={convo.lastMessage?.createdAt }
      isActive={activeConversationId === convo._id}
      onSelect={handleSelectConversation}
      unreadCount={showUnreadBadge ? (unreadCount || 1) : 0} 
      leftSection={leftSection}
      subtitle={
        <p className={cn("text-sm truncate", isUnread ? "font-bold text-foreground" : "text-muted-foreground")}>
          {lastMessage}
        </p>
      }
    />
  )
}

export default DirectMessageCard
