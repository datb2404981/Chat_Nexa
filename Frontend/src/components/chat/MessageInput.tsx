import type { Conversation } from '@/types/chat'
import React, { useState, useRef } from 'react'
import { Button } from '../ui/button';
import { ImagePlus, Send } from 'lucide-react';
import { Input } from '../ui/input';
import { useAuthStore } from '@/store/useAuthStore';
import EmojiiPicker from './EmojiiPicker';
import { useChatStore } from '@/store/useChatStore';
import { toast } from 'sonner';

const MessageInput = ({ selectedConvo }: { selectedConvo: Conversation }) => {
  const { user } = useAuthStore();
  const [value, setValue] = useState("");
  const { sendMessage, sendImageMessage } = useChatStore(); // removed uploadFile
  const fileInputRef = useRef<HTMLInputElement>(null);


  if (!user) return;

  const handleSendMessage = async()=>{
    if (!value.trim()) return;
    const currValue = value;
    setValue("");

    try {
      await sendMessage(selectedConvo._id, currValue);
    } catch (error) {
      console.error(error);
      toast.error("Gửi tin nhắn thất bại. Bạn hãy thử lại!");
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Use sendImageMessage from store which handles optimistic updates
    await sendImageMessage(selectedConvo._id, file);
    
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleSendMessage();
    }
  } 

  return (
    <div className='flex items-center gap-3 p-4 border-t bg-background w-full transition-all'>
      {/* Capsule Input Area */}
      <div className='flex-1 flex items-center gap-2 bg-muted rounded-[24px] px-4 py-2 border border-transparent transition-all duration-200 focus-within:bg-background focus-within:ring-2 focus-within:ring-blue-600 focus-within:shadow-sm'>
        
        {/* Left Action: Image */}
        <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*"
            onChange={handleImageUpload}
        />
        <Button 
          variant='ghost' 
          size="icon" 
          onClick={() => fileInputRef.current?.click()}
          className='size-8 rounded-full text-muted-foreground hover:text-primary hover:bg-background/80 shrink-0 transition-colors'
        >
          <ImagePlus className='size-5'/>
        </Button>

        {/* Center: Input */}
        <Input
          onKeyDown={handleKeyPress}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Nhập tin nhắn..."
          className="flex-1 bg-transparent border-none shadow-none outline-none focus:ring-0 focus:outline-none focus:border-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:shadow-none focus-visible:translate-y-0 px-2 h-auto py-0 placeholder:text-muted-foreground/70 text-base"
        />

        {/* Right Action: Emoji */}
        <div className='shrink-0 mr-1'>
          <EmojiiPicker onChange={(emoji) => setValue(`${value}${emoji}`)}/>
        </div>
      </div>

      {/* Send Button */}
      <Button 
        size="icon"
        className={`rounded-full shrink-0 transition-all duration-300 ${
           value.trim() 
             ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 shadow-md hover:shadow-lg" 
             : "bg-muted text-muted-foreground opacity-50 cursor-not-allowed"
        }`}
        disabled={!value.trim()}
        onClick={handleSendMessage}
      >
          <Send className={`size-5 transition-transform duration-300 ${value.trim() ? "translate-x-0.5 ml-[-2px]" : ""}`}/>
      </Button>
    </div>
  )
}

export default MessageInput