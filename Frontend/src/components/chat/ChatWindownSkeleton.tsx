import React from 'react'
import { SidebarInset } from '../ui/sidebar'
import { Skeleton } from '../ui/skeleton';

const ChatWindownSkeleton = () => {
  return (
    <SidebarInset className='flex w-full h-full flex-col'>
       <header className="flex h-16 items-center gap-4 border-b px-4 w-full bg-background justify-between">
           <div className="flex items-center gap-4">
               <Skeleton className="h-4 w-4" /> {/* SidebarTrigger placeholder */}
               <div className="flex items-center gap-3">
                   <Skeleton className="h-10 w-10 rounded-full" />
                   <div className='flex flex-col gap-2'>
                       <Skeleton className="h-4 w-24" />
                       <Skeleton className="h-3 w-16" />
                   </div>
               </div>
           </div>
       </header>
       <div className='flex-1 p-4 space-y-4'>
            {/* Generic message skeletons */}
            <div className="flex justify-start">
               <Skeleton className="h-10 w-1/3 rounded-lg" />
            </div>
            <div className="flex justify-end">
               <Skeleton className="h-10 w-1/4 rounded-lg" />
            </div>
             <div className="flex justify-start">
               <Skeleton className="h-16 w-1/2 rounded-lg" />
            </div>
       </div>
    </SidebarInset>
  )
}

export default ChatWindownSkeleton