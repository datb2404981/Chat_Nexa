import { LogOut } from "@/components/auth/logout";
import { useAuthStore } from "@/store/useAuthStore";
import React from 'react'

const ChatAppPage = () => {
  const user = useAuthStore((s) => s.user);
  return (
    <>
      <div>ChatAppPage</div>
      {user?.username}
      <LogOut/>
    </>
  )
}

export default ChatAppPage