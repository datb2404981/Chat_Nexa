import React from 'react'
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import { Button } from '../ui/button';

import { useThemeStore } from '@/store/useThemeStore';
import { Smile } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

interface EmojiiPickerProps {
  onChange: (emoji: any) => void;
}

const EmojiiPicker = ({ onChange }: EmojiiPickerProps) => {
  const { theme } = useThemeStore();
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-primary/10">
          <Smile className='size-5 text-muted-foreground hover:text-primary transition-colors'/>
        </Button>
      </PopoverTrigger>

      <PopoverContent className="border-none bg-transparent shadow-none mb-14 drop-shadow-none" side="right" sideOffset={40}>
        <Picker
          theme={theme === 'system' ? 'auto' : theme}
          data={data}
          onEmojiSelect={(emoji: any) => onChange(emoji.native)}
          emojiSize={24}
        />
      </PopoverContent>
    </Popover>
  )
}

export default EmojiiPicker