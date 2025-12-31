import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Camera, Moon, Sun, Monitor, Loader2, User, Settings } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthStore } from "@/store/useAuthStore";
import { useThemeStore } from "@/store/useThemeStore";

import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { uploadService } from "@/services/upload.service";

// Zod Schema
const profileSchema = z.object({
  username: z.string().min(1, "Username không được để trống"),
  bio: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface SettingsDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode; // Can serve as trigger
}


// ...

export function SettingsDialog({ open, onOpenChange, children }: SettingsDialogProps) {
  const { user, updateProfile } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const [internalOpen, setInternalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Manage open state (either props or internal)
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;
  const handleOpenChange = (val: boolean) => {
    if (!isControlled) setInternalOpen(val);
    onOpenChange?.(val);
  };

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: user?.username || "",
      bio: user?.bio || "",
    },
  });

  // Sync form with user data when dialog opens
  useEffect(() => {
    if (isOpen && user) {
      setValue("username", user.username || "");
      setValue("bio", user.bio || "");
    }
  }, [isOpen, user, setValue]);

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      setIsLoading(true);
      await updateProfile(data);
    } catch (error) {
       toast.error("Không thể cập nhật hồ sơ");
    } finally {
      setIsLoading(false);
    }
  };
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      setIsUploading(true);
      const { url } = await uploadService.uploadAvatar(file);
      await updateProfile({ 
          username: user.username,
          bio: user.bio,
          avatar: url 
      });
    } catch (error) {
// ...
      console.error(error);
      toast.error("Cập nhật ảnh đại diện thất bại");
    } finally {
      setIsUploading(false);
      useAuthStore.getState().fetchMe();
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {children && <DialogTrigger api-as-child>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-[600px] p-0 gap-0 overflow-hidden bg-white dark:bg-zinc-950 rounded-2xl border-none shadow-2xl">
        
        {/* Header - Hidden visually but needed for a11y or custom styled */}
        <DialogHeader className="sr-only">
          <DialogTitle>Cài đặt & Hồ sơ</DialogTitle>
          <DialogDescription>
            Chi tiết cài đặt hồ sơ và giao diện người dùng.
          </DialogDescription>
        </DialogHeader>

        <div className="flex h-[500px]">
          {/* Sidebar / Tabs List */}
          <Tabs defaultValue="profile" className="flex flex-1 w-full flex-row">
            <div className="w-[160px] border-r bg-slate-50/50 dark:bg-zinc-900/50 p-4 flex flex-col gap-2">
                 <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">Cài đặt</h2>
                 <TabsList className="flex flex-col h-auto bg-transparent gap-1 p-0 w-full justify-start">
                    <TabsTrigger 
                        value="profile" 
                        className="w-full justify-start px-3 py-2 h-9 text-sm font-medium rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 dark:data-[state=active]:bg-zinc-800 dark:data-[state=active]:text-blue-400"
                    >
                        <User size={16} className="mr-2" /> Hồ sơ
                    </TabsTrigger>
                    <TabsTrigger 
                        value="general" 
                        className="w-full justify-start px-3 py-2 h-9 text-sm font-medium rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 dark:data-[state=active]:bg-zinc-800 dark:data-[state=active]:text-blue-400"
                    >
                        <Settings size={16} className="mr-2" /> Chung
                    </TabsTrigger>
                 </TabsList>
            </div>

            {/* Content Area */}
            <div className="flex-1 bg-white dark:bg-zinc-950 flex flex-col">
                
                {/* 1. PROFILE TAB */}
                <TabsContent value="profile" className="flex-1 m-0 p-8 outline-none data-[state=active]:flex flex-col gap-6 focus-visible:ring-0">
                    <div className="mb-2">
                        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Hồ sơ cá nhân</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Quản lý thông tin hiển thị của bạn</p>
                    </div>

                    {/* Avatar Upload UI */}
                    <div className="flex justify-center my-4">
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                        <div 
                            className="relative group cursor-pointer"
                            onClick={() => !isUploading && fileInputRef.current?.click()}
                        >
                             <Avatar className="w-24 h-24 border-4 border-slate-50 dark:border-zinc-900 shadow-xl">
                                  <AvatarImage src={user?.avatar} className={isUploading ? "opacity-50" : ""} />
                                  <AvatarFallback className="text-2xl bg-slate-200 dark:bg-zinc-800">{user?.username?.[0]?.toUpperCase()}</AvatarFallback>
                             </Avatar>
                             
                             {/* Loading Spinner */}
                             {isUploading && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full z-20">
                                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                                </div>
                             )}

                             {/* Camera Overlay */}
                             {!isUploading && (
                                 <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white backdrop-blur-[1px]">
                                     <Camera size={24} />
                                 </div>
                             )}
                             
                             {/* Badge */}
                             <div className="absolute bottom-0 right-0 p-1.5 bg-blue-600 rounded-full text-white border-4 border-white dark:border-zinc-950 shadow-sm z-10">
                                 <Camera size={14} />
                             </div>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 flex-1">
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-slate-500 uppercase">Tên hiển thị</Label>
                                <Input 
                                    {...register("username")}
                                    className="bg-slate-50 dark:bg-zinc-900 border-slate-100 dark:border-zinc-800 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 h-10 shadow-sm font-medium" 
                                    placeholder="Username của bạn"
                                />
                                {errors.username && <p className="text-red-500 text-xs">{errors.username.message}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-slate-500 uppercase">Giới thiệu (Bio)</Label>
                                <Input 
                                    {...register("bio")}
                                    className="bg-slate-50 dark:bg-zinc-900 border-slate-100 dark:border-zinc-800 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 h-10 shadow-sm font-medium" 
                                    placeholder="Giới thiệu ngắn về bạn..."
                                />
                            </div>
                        </div>

                        <div className="flex justify-end pt-4 mt-auto">
                            <Button 
                                type="submit" 
                                disabled={isLoading}
                                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 font-semibold shadow-lg shadow-blue-500/20"
                            >
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Lưu thay đổi
                            </Button>
                        </div>
                    </form>
                </TabsContent>

                {/* 2. GENERAL TAB */}
                <TabsContent value="general" className="flex-1 m-0 p-8 outline-none data-[state=active]:flex flex-col gap-6 focus-visible:ring-0">
                    <div className="mb-2">
                        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Giao diện</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Tùy chỉnh giao diện ứng dụng</p>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        {/* Light Mode */}
                         <div 
                            onClick={() => setTheme('light')}
                            className={cn(
                                "cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center gap-3 transition-all hover:bg-slate-50 dark:hover:bg-zinc-900",
                                theme === 'light' ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/10 ring-1 ring-blue-500" : "border-slate-200 dark:border-zinc-800"
                            )}
                         >
                            <div className="p-3 bg-white dark:bg-zinc-950 rounded-full shadow-sm border border-slate-100 dark:border-zinc-800">
                                <Sun size={20} className={theme === 'light' ? "text-blue-500" : "text-slate-400"} />
                            </div>
                            <span className={cn("text-sm font-medium", theme === 'light' ? "text-blue-600" : "text-slate-600")}>Sáng</span>
                         </div>

                         {/* Dark Mode */}
                         <div 
                            onClick={() => setTheme('dark')}
                            className={cn(
                                "cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center gap-3 transition-all hover:bg-slate-50 dark:hover:bg-zinc-900",
                                theme === 'dark' ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/10 ring-1 ring-blue-500" : "border-slate-200 dark:border-zinc-800"
                            )}
                         >
                            <div className="p-3 bg-zinc-900 rounded-full shadow-sm border border-zinc-800">
                                <Moon size={20} className={theme === 'dark' ? "text-blue-500" : "text-slate-400"} />
                            </div>
                            <span className={cn("text-sm font-medium", theme === 'dark' ? "text-blue-600" : "text-slate-600")}>Tối</span>
                         </div>

                         {/* System Mode */}
                         <div 
                            onClick={() => setTheme('system')}
                            className={cn(
                                "cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center gap-3 transition-all hover:bg-slate-50 dark:hover:bg-zinc-900",
                                theme === 'system' ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/10 ring-1 ring-blue-500" : "border-slate-200 dark:border-zinc-800"
                            )}
                         >
                            <div className="p-3 bg-slate-100 dark:bg-zinc-800 rounded-full shadow-sm border border-slate-200 dark:border-zinc-700">
                                <Monitor size={20} className={theme === 'system' ? "text-blue-500" : "text-slate-400"} />
                            </div>
                            <span className={cn("text-sm font-medium", theme === 'system' ? "text-blue-600" : "text-slate-600")}>Hệ thống</span>
                         </div>
                    </div>
                </TabsContent>

            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
