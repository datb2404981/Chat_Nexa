import { useState, useEffect } from 'react'
import { Check, Search, Users } from 'lucide-react'
import {
  DialogContent,
  DialogTitle,
  Dialog
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useChatStore } from "@/store/useChatStore"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface CreateGroupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateGroupModal = ({ open, onOpenChange }: CreateGroupModalProps) => {
  const [groupName, setGroupName] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const { friends, fetchFriends, createGroupConversation } = useChatStore()

  useEffect(() => {
    if (open) {
      fetchFriends()
    }
  }, [open, fetchFriends])

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id) 
        : [...prev, id]
    )
  }

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedIds.length === 0) return;
    
    await createGroupConversation(groupName, selectedIds);
    
    setGroupName("");
    setSelectedIds([]);
    onOpenChange(false);
  }

  // Filter friends based on search
  const filteredFriends = friends.filter(friend => 
    friend.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        aria-describedby="create-group-description" 
        className="sm:max-w-3xl p-0 overflow-hidden gap-0 rounded-[28px] bg-white dark:bg-[#020817] border-0 dark:border dark:border-white/10 outline-none shadow-2xl"
      >
        
        {/* 1. HEADER: CLEAN INPUT */}
        <div className="px-8 py-8 bg-white dark:bg-[#020817] border-b border-gray-100 dark:border-white/10 transition-colors">
           <div className="sr-only" id="create-group-description">
              Modal to create a new group chat and select members.
           </div>
           <DialogTitle className="sr-only">Tạo nhóm chat</DialogTitle>

           <div className="flex items-center gap-5">
              <div className="h-16 w-16 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-500 shrink-0 transition-colors">
                 <Users size={32} strokeWidth={2} />
              </div>
              
              <div className="flex-1 min-w-0 space-y-1">
                 <label className="text-xs font-bold text-blue-600 dark:text-blue-500 uppercase tracking-widest pl-1">
                    Tên nhóm mới
                 </label>
                 <Input 
                    placeholder="Đặt tên nhóm..." 
                    className="text-3xl font-bold bg-transparent border-none shadow-none p-0 h-auto placeholder:text-gray-300 dark:placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none text-slate-900 dark:text-white"
                    value={groupName}
                    onChange={e => setGroupName(e.target.value)}
                    autoFocus
                 />
              </div>
           </div>
        </div>

        {/* 2. BODY: SEARCH & LIST */}
        <div className="flex flex-col flex-1 min-h-[400px] bg-white dark:bg-[#020817]">
             {/* Search Bar */}
             <div className="px-8 pb-4 pt-4">
                 <div className="relative">
                     <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-gray-400 dark:text-muted-foreground" />
                     <Input 
                        placeholder="Tìm kiếm thành viên..." 
                        className="pl-10 h-11 bg-gray-100 dark:bg-white/5 border-2 border-transparent shadow-sm hover:bg-gray-200 dark:hover:bg-white/10 focus-visible:bg-white dark:focus-visible:bg-black/20 focus-visible:border-blue-500 focus-visible:ring-4 focus-visible:ring-blue-500/20 rounded-2xl text-base transition-all placeholder:text-gray-400 dark:placeholder:text-muted-foreground text-slate-900 dark:text-white"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                     />
                 </div>
             </div>
             
             {/* Friend Grid */}
             <ScrollArea className="flex-1 -mx-2 px-2 pb-4">
                <div className="grid grid-cols-2 gap-3 px-6 pb-6 pt-2">
                   {filteredFriends.map(friend => {
                      const isSelected = selectedIds.includes(friend._id);
                      return (
                         <div 
                            key={friend._id}
                            onClick={() => toggleSelection(friend._id)}
                            className={cn(
                               "relative group cursor-pointer p-3 rounded-xl border transition-all duration-200 flex items-center gap-3",
                               // 👇 LOGIC STYLE MỚI: Tinh tế & Đồng bộ Sidebar & ChatCard
                               isSelected 
                                 ? "bg-blue-50 border-blue-500 dark:bg-blue-500/10 dark:border-blue-500 dark:shadow-[0_0_15px_rgba(59,130,246,0.15)] transform scale-[1.02]" 
                                 : "bg-white border-transparent dark:bg-transparent dark:border-white/5 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:ring-2 hover:ring-blue-500 hover:shadow-xl hover:shadow-blue-500/20 hover:border-blue-500 hover:scale-[1.02] hover:z-10"
                            )}
                         >
                            <div className="relative shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                                <Avatar className="h-10 w-10 border border-gray-200 dark:border-white/10 shadow-sm transition-colors group-hover:border-blue-500">
                                   <AvatarImage src={friend.avatar || "/default-avatar.png"} />
                                   <AvatarFallback className="bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white/70 group-hover:text-blue-500 dark:group-hover:text-white">{friend.username?.[0]?.toUpperCase()}</AvatarFallback>
                                </Avatar>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                               <p className={cn("font-medium truncate text-sm transition-colors", 
                                  isSelected 
                                    ? "text-blue-700 dark:text-blue-400" 
                                    : "text-slate-700 dark:text-slate-200 group-hover:text-blue-700 dark:group-hover:text-white"
                               )}>
                                  {friend.username}
                               </p>
                               <p className="text-xs text-slate-400 dark:text-muted-foreground truncate group-hover:text-blue-400 dark:group-hover:text-white/60">
                                  {friend.email}
                               </p>
                            </div>
                            
                            {/* Checkmark Badge */}
                            {isSelected && (
                               <div className="absolute top-3 right-3 text-blue-600 dark:text-blue-500 animate-in zoom-in">
                                  <Check size={16} strokeWidth={3} />
                               </div>
                            )}
                         </div>
                      )
                   })}
                   
                   {filteredFriends.length === 0 && (
                      <div className="col-span-2 flex flex-col items-center justify-center py-12 text-gray-300 dark:text-muted-foreground gap-3 opacity-80">
                          <div className="p-4 rounded-full bg-gray-50 dark:bg-white/5">
                             <Users className="size-8 text-gray-300 dark:text-muted-foreground/50" strokeWidth={1.5} />
                          </div>
                          <p className="text-sm font-medium">Không tìm thấy thành viên</p>
                      </div>
                   )}
                </div>
             </ScrollArea>
        </div>

        {/* 3. FOOTER */}
        <div className="p-6 border-t border-gray-100 dark:border-white/10 bg-white/80 dark:bg-transparent backdrop-blur-sm flex justify-end">
           <Button 
              onClick={handleCreateGroup}
              disabled={!groupName.trim() || selectedIds.length < 2}
              className="rounded-xl px-10 h-12 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] font-bold text-base disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed"
           >
              Tạo nhóm
           </Button>
        </div>

      </DialogContent>
    </Dialog>
  )
}

export default CreateGroupModal
