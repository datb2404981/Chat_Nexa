import { useState, useEffect } from 'react'
import { UserPlus, Search, Check, X, Loader2, UserCheck, Pencil, Trash2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { SidebarGroupAction } from "@/components/ui/sidebar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useChatStore } from "@/store/useChatStore"
import { userService } from "@/services/userService"
import { toast } from "sonner"
import { ScrollArea } from '../ui/scroll-area'
import { UserProfileDialog } from "./UserProfileDialog"
import type { UserProfile } from "./UserProfileDialog"
import { useAuthStore } from "@/store/useAuthStore"


const AddFriendModal = () => {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("find")
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  
  // Track sent requests temporarily for UI feedback within the modal session
  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set())

  // State for message input
  const [requestingId, setRequestingId] = useState<string | null>(null)
  const [requestMessage, setRequestMessage] = useState("")
  
  // State for edit request
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editMessage, setEditMessage] = useState("")

  // Profile Dialog State
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null)
  const { user: currentUser } = useAuthStore()

  const { 
    friendRequests, 
    sentFriendRequests,
    fetchFriendRequests, 
    sendFriendRequest, 
    acceptFriendRequest, 
    declineFriendRequest,
    cancelFriendRequest,
    isLoadingRequests
  } = useChatStore()

  // Fetch requests when modal opens or tab changes to 'requests'
  useEffect(() => {
    if (open) {
      fetchFriendRequests()
    }
  }, [open, fetchFriendRequests])

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    setIsSearching(true)
    try {
      // Filter only 'user' type results from the general search
      const results = await userService.searchNewFriend(searchQuery)
      setSearchResults(results.filter((dev: any) => !dev.type || dev.type === 'user'))
    } catch (error) {
      toast.error("Không tìm thấy người dùng")
    } finally {
      setIsSearching(false)
    }
  }

  const initRequest = (userId: string) => {
    setRequestingId(userId)
    setRequestMessage("Xin chào, mình kết bạn nhé!")
  }

  const confirmSendRequest = async () => {
    if (!requestingId) return
    
    await sendFriendRequest(requestingId, requestMessage)
    
    setSentRequests(prev => new Set(prev).add(requestingId))
    
    setRequestingId(null)
    setRequestMessage("")
  }


  
  // New handlers for Context Menu
  const handleCancelRequest = (userId: string) => {
    // UI-only logic as requested
    toast.success("Đã hủy lời mời kết bạn")
    // Update local state to reflect change (optional for "UI only" but good for demo)
    if (sentRequests.has(userId)) {
       const next = new Set(sentRequests)
       next.delete(userId)
       setSentRequests(next)
    }
    // Also update pended status visually if possible (requires modifying searchResults)
    setSearchResults(prev => prev.map(u => u._id === userId ? { ...u, pended: false } : u))
  }

  const handleUpdateMessage = () => {
     if (!editingId) return
     toast.success("Đã cập nhật lời nhắn")
     setEditingId(null)
     setEditMessage("")
  }

  const openEditDialog = (user: any) => {
      setEditingId(user._id)
      setEditMessage("Xin chào, mình kết bạn nhé!") // Example default or previous message
  }

  // Edit Dialog Component
  const EditRequestDialog = () => (
    <Dialog open={!!editingId} onOpenChange={(open) => !open && setEditingId(null)}>
        <DialogContent className="sm:max-w-md bg-background rounded-[24px] border border-border shadow-2xl overflow-hidden p-0 gap-0">
             <div className="bg-muted/50 border-b border-border p-6">
                <DialogTitle className="text-xl font-bold text-foreground">Chỉnh sửa lời nhắn</DialogTitle>
                <p className="text-sm text-muted-foreground mt-1">Thay đổi nội dung lời mời kết bạn của bạn</p>
             </div>
             <div className="p-6">
                <textarea 
                    value={editMessage}
                    onChange={(e) => setEditMessage(e.target.value)}
                    placeholder="Nhập lời nhắn mới..." 
                    className="flex w-full min-h-[120px] bg-muted/30 border border-input focus:border-primary focus:ring-4 focus:ring-primary/10 resize-none rounded-xl text-base p-4 placeholder:text-muted-foreground focus-visible:outline-none transition-all text-foreground"
                />
                <div className="flex gap-3 mt-6 justify-end">
                    <Button variant="ghost" onClick={() => setEditingId(null)} className="rounded-xl hover:bg-muted text-muted-foreground">
                        Hủy bỏ
                    </Button>
                    <Button onClick={handleUpdateMessage} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-lg shadow-primary/20 font-medium">
                        Cập nhật
                    </Button>
                </div>
             </div>
        </DialogContent>
    </Dialog>
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <SidebarGroupAction title="Add Friend" className="hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300 hover:scale-110 hover:shadow-sm [&>svg]:transition-transform [&>svg]:duration-300 hover:[&>svg]:scale-110">
          <div className="relative">
            <UserPlus className="size-5" />
            {friendRequests.length > 0 && (
              <span className="absolute -top-1 -right-1 size-2.5 bg-red-500 rounded-full border-2 border-white dark:border-zinc-950" />
            )}
          </div>
        </SidebarGroupAction>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-4xl w-[95vw] p-0 gap-0 bg-white dark:bg-[#020817] rounded-[32px] shadow-2xl border-0 dark:border dark:border-white/10 outline-none overflow-hidden">
        <Tabs defaultValue="find" value={activeTab} onValueChange={setActiveTab} className="w-full h-[750px] flex flex-col">
            
            {/* Header Section */}
            <div className="px-10 pt-10 pb-2 bg-white dark:bg-[#020817] shrink-0 z-10 transition-colors">
                <div className="flex items-center justify-between mb-8">
                     <DialogTitle className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                        Kết bạn & Trò chuyện
                     </DialogTitle>
                     
                     <TabsList className="bg-slate-100 dark:bg-white/5 p-1.5 rounded-full border border-slate-200/60 dark:border-white/10 h-auto">
                        <TabsTrigger value="find" className="rounded-full px-6 py-2.5 text-sm font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 data-[state=active]:shadow-sm data-[state=active]:text-blue-700 dark:data-[state=active]:text-white text-slate-500 dark:text-gray-400 transition-all">
                            Tìm bạn mới
                        </TabsTrigger>
                        <TabsTrigger value="requests" className="flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 data-[state=active]:shadow-sm data-[state=active]:text-blue-700 dark:data-[state=active]:text-white text-slate-500 dark:text-gray-400 transition-all">
                            Lời mời
                            {friendRequests.length > 0 && (
                              <span className="flex items-center justify-center h-5 min-w-[20px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold shadow-sm transition-all animate-in zoom-in">
                                {friendRequests.length > 99 ? '99+' : friendRequests.length}
                              </span>
                            )}
                        </TabsTrigger>
                    </TabsList>
                </div>
            </div>
            
            <div className="flex-1 overflow-hidden bg-white dark:bg-[#020817] transition-colors">
                 {/* TAB 1: FIND FRIENDS */}
                 <TabsContent value="find" className="h-full flex flex-col m-0 data-[state=inactive]:hidden animate-in fade-in slide-in-from-right-4 duration-300">

                    <div className="px-10 py-6 bg-white dark:bg-[#020817] shrink-0 transition-colors">
     {/* Search Bar */}
     <div className="relative group max-w-2xl mx-auto transition-transform duration-300 ease-out hover:scale-[1.02] will-change-transform"> 

        <div className="absolute inset-0 bg-blue-500/5 rounded-full blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
        
        <Input 
            placeholder="Nhập tên, email..." 
            className="pl-6 pr-16 h-16 w-full rounded-full transition-all duration-300 ease-in-out bg-slate-50 dark:bg-white/5 border-2 border-transparent shadow-sm hover:bg-white dark:hover:bg-white/10 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/10 focus-visible:bg-white dark:focus-visible:bg-white/10 focus-visible:border-blue-500 focus-visible:ring-4 focus-visible:ring-blue-500/20 focus-visible:shadow-xl focus-visible:shadow-blue-500/20 placeholder:text-slate-400 dark:placeholder:text-gray-500 text-lg relative z-0 text-slate-900 dark:text-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        
        <Button 
            onClick={handleSearch}
            disabled={isSearching}
            size="icon"
            className="absolute right-4 top-3 h-10 w-10 rounded-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-sm transition-colors border-none z-10 flex items-center justify-center"
        >
            {isSearching ? <Loader2 className="animate-spin size-5 text-white" /> : <Search className="size-5 text-white" />}
        </Button>
     </div>
</div>

                    <div className="flex-1 overflow-y-auto px-10 pb-10 pt-4 scrollbar-thin scrollbar-thumb-rounded-full scrollbar-track-transparent scrollbar-thumb-slate-200 hover:scrollbar-thumb-slate-300 dark:scrollbar-thumb-white/10 dark:hover:scrollbar-thumb-white/20">
                        {searchResults.length === 0 && !isSearching ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-300 dark:text-white/20 gap-6 opacity-60">
                                <div className="p-8 rounded-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                                   <UserPlus className="size-16 text-slate-200 dark:text-white/20" strokeWidth={1.5} />
                                </div>
                                <div className="text-center">
                                  <p className="text-slate-500 dark:text-gray-400 font-medium text-lg">Tìm kiếm bạn bè</p>
                                  <p className="text-sm dark:text-gray-500">Nhập từ khóa để kết nối với cộng đồng Nexa</p>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pb-4">
                                {searchResults.map((user) => {
                                    const isSent = sentRequests.has(user._id) || user.pended;
                                    
                                    const Card = (
                                        <div 
                                          onClick={() => setSelectedProfile({ ...user, bio: "Chưa có giới thiệu." })}
                                          className={`group p-5 rounded-[24px] border border-transparent bg-white dark:bg-white/5 shadow-sm transition-all duration-300 ease-in-out hover:ring-2 hover:ring-blue-500 hover:shadow-xl hover:shadow-blue-500/20 hover:border-blue-500 hover:scale-[1.02] hover:z-10 flex items-center justify-between gap-4 dark:hover:bg-blue-900/10 ${isSent ? 'cursor-context-menu' : 'cursor-pointer'}`}
                                        >
                                            <div className="flex items-center gap-5 overflow-visible">
                                                <div className="relative shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                                                    <Avatar className="size-12 border-2 border-white dark:border-white/10 shadow-sm transition-colors ring-1 ring-slate-100 dark:ring-white/5">
                                                        <AvatarImage src={user.avatar || "/default-avatar.png"} />
                                                        <AvatarFallback className="text-base bg-blue-50 dark:bg-white/10 text-blue-600 dark:text-white font-bold">{user.username?.[0]?.toUpperCase()}</AvatarFallback>
                                                    </Avatar>
                                                    <span className="absolute bottom-0 right-0 size-3 bg-green-500 border-[2px] border-white dark:border-[#020817] rounded-full shadow-sm" />
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <h4 className="text-lg font-bold text-slate-900 dark:text-white leading-tight transition-colors truncate group-hover:text-blue-700 dark:group-hover:text-white">{user.username}</h4>
                                                    <p className="text-sm text-slate-500 dark:text-gray-400 truncate group-hover:text-blue-400 dark:group-hover:text-white/60">{user.email}</p>
                                                    <p className="text-xs text-slate-400 dark:text-gray-500 mt-1 flex items-center gap-1">
                                                       <span className={`size-1.5 rounded-full ${isSent ? "bg-orange-400" : "bg-slate-300 dark:bg-gray-600"}`} />
                                                       {isSent ? "Đã gửi lời mời" : "Chưa kết bạn"}
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            <div className="shrink-0 scale-95 group-hover:scale-100 transition-transform duration-300">
                                                {isSent ? (
                                                    <Button disabled variant="secondary" className="h-12 px-6 rounded-full bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 border border-green-100 dark:border-green-500/20 font-medium shadow-sm">
                                                        <Check className="mr-2 size-4" />
                                                        <span>Đã gửi</span>
                                                    </Button>
                                                ) : (
                                                     <Popover open={requestingId === user._id} onOpenChange={(isOpen: boolean) => {
                                                       if (isOpen) initRequest(user._id);
                                                       else setRequestingId(null);
                                                     }}>
                                                       <PopoverTrigger asChild>
                                                          <Button 
                                                            className="h-12 pl-5 pr-6 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/20 hover:shadow-blue-300 dark:hover:shadow-blue-800/30 transition-all group-hover:scale-105"
                                                            onClick={(e) => { e.stopPropagation(); initRequest(user._id); }}
                                                          >
                                                              <UserPlus className="size-5 sm:mr-2" />
                                                              <span className="hidden sm:inline">Kết bạn</span>
                                                          </Button>
                                                       </PopoverTrigger>
                                                       <PopoverContent className="w-80 p-0 rounded-3xl shadow-2xl border-none ring-1 ring-black/5 dark:ring-white/10" align="end" sideOffset={10}>
                                                          <div className="relative flex flex-col items-center p-6 pt-8 text-center bg-white dark:bg-[#1a1d2d] rounded-3xl overflow-hidden">
                                                            <div className="absolute top-3 right-3 z-10">
                                                              <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full" onClick={(e) => { e.stopPropagation(); setRequestingId(null); }}>
                                                                <X className="size-3" />
                                                              </Button>
                                                            </div>
                                                            <div className="relative mb-3">
                                                              <Avatar className="size-16 border-4 border-white dark:border-[#1a1d2d] shadow-md ring-1 ring-slate-50 dark:ring-white/5">
                                                                <AvatarImage src={user.avatar || "/default-avatar.png"} />
                                                                <AvatarFallback className="bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 text-blue-600 dark:text-blue-300 text-lg font-bold">
                                                                  {user.username?.[0]?.toUpperCase()}
                                                                </AvatarFallback>
                                                              </Avatar>
                                                            </div>
                                                            <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-1">{user.username}</h3>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-5 font-medium">Bạn muốn nhắn gì cho họ không?</p>
                                                            <textarea 
                                                              value={requestMessage}
                                                              onChange={(e) => setRequestMessage(e.target.value)}
                                                              placeholder="VD: Chào bạn, mình là..." 
                                                              className="flex w-full min-h-[80px] bg-slate-50 dark:bg-black/20 border-none focus-visible:ring-2 focus-visible:ring-blue-100 dark:focus-visible:ring-blue-500/30 resize-none rounded-xl text-sm p-3 mb-4 text-center placeholder:text-gray-400/80 dark:placeholder:text-gray-600 focus-visible:outline-none transition-all text-gray-900 dark:text-white"
                                                              autoFocus
                                                              onKeyDown={(e) => {
                                                                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); confirmSendRequest(); }
                                                              }}
                                                            />
                                                            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-200 dark:shadow-blue-900/30 h-10 font-medium transition-all hover:scale-[1.02]" onClick={confirmSendRequest}>
                                                              Gửi kết bạn
                                                            </Button>
                                                          </div>
                                                       </PopoverContent>
                                                     </Popover>
                                                )}
                                            </div>
                                        </div>
                                    )

                                    if (isSent) {
                                      return (
                                        <ContextMenu key={user._id}>
                                          <ContextMenuTrigger asChild>
                                            {Card}
                                          </ContextMenuTrigger>
                                          <ContextMenuContent className="w-56 rounded-xl shadow-xl overflow-hidden p-1 border border-slate-100 dark:border-white/10 bg-white dark:bg-[#1a1d2d]">
                                              <ContextMenuItem className="rounded-lg p-2.5 cursor-pointer font-medium text-slate-600 dark:text-gray-300 focus:bg-blue-50 dark:focus:bg-blue-500/20 focus:text-blue-600 dark:focus:text-blue-400" onClick={() => openEditDialog(user)}>
                                                  <Pencil className="mr-3 size-4" />
                                                  Sửa nội dung
                                              </ContextMenuItem>
                                              <ContextMenuItem className="rounded-lg p-2.5 cursor-pointer font-medium text-red-500 focus:bg-red-50 dark:focus:bg-red-500/10 focus:text-red-600 mt-1" onClick={() => handleCancelRequest(user._id)}>
                                                  <Trash2 className="mr-3 size-4" />
                                                  Hủy lời mời
                                              </ContextMenuItem>
                                          </ContextMenuContent>
                                        </ContextMenu>
                                      )
                                    }

                                    return <div key={user._id}>{Card}</div>
                                })}
                            </div>
                        )}
                    </div>
                 </TabsContent>

                 {/* TAB 2: REQUESTS - SPLIT VIEW */}
                 <TabsContent value="requests" className="h-full flex flex-col outline-none p-0 group data-[state=inactive]:hidden animate-in fade-in slide-in-from-left-4 duration-300">
                     {isLoadingRequests ? (
                        <div className="flex flex-col items-center justify-center h-full gap-2 opacity-50">
                          <Loader2 className="animate-spin size-8 text-blue-500" />
                          <p className="text-xs text-slate-500 dark:text-gray-400 font-medium">Đang tải...</p>
                        </div>
                     ) : friendRequests.length === 0 && sentFriendRequests.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-gray-600 space-y-6 opacity-60">
                           <div className="p-8 rounded-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 shadow-inner">
                             <UserCheck className="size-16 text-slate-200 dark:text-white/10" strokeWidth={1.5} />
                           </div>
                           <div className="text-center space-y-1">
                              <p className="text-lg font-medium text-slate-500 dark:text-gray-400">Không có lời mời nào</p>
                              <p className="text-sm text-slate-400 dark:text-gray-500">Hiện tại bạn không có lời mời kết bạn nào.</p>
                           </div>
                        </div>
                     ) : (
                        <ScrollArea className="h-full px-6 py-6 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-white/10">
                           
                           {/* SECTION 1: INCOMING REQUESTS */}
                           {friendRequests.length > 0 && (
                             <div className="space-y-4">
                                <h4 className="text-sm font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                  <span>Lời mời nhận được</span>
                                  <span className="bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full text-[10px] font-bold">{friendRequests.length}</span>
                                </h4>
                                
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                   {friendRequests.map((request) => {
                                      const sender = (request.senderId && typeof request.senderId === 'object' ? request.senderId : request.sender) as any;
                                      const senderName = sender?.username || "Người dùng chưa rõ";
                                      const senderEmail = sender?.email || "";
                                      const senderAvatar = sender?.avatar || "/default-avatar.png";

                                      return (
                                        <div key={request._id} className="group p-4 rounded-[20px] border border-slate-100 dark:border-white/5 bg-white dark:bg-white/5 shadow-sm hover:shadow-md transition-all hover:border-blue-200/50 dark:hover:border-blue-500/30 flex flex-col gap-3">
                                           <div className="flex items-center gap-3">
                                              <Avatar className="size-12 border-2 border-white dark:border-white/10 shadow-sm shrink-0">
                                                <AvatarImage src={senderAvatar} />
                                                <AvatarFallback className="bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 font-bold text-xs">{senderName?.[0]?.toUpperCase()}</AvatarFallback>
                                              </Avatar>
                                              <div className="flex flex-col overflow-hidden">
                                                 <span className="font-bold text-sm text-slate-900 dark:text-white truncate" title={senderName}>{senderName}</span>
                                                 <span className="text-xs text-slate-500 dark:text-gray-400 truncate" title={senderEmail}>{senderEmail}</span>
                                              </div>
                                           </div>
                                           {request.message && (
                                              <div className="text-[11px] bg-slate-50 dark:bg-black/20 p-2 rounded-lg text-slate-600 dark:text-gray-300 italic border border-slate-100/50 dark:border-white/5 line-clamp-2">
                                                "{request.message}"
                                              </div>
                                           )}
                                           <div className="flex gap-2 w-full pt-1">
                                              <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-200 dark:shadow-blue-900/20 h-8 rounded-lg text-xs font-medium" onClick={() => acceptFriendRequest(request._id)}>
                                                Chấp nhận
                                              </Button>
                                              <Button className="flex-1 border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-gray-300 h-8 rounded-lg text-xs bg-transparent" variant="outline" onClick={() => declineFriendRequest(request._id)}>
                                                Từ chối
                                              </Button>
                                           </div>
                                        </div>
                                      )
                                   })}
                                </div>
                             </div>
                           )}

                           {/* DIVIDER */}
                           {friendRequests.length > 0 && sentFriendRequests.length > 0 && (
                              <Separator className="my-8 bg-slate-100 dark:bg-white/5" />
                           )}

                           {/* SECTION 2: OUTGOING REQUESTS */}
                           {sentFriendRequests.length > 0 && (
                             <div className="space-y-4">
                                <h4 className="text-sm font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                  <span>Đã gửi lời mời</span>
                                  <span className="bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-gray-400 px-2 py-0.5 rounded-full text-[10px] font-bold">{sentFriendRequests.length}</span>
                                </h4>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                   {sentFriendRequests.map((request) => {
                                      const receiver = (request.receiverId && typeof request.receiverId === 'object' ? request.receiverId : null) as any; 
                                      
                                      const receiverName = receiver?.username || "Người dùng";
                                      const receiverAvatar = receiver?.avatar || "/default-avatar.png";

                                      return (
                                        <div key={request._id} className="group p-4 rounded-[20px] border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 hover:bg-white dark:hover:bg-opacity-10 shadow-sm hover:shadow-md transition-all hover:border-slate-200 dark:hover:border-white/10 flex items-center justify-between gap-3">
                                           <div className="flex items-center gap-3 overflow-hidden">
                                              <Avatar className="size-10 border-2 border-white dark:border-white/10 shadow-sm shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                                                <AvatarImage src={receiverAvatar} />
                                                <AvatarFallback className="bg-slate-200 dark:bg-white/10 text-slate-500 dark:text-white font-bold text-xs">{receiverName?.[0]?.toUpperCase()}</AvatarFallback>
                                              </Avatar>
                                              <div className="flex flex-col overflow-hidden">
                                                 <span className="font-semibold text-sm text-slate-700 dark:text-gray-200 truncate group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{receiverName}</span>
                                                 <span className="text-[10px] text-slate-400 dark:text-gray-500">Đã gửi: {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : 'Gần đây'}</span>
                                              </div>
                                           </div>
                                           
                                           <Button 
                                              variant="ghost" 
                                              size="sm" 
                                              className="h-8 px-3 rounded-full text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 font-medium text-xs shrink-0"
                                              onClick={() => cancelFriendRequest(request._id)}
                                           >
                                              Hủy
                                           </Button>
                                        </div>
                                      )
                                   })}
                                </div>
                             </div>
                           )}

                           <div className="h-10" /> {/* Bottom Padding */}
                        </ScrollArea>
                     )}
                 </TabsContent>
            </div>
            
            {/* Edit Message Modal (Global relative to this modal) */}
            <EditRequestDialog />
            
            <UserProfileDialog
                isOpen={!!selectedProfile}
                onClose={(open) => !open && setSelectedProfile(null)}
                user={selectedProfile}
                currentUser={currentUser as UserProfile}
                onSendFriendRequest={() => {
                    if (selectedProfile) {
                        initRequest(selectedProfile._id);
                        setSelectedProfile(null); 
                    }
                }}
            />

        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

export default AddFriendModal