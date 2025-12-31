import React, { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Search, X, Loader2, MoreHorizontal, Plus } from 'lucide-react'
import { useDebounce } from '@/hooks/useDebounce'
import { userService } from '@/services/userService'
import type { User, SearchResult } from '@/types/user'
import { cn } from '@/lib/utils'
import { useChatStore } from '@/store/useChatStore'
import GroupChatAvatar from './GroupChatAvatar'

interface SearchChatProps {
  onSelectUser?: (user: User) => void
  isFlashing?: boolean 
}

const SearchChat = ({ onSelectUser, isFlashing }: SearchChatProps) => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  
  const debouncedQuery = useDebounce(query, 500)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const { 
    conversations, 
    setActiveConversation, 
    accessConversation
  } = useChatStore()

  useEffect(() => {
    if (!query) {
       setResults([])
       setIsOpen(false)
    }
  }, [query])

  useEffect(() => {
    const search = async () => {
      if (!debouncedQuery.trim()) {
        setResults([])
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setIsOpen(true)

      try {
        const data = await userService.searchUsers(debouncedQuery)
        setResults(data)
      } catch (error) {
        console.error("Search failed:", error)
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }

    if (debouncedQuery) {
        search()
    }
  }, [debouncedQuery])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleClear = () => {
    setQuery('')
    setResults([])
    setIsOpen(false)
  }

  const handleSelect = async (item: SearchResult) => {
    setQuery('')
    setIsOpen(false)

    if (item.type === 'group') {
      const found = conversations.find(c => c._id === item._id)
      if (found) {
        setActiveConversation(found._id)
      } else {
         console.warn("Group conversation not found in local store", item._id)
      }
    } else { // type === 'user'
      await accessConversation(item._id);
    }

    if (onSelectUser && item.type === 'user') {
       onSelectUser(item)
    }
  }

  // Sync isOpen with global isSearching state
  const { isSearching, setSearching } = useChatStore()

  useEffect(() => {
    setSearching(isOpen)
  }, [isOpen, setSearching])

  // Handle external closing (e.g. from Sidebar backdrop)
  useEffect(() => {
    if (!isSearching && isOpen) {
        setIsOpen(false)
    }
  }, [isSearching])

  const groups = results.filter(r => r.type === 'group');
  const users = results.filter(r => r.type === 'user');

  return (
    <div className="relative w-full z-50" ref={wrapperRef}>
        <div className={cn(
            "relative z-50 group transition-all duration-300 ease-in-out hover:scale-[1.02]",
             // Add white background to container when searching to prevent transparent input blending with dark backdrop
             isOpen && "bg-white rounded-2xl" 
        )}>
           <Search className={cn(
             "absolute left-3 top-1/2 -translate-y-1/2 size-4 z-10",
             "text-gray-400 transition-all duration-300",
             "group-focus-within:text-blue-500 group-focus-within:scale-110 group-focus-within:rotate-12",
             "group-hover:text-blue-500 group-hover:scale-110 group-hover:rotate-12",
             isFlashing && "text-blue-500 scale-110"
           )} />
           
           <Input 
              id="search-chat-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => { if(query.trim()) setIsOpen(true) }}
              className={cn(
                "pl-10 pr-10 h-11 w-full rounded-2xl transition-all duration-300 ease-in-out",
                "bg-gray-100 dark:bg-white/5 border-2 border-transparent shadow-sm",
                "hover:bg-blue-50 dark:hover:bg-white/10 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20",
                "focus-visible:bg-white dark:focus-visible:bg-slate-950 focus-visible:border-blue-500 focus-visible:ring-4 focus-visible:ring-blue-500/20 focus-visible:shadow-xl focus-visible:shadow-blue-500/30",
                "placeholder:text-gray-400 dark:placeholder:text-gray-500",
                "text-slate-900 dark:text-white",
                isFlashing && "bg-white ring-2 ring-blue-500 shadow-xl shadow-blue-500/20"
              )}
              placeholder="Tìm kiếm bạn bè, nhóm..."
           />
           
           <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center">
              {isLoading ? (
                  <Loader2 className="size-4 animate-spin text-blue-500" />
              ) : query ? (
                  <button 
                    onClick={handleClear} 
                    className="rounded-full bg-gray-200 p-1 hover:bg-gray-300 transition-colors"
                    type="button"
                  >
                     <X className="size-3 text-gray-500" />
                  </button>
              ) : null}
           </div>
        </div>

        {isOpen && (
           <div className={cn(
               "absolute top-full left-0 right-0 mt-2 w-full",
               "bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-gray-100 dark:border-slate-800",
               "overflow-hidden z-50 flex flex-col max-h-[60vh]",
               "transition-all duration-300 ease-in-out"
           )}>
               
               <div className="overflow-y-auto custom-scrollbar p-2 space-y-2 transition-all duration-300 ease-in-out">
                   
                   {isLoading && results.length === 0 && (
                      <div className="p-4 space-y-3">
                          {[1, 2].map(i => (
                              <div key={i} className="flex items-center gap-3">
                                 <Skeleton className="h-10 w-10 rounded-full" />
                                 <div className="space-y-1 flex-1">
                                     <Skeleton className="h-3 w-1/2" />
                                     <Skeleton className="h-2 w-1/4" />
                                 </div>
                              </div>
                          ))}
                      </div>
                   )}

                   {!isLoading && results.length === 0 && (
                       <div className="p-8 text-center text-gray-400">
                           <p className="text-sm">Không tìm thấy kết quả phù hợp</p>
                       </div>
                   )}

                   {/* GROUPS SECTION */}
                   {groups.length > 0 && (
                       <div className="mb-2 border rounded-2xl p-2 transition-all duration-300 border-blue-100/50 dark:border-blue-800/50 hover:border-blue-300 dark:hover:border-blue-600 bg-blue-50/10 dark:bg-blue-900/10 hover:bg-blue-50/30 dark:hover:bg-blue-900/20">
                           <div className="px-2 py-2 flex items-center justify-between text-xs font-bold text-muted-foreground/70 uppercase">
                               <span>Nhóm Chat</span>
                               <Plus className="size-4 cursor-pointer hover:text-blue-500 transition-colors" />
                           </div>
                           <div className="space-y-1">
                               {groups.map((item: any) => (
                                   <div
                                       key={item._id}
                                       onClick={() => handleSelect(item)}
                                       className="group relative flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all duration-300 ease-in-out border border-transparent hover:bg-blue-50 dark:hover:bg-slate-800 hover:ring-2 hover:ring-blue-500 hover:shadow-xl hover:shadow-blue-500/20 hover:border-blue-500 hover:scale-[1.02] hover:z-10"
                                   >
                                       {/* Group Avatar Component */}
                                       <div className="relative shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                                          <GroupChatAvatar 
                                             participants={item.members || []} 
                                             type="sidebar" 
                                             groupAvatar={item.avatar} 
                                          />
                                       </div>
                                       
                                       <div className="flex-1 min-w-0 ml-1">
                                           <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                                               {item.name}
                                           </h4>
                                           <p className="text-xs text-muted-foreground dark:text-muted-foreground truncate">
                                               {item.members?.length || 0} thành viên
                                           </p>
                                       </div>

                                       <button className="shrink-0 p-1.5 rounded-full hover:bg-blue-100/50 text-gray-400 hover:text-blue-600 transition-colors">
                                           <MoreHorizontal className="size-4" />
                                       </button>
                                   </div>
                               ))}
                           </div>
                       </div>
                   )}

                   {/* USERS SECTION */}
                   {users.length > 0 && (
                       <div className="mb-2 border rounded-2xl p-2 transition-all duration-300 border-blue-100/50 dark:border-blue-800/50 hover:border-blue-300 dark:hover:border-blue-600 bg-blue-50/10 dark:bg-blue-900/10 hover:bg-blue-50/30 dark:hover:bg-blue-900/20">
                           <div className="px-2 py-2 text-xs font-bold text-muted-foreground/70 uppercase">
                               Mọi người
                           </div>
                           <div className="space-y-1">
                               {users.map((item: any) => (
                                   <div
                                       key={item._id}
                                       onClick={() => handleSelect(item)}
                                       className="group relative flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all duration-300 ease-in-out border border-transparent hover:bg-blue-50 dark:hover:bg-slate-800 hover:ring-2 hover:ring-blue-500 hover:shadow-xl hover:shadow-blue-500/20 hover:border-blue-500 hover:scale-[1.02] hover:z-10"
                                   >
                                       {/* User Avatar (Circle) */}
                                       <div className="relative shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                                           <Avatar className="size-12 border border-gray-100 dark:border-gray-700">
                                               <AvatarImage src={item.avatar || item.avatarUrl} alt={item.username} />
                                               <AvatarFallback>{item.username?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                                           </Avatar>
                                       </div>
                                       
                                       <div className="flex-1 min-w-0">
                                           <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                                               {item.username}
                                           </h4>
                                           {item.email && (
                                               <p className="text-xs text-muted-foreground dark:text-muted-foreground truncate">
                                                   {item.email}
                                               </p>
                                           )}
                                       </div>

                                       <button className="shrink-0 p-1.5 rounded-full hover:bg-blue-100/50 text-gray-400 hover:text-blue-600 transition-colors">
                                           <MoreHorizontal className="size-4" />
                                       </button>
                                   </div>
                               ))}
                           </div>
                       </div>
                   )}
               </div>
           </div>
        )}
      </div>
  )
}

export default SearchChat