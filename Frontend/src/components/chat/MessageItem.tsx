import { cn, formatMessageTime } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthStore } from '@/store/useAuthStore';
import type { Conversation, Message, Participant } from '@/types/chat';
import React from 'react';

interface MessageItemProps {
  message: Message;
  index: number;
  messages: Message[];
  selectedConvo: Conversation;
  lastMessageStatus: "delivered" | "seen";
  seenUsers?: Participant[];
}

const MessageBubble = ({ 
  isOwn, 
  content, 
  imgUrl,
  type,
  borderRadiusClass
}: { 
  isOwn: boolean, 
  content: string | null, 
  imgUrl?: string | null,
  type?: string,
  borderRadiusClass: string 
}) => {
  if (type === 'IMAGE' && imgUrl) {
    return (
      <div className={cn("relative overflow-hidden shadow-sm transition-all hover:scale-[1.01] cursor-pointer", borderRadiusClass)}>
        <img src={imgUrl} alt="Attachment" className="max-w-[300px] rounded-xl object-cover" />
      </div>
    );
  }

  return (
    <div className={cn(
        "relative px-4 py-2 text-sm shadow-sm break-words transition-all hover:scale-[1.01] border",
        isOwn 
          ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-blue-500/20 border-transparent" 
          : "bg-white text-gray-800 border-gray-100 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700",
        borderRadiusClass
    )}>
      {content}
    </div>
  );
}

const MessageItem = ({ message, index, messages, selectedConvo, seenUsers }: MessageItemProps) => {
  const { user } = useAuthStore();
  
  // Logic identifying chain break (Start of a new sequence)
  const prev = messages[index - 1];
  const next = messages[index + 1];

  const currentUserId = user?._id?.toString();
  const msgSenderId = (message.senderId || (message as any).senderID)?.toString();

  const isMe = !!(currentUserId && msgSenderId && currentUserId === msgSenderId);
  
  const isChainBreak = index === 0 || 
     message?.senderId !== prev?.senderId ||
     new Date(message.createdAt).getTime() - new Date((prev?.createdAt) || 0).getTime() > 120000; // > 2 mins

  const isChainEnd = !next || next.senderId !== message.senderId || 
    new Date(next.createdAt).getTime() - new Date(message.createdAt).getTime() > 120000;

  // Determine Participant Info
  let participant: Participant | undefined;
  participant = selectedConvo.participants.find((p: Participant) => p._id === message.senderId?.toString());
  if (!selectedConvo.isGroup) {
    const receiver = selectedConvo.receiver;
    if (receiver?._id === message.senderId?.toString()) participant = receiver as unknown as Participant;
    if (!participant && user && !isMe) {
       participant = selectedConvo.participants.find(p => p._id !== user._id);
       if (!participant && receiver) participant = receiver as unknown as Participant;
    }
  }

  // Dynamic Border Radius Logic
  let borderRadiusClass = "rounded-2xl";
  if (isMe) {
    // Sent Message
    if (isChainBreak && isChainEnd) borderRadiusClass = "rounded-2xl rounded-br-sm"; // Singleton
    else if (isChainBreak && !isChainEnd) borderRadiusClass = "rounded-2xl rounded-br-md rounded-tr-2xl"; // First in chain
    else if (!isChainBreak && !isChainEnd) borderRadiusClass = "rounded-l-2xl rounded-r-md"; // Middle
    else if (!isChainBreak && isChainEnd) borderRadiusClass = "rounded-2xl rounded-tr-md rounded-br-sm"; // Last
  } else {
    // Received Message
    if (isChainBreak && isChainEnd) borderRadiusClass = "rounded-2xl rounded-bl-sm";
    else if (isChainBreak && !isChainEnd) borderRadiusClass = "rounded-2xl rounded-bl-md rounded-tl-2xl";
    else if (!isChainBreak && !isChainEnd) borderRadiusClass = "rounded-r-2xl rounded-l-md";
    else if (!isChainBreak && isChainEnd) borderRadiusClass = "rounded-2xl rounded-tl-md rounded-bl-sm";
  }

  return (
    <div className={cn(
        "flex w-full group", 
        isChainBreak ? "mt-4" : "mt-0.5", // Spacing logic
        isMe ? "justify-end" : "justify-start"
    )}>
      
      {/* LEFT SIDE: Avatar (Only for OTHER messages) */}
      {!isMe && (
        <div className="w-8 mr-2 shrink-0 flex flex-col justify-start"> {/* aligned to start (top) as requested via isChainBreak */}
           {isChainBreak ? (
             <Avatar className="w-8 h-8 hover:scale-105 transition-transform cursor-pointer">
                {/* Try to get avatar from Participant (Conversations) or SenderID (Message Snapshot) */}
                <AvatarImage src={participant?.avatar || (message as any).senderID?.avatar || (participant as any)?.avatarUrl || undefined} />
                <AvatarImage src="/default.jpg" />
                <AvatarFallback className="text-[10px] bg-blue-100 text-blue-600">
                  {participant?.displayName?.[0] || participant?.username?.[0] || "?"}
                </AvatarFallback>
              </Avatar>
           ) : (
             <div className="w-8" /> // Placeholder to keep alignment
           )}
        </div>
      )}

      {/* CENTER/RIGHT: Content Column */}
      <div className={cn(
          "flex flex-col max-w-[70%]", 
          isMe ? "items-end" : "items-start"
      )}>
        {/* Sender Name (Only Show for Group + Other + ChainBreak) */}
        {!isMe && selectedConvo.isGroup && isChainBreak && (
          <span className="text-[11px] text-muted-foreground ml-1 mb-1 font-medium">
             {participant?.displayName || participant?.username || "Unknown"}
          </span>
        )}

        <div className="flex items-center gap-2">
            {/* Timestamp Left (For Own Messages) */}
            {isMe && (
                 <span className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {formatMessageTime(new Date(message.createdAt))}
                 </span>
            )}

            <MessageBubble 
              isOwn={!!isMe} 
              content={message.content} 
              imgUrl={message.imgUrl}
              type={message.type}
              borderRadiusClass={borderRadiusClass}
            />

            {/* Timestamp Right (For Other Messages) */}
            {!isMe && (
                 <span className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {formatMessageTime(new Date(message.createdAt))}
                 </span>
            )}
        </div>

        {/* Seen Indicators */}
        {seenUsers && seenUsers.length > 0 && (
           <div className="flex items-center -space-x-1.5 mt-1 mr-1">
              {seenUsers.map((u, i) => (
                  <Avatar key={u._id || i} className="size-3.5 border border-white dark:border-zinc-900">
                      <AvatarImage src={u.avatar || undefined} />
                      <AvatarImage src="/default.jpg" />
                      <AvatarFallback className="text-[5px]">{u.username?.[0] || "?"}</AvatarFallback>
                  </Avatar>
              ))}
           </div>
        )}
      </div>

    </div>
  )
}

export default MessageItem