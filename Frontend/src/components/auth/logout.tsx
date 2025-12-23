import React from 'react'
import { Button } from '../ui/button'
import { useAuthStore } from '@/store/useAuthStore';
import { useNavigate } from 'react-router';

export const LogOut = () => {

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
    <Button onClick={handleLogout}>logout</Button>
  )
}
