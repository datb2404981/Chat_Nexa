import ChatWindownLayout from "@/components/chat/ChatWindownLayout";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

const ChatAppPage = () => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="flex flex-1 flex-col p-4">
          <ChatWindownLayout />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default ChatAppPage;