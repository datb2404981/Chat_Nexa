import React from 'react'
import { Button } from '../ui/button'
import { useAuthStore } from '@/store/useAuthStore';
import { useNavigate } from 'react-router';
import { LogOut } from 'lucide-react';

export const LogOutButton = () => {

  const {logOut} = useAuthStore();
  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      const isSuccess = await logOut();
      if (isSuccess) {
        navigate("/login");
      }
    } catch (error) { 
      console.log(error);
    }
  }

  return (
    <div onClick={handleLogout} className="flex items-center gap-2 w-full cursor-pointer">
      <LogOut className="text-red-600 size-4" />
      <span className="text-red-600 font-medium">Log Out</span>
    </div>
    
  )
}
