import { cn } from '@/lib/utils'
import React from 'react'

const StatusBadge = ({status}: {status: "online" | "offline"}) => {
  return (
    <div className={cn(
      "absolute -bottom-0.5 -right-0.5 size-4 rounded-full border-2 border-card",
      status === "online" && "bg-green-500",
      status === "offline" && "bg-gray-500"
    )}></div>
  )
}

export default StatusBadge