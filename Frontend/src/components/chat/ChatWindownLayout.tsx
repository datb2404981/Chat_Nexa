import { useChatStore } from '@/store/useChatStore';
import React from 'react'
import ChatWelcomeScreen from './ChatWelcomeScreen';
import ChatWindownSkeleton from './ChatWindownSkeleton';
import { SidebarInset } from '../ui/sidebar';
import ChatWindowHeader from './ChatWindowHeader';
import ChatWindowBody from './ChatWindowBody';
import MessageInput from './MessageInput';

const ChatWindownLayout = () => {
  const {activeConversationId, conversations, messageLoading: loading, fetchMessages, markConversationAsRead} = useChatStore();
  const selectedConvo = conversations.find((convo) => convo._id === activeConversationId);

  React.useEffect(() => {
    if (activeConversationId) {
        fetchMessages(activeConversationId);
        markConversationAsRead(activeConversationId);
    }
  }, [activeConversationId, fetchMessages, markConversationAsRead]);

  if (!selectedConvo) {
    return <ChatWelcomeScreen/>
  }

  if (loading) {
    return <ChatWindownSkeleton/>
  }

  return (
    <SidebarInset className='relative h-full overflow-hidden rounded-sm shadow-md bg-slate-50 dark:bg-background'>
      <div className="absolute inset-0 flex flex-col">
          <ChatWindowHeader />
          {selectedConvo ? (
              <>
                  <div className='flex-1 min-h-0 overflow-hidden flex flex-col'>
                      <ChatWindowBody/>
                  </div>
                  <div className="shrink-0">
                    <MessageInput selectedConvo={selectedConvo}/>
                  </div>
              </>
          ) : (
              <ChatWelcomeScreen/>
          )}
      </div>
    </SidebarInset>
  )
}

export default ChatWindownLayout