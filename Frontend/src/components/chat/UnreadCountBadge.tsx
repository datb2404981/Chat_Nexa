import { cn } from '@/lib/utils'
import React from 'react'

const UnreadCountBadge = ({unreadCount}: {unreadCount: number}) => {
  return (
    <div className={cn(
      "absolute -top-0 -right-0 z-20 flex items-center justify-center",
      "min-w-4 h-4 px-1 rounded-full",
      "bg-red-500 text-white text-[10px] font-bold shadow-sm", 
      "border-2 border-background" 
    )}>
      {unreadCount > 9 ? "9+" : unreadCount}
    </div>
  )
}

export default UnreadCountBadge