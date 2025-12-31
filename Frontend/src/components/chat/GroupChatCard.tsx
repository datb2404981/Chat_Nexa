import { useAuthStore } from '@/store/useAuthStore';
import { useChatStore } from '@/store/useChatStore';
import type { Conversation } from '@/types/chat'
import React from 'react'
import ChatCard from './ChatCard'
import GroupChatAvatar from './GroupChatAvatar';
import UnreadCountBadge from './UnreadCountBadge';

const GroupChatCard = ({ convo }: {
  convo: Conversation 
}) => {
  const { activeConversationId, setActiveConversation,messages,fetchMessages } = useChatStore();
  const { user } = useAuthStore();
  
  if (!user) return null;


  const unreadCount = convo.unreadCounts?.[user._id] || 0;
  const name = convo.group?.name ?? "";
  const handleSelectConversation = async (id: string) => {
    setActiveConversation(id);
    if (!messages[id]) {
      await fetchMessages()
    }
  }

  const leftSection = (
    <>
      {unreadCount > 0 && <UnreadCountBadge unreadCount={unreadCount} />}
      <GroupChatAvatar
        participants={convo.participants || []}
        type="sidebar"
        groupAvatar={convo.group?.avatar}
      />
    </>
  );

  return (
    <ChatCard
      convoId={convo._id}
      name={convo.group?.name || "Unnamed Group"}
      timestamp={convo.lastMessage?.createdAt || undefined}
      isActive={activeConversationId === convo._id}
      onSelect={handleSelectConversation}
      unreadCount={unreadCount}
      leftSection={leftSection}
      subtitle={
        <p className='text-sm truncate text-muted-foreground'>
          {convo.participants?.length || 0} thành viên
        </p>
      }
    />
  )
}

export default GroupChatCard