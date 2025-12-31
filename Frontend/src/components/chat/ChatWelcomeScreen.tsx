import { SidebarInset, useSidebar } from '../ui/sidebar'
import ChatWindowHeader from './ChatWindowHeader';
import { Button } from '../ui/button';
import { MessageSquarePlus, ShieldCheck, Heart, CheckCircle2, MessageCircle } from 'lucide-react';

const ChatWelcomeScreen = () => {
  const { setOpen } = useSidebar();
  return (
    <SidebarInset className='flex w-full h-full bg-white dark:bg-zinc-950 relative overflow-hidden'> 
      {/* Background Pattern */}
      <div className="absolute inset-0 h-full w-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] dark:bg-[radial-gradient(#27272a_1px,transparent_1px)] opacity-50 pointer-events-none" />
      
      <ChatWindowHeader />
      
      <div className='flex flex-col flex-1 items-center justify-center p-8 animate-in fade-in duration-500'>
        <div className='max-w-2xl w-full flex flex-col items-center space-y-10 text-center'>
          
          {/* Central Icon Cluster */}
          <div className="relative group">
            {/* Main Icon Box */}
            <div className="w-48 h-48 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-blue-500/10 rotate-3 transition-transform duration-500 group-hover:rotate-6 group-hover:scale-105">
               <div className="bg-white dark:bg-slate-950 p-8 rounded-3xl shadow-sm text-blue-600 dark:text-blue-400">
                  <MessageCircle size={80} className="fill-current" />
               </div>
            </div>

            {/* Floating Decorative Elements */}
            <div className="absolute -top-4 -right-4 bg-green-100 dark:bg-green-900/30 p-3 rounded-full shadow-lg animate-bounce delay-700 duration-[2000ms]">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            
            <div className="absolute -bottom-4 -left-6 bg-red-100 dark:bg-red-900/30 p-3 rounded-full shadow-lg animate-bounce delay-100 duration-[2500ms]">
               <Heart className="w-8 h-8 text-rose-500 fill-rose-500" />
            </div>

            {/* Background Glow */}
            <div className="absolute inset-0 bg-blue-500/20 blur-3xl -z-10 rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          </div>

          {/* Typography */}
          <div className="space-y-6">
            <h2 className='text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent'>
               Chào mừng bạn đến với <br/> <span className="bg-gradient-to-r from-[#3b82f6] to-[#06b6d4] bg-clip-text text-transparent font-extrabold drop-shadow-sm">Chat Nexa !</span>
            </h2>
            <p className='text-muted-foreground text-xl leading-relaxed max-w-lg mx-auto'>
              Kết nối với bạn bè và đồng nghiệp trong thời gian thực. Chọn một cuộc hội thoại từ thanh bên để bắt đầu trò chuyện hoặc tạo mới.
            </p>
          </div>

          {/* Call to Action */}
          <Button 
            size="lg" 
            className="rounded-full px-10 h-14 gap-3 text-lg font-medium shadow-md shadow-blue-500/20 hover:shadow-blue-500/40 transition-all hover:-translate-y-1"
            onClick={() => {
              setOpen(true);
              
              // Trigger flash effect in AppSidebar
              window.dispatchEvent(new Event('trigger-search-flash'));

              setTimeout(() => {
                const searchInput = document.getElementById('search-chat-input');
                searchInput?.focus();
              }, 100);
            }}
          >
            <MessageSquarePlus size={24} />
            Bắt đầu cuộc trò chuyện mới
          </Button>
        </div>
      </div>
    </SidebarInset>
  )
}

export default ChatWelcomeScreen