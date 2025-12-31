import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Settings, UserPlus } from "lucide-react"

export interface UserProfile {
    _id: string;
    username: string;
    email: string;
    avatar?: string;
    bio?: string;
}

interface UserProfileDialogProps {
    isOpen: boolean;
    onClose: (open: boolean) => void;
    user: UserProfile | null;
    currentUser: UserProfile | null;
    onEditProfile?: () => void;
    onSendFriendRequest?: () => void;
}

export function UserProfileDialog({ 
    isOpen, 
    onClose, 
    user, 
    currentUser, 
    onEditProfile,
    onSendFriendRequest 
}: UserProfileDialogProps) {
    if (!user) return null;

    // Check if the viewed user is the current user
    const isMe = currentUser?._id === user._id;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md p-0 overflow-hidden gap-0 transition-all duration-200 bg-white dark:bg-[#020817] border-slate-200 dark:border-white/10">
                
                {/* 1. COVER: Bright in Light, Dim/Deep in Dark */}
                <div className="h-32 bg-gradient-to-r from-blue-400 to-indigo-500 dark:from-blue-900/50 dark:to-indigo-900/50" />
                
                <div className="px-6 pb-6 relative">
                    {/* 2. AVATAR: Border matches modal background for cutout effect */}
                    <Avatar className="h-24 w-24 absolute -top-12 shadow-xl border-4 border-white dark:border-[#020817]">
                        <AvatarImage src={user.avatar || "/default-avatar.png"} />
                        <AvatarFallback className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-200 text-2xl font-bold">
                             {user.username?.[0]?.toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    
                    {/* 3. INFO: Semantic Colors for Dual Mode */}
                    <div className="mt-14 space-y-1.5">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                             {user.username}
                        </h2>
                        <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                             {user.email}
                        </p>
                        
                        <div className="pt-2">
                             <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                                  {user.bio || "Chưa có giới thiệu bản thân."}
                             </p>
                        </div>
                    </div>
                    
                    {/* 4. ACTIONS */}
                    <div className="mt-8 flex gap-3">
                         {isMe ? (
                                <Button 
                                    className="w-full border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-900 dark:text-white" 
                                    variant="outline" 
                                    onClick={onEditProfile}
                                >
                                     <Settings className="w-4 h-4 mr-2" /> Chỉnh sửa hồ sơ
                                </Button>
                         ) : (
                                <Button 
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20"
                                    onClick={onSendFriendRequest}
                                >
                                     <UserPlus className="w-4 h-4 mr-2" /> Kết bạn
                                </Button>
                         )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
