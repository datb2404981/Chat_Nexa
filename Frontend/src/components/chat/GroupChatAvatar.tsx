import type { Participant } from '@/types/chat'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Ellipsis } from 'lucide-react';
import React from 'react'

interface GroupChatListProps {
  participants: Participant[];
  type: "chat" | "sidebar";
  groupAvatar?: string | null;
}

const UserAvatar = ({ member, avatar, type }: { member: string, avatar?: string, type: "chat" | "sidebar" }) => {
  return (
    <Avatar data-slot="avatar" className={cn(type === "chat" ? "size-9" : "size-8")}>
      <AvatarImage src={avatar} alt={member} />
      <AvatarFallback>{member.slice(0, 1)}</AvatarFallback>
    </Avatar>
  )
}

const GroupChatAvatar = ({ participants, type, groupAvatar }: GroupChatListProps) => {
  if (groupAvatar) {
    return (
      <Avatar className="size-10 border-2 border-background">
        <AvatarImage src={groupAvatar} alt="Group Avatar" />
        <AvatarFallback>G</AvatarFallback>
      </Avatar>
    )
  }

  const avatars = [];
  const limit = Math.min(participants.length, 4);

  for (let i = 0; i < limit; i++){
    const member = participants[i];
    avatars.push(
      <UserAvatar
        key={i}
        type={type}
        member={member.displayName || member.username || "Unknown"}
        avatar={member.avatar || undefined}
      />
    )
  }

  return (
    <div className='relative flex -space-x-2 *:data-[slot=avatar]:ring-background *:data-[slot=avatar]:ring-2'>{avatars}
      {/* nếu nhiều hơn 4  avatar thì render dấu ... */}
      {participants.length > 4 && (
        <div className='flex items-center z-10 justify-center size-8 rounded-full bg-muted ring-2 ring-background text-muted-foreground'>
          <Ellipsis className='size-4'/>
        </div>
      )}
    </div>
  )
}

export default GroupChatAvatar