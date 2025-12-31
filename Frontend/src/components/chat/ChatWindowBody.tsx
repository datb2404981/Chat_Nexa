import { useChatStore } from '@/store/useChatStore';
import { useAuthStore } from '@/store/useAuthStore';
import React from 'react'
import ChatWelcomeScreen from './ChatWelcomeScreen';
import MessageItem from './MessageItem';
import type { Participant } from '@/types/chat';

const ChatWindowBody = () => {
  const {
    activeConversationId,
    conversations,
    messages: allMessages,
    friends
  } = useChatStore();

  const { user } = useAuthStore();

  const messages = allMessages[activeConversationId!]?.items ?? [];
  const selectedConvo = conversations.find((c) => c._id === activeConversationId);

  const scrollRef = React.useRef<HTMLDivElement>(null);

  // Calculate read receipts
  const readReceipts = React.useMemo(() => {
     if (!selectedConvo?.readBy || !messages) return new Map();
     const map = new Map<string, Participant[]>();
     
     const currentUserId = user?._id?.toString();

     selectedConvo.readBy.forEach(reader => {
         // Resolve Reader ID safely (handle populated object or raw string)
         const readerRaw = reader.userId;
         const readerId = ((readerRaw as any)?._id || readerRaw)?.toString();

         // Skip if it's me
         if (readerId === currentUserId) return; 
         
         // Find Full User Details
         // 1. Check Conversation Particaipants (Most reliable source for this chat)
         let participant = selectedConvo.participants.find(p => p._id.toString() === readerId);
         
         // 2. Check Friends List
         if (!participant) {
             participant = friends.find(f => f._id.toString() === readerId) as unknown as Participant;
         }

         // 3. Fallback: Check if 'reader.userId' itself was a populated object
         if (!participant && typeof readerRaw === 'object' && (readerRaw as any)._id) {
             participant = readerRaw as unknown as Participant;
         }

         // 4. Ultimate Fallback (Placeholder) - preventing crash/empty avatar
         if (!participant) {
            participant = {
                _id: readerId,
                username: "Unknown",
                avatar: "", 
                displayName: "Unknown User"
            } as Participant;
         }
         
         const seenAt = new Date(reader.lastSeenAt).getTime();
         
         // Find latest message <= seenAt (Messages are Old -> New)
         for (let i = messages.length - 1; i >= 0; i--) {
             const msg = messages[i];
             if (new Date(msg.createdAt).getTime() <= seenAt) {
                 if (!map.has(msg._id)) map.set(msg._id, []);
                 
                 // Avoid duplicates for same user
                 const existingList = map.get(msg._id)!;
                 if (!existingList.some(p => p._id.toString() === participant!._id.toString())) {
                    existingList.push(participant); 
                 }
                 break;
             }
         }
     });
     return map;
  }, [selectedConvo?.readBy, messages, user?._id, friends, selectedConvo?.participants]);


  React.useEffect(() => {
    if (scrollRef.current) {
        // Use standard scrollTo for better compatibility or direct assignment
        // Using timeout to ensure DOM update
        setTimeout(() => {
             scrollRef.current!.scrollTop = scrollRef.current!.scrollHeight;
        }, 10);
    }
  }, [messages, activeConversationId]);

  if (!selectedConvo) {
    return <ChatWelcomeScreen/>
  }

  if (!messages?.length) {
    return (
      <div className='flex h-full items-center justify-center text-muted-foreground'>
        Chưa có tin nhắn nào trong cuộc trò chuyện này.
      </div>
    )
  }

  return (
    <div className='relative h-full flex flex-col overflow-hidden bg-white dark:bg-zinc-950'>
      {/* Background Pattern */}
      <div className="absolute inset-0 h-full w-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] dark:bg-[radial-gradient(#27272a_1px,transparent_1px)] opacity-50 pointer-events-none" />
      
      <div 
        ref={scrollRef}
        className='relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar p-4 gap-4'
      >
        {messages.map((message, index) => (
          <MessageItem
            key={message._id ?? index}
            message={message}
            index={index}
            messages={messages}
            selectedConvo={selectedConvo}
            lastMessageStatus='delivered'
            seenUsers={readReceipts.get(message._id)}
          />
        ))}
      </div>
    </div>
  )
}

export default ChatWindowBody