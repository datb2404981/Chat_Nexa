import { useEffect } from "react";
import { useSocketStore } from "@/store/useSocketStore";
import { useChatStore } from "@/store/useChatStore";

export const useOnlineStatus = () => {
  const { socket } = useSocketStore();
  const { updateUserStatus, setOnlineUsers, onNewConversation } = useChatStore();

  useEffect(() => {
    if (!socket) return;

    const handleStatusChange = ({ userId, isOnline }: { userId: string, isOnline: boolean }) => {
      console.log("🔥 [Socket Event] user_status_change:", userId, isOnline);
      updateUserStatus(userId, isOnline);
    };

    const handleInitialOnlineProps = (userIds: string[]) => {
      setOnlineUsers(userIds);
    }

    const handleNewConversation = (conversation: any) => {
        // console.log("🔥 [Socket Event] on_new_conversation:", conversation);
        onNewConversation(conversation);
    }

    socket.on("user_status_change", handleStatusChange);
    socket.on("initial_online_users", handleInitialOnlineProps);
    socket.on("on_new_conversation", handleNewConversation);

    return () => {
      socket.off("user_status_change", handleStatusChange);
      socket.off("initial_online_users", handleInitialOnlineProps);
      socket.off("on_new_conversation", handleNewConversation);
    };
  }, [socket, updateUserStatus, setOnlineUsers, onNewConversation]);
};
