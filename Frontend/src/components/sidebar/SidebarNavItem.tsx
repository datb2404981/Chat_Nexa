import React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";

interface SidebarNavItemProps {
  icon: LucideIcon;
  label: string;
  isActive?: boolean;
  isCollapsed?: boolean;
  onClick?: () => void;
}

export const SidebarNavItem: React.FC<SidebarNavItemProps> = ({
  icon: Icon,
  label,
  isActive = false,
  isCollapsed = false,
  onClick,
}) => {
  const ButtonContent = (
    <button
      onClick={onClick}
      className={cn(
        "relative flex items-center rounded-md transition-all duration-300 group outline-none",
        isCollapsed 
          ? "justify-center w-10 h-10 p-0 mx-auto" // w-10 h-10 là chuẩn nhất cho icon center
          : "justify-start w-full gap-3 p-3 px-4",
        isActive
          ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
          : "text-gray-500 hover:bg-blue-50 hover:text-blue-600"
      )}
    >
      <Icon
        className={cn(
          "transition-all duration-300",
          isCollapsed ? "size-5" : "size-5", // Size 5 (20px) là chuẩn đẹp
          isActive ? "text-white" : "text-current"
        )}
      />
      {!isCollapsed && (
        <span className="font-medium truncate text-sm transition-all duration-300 animate-in fade-in zoom-in-50">
          {label}
        </span>
      )}
    </button>
  );

  if (!isCollapsed) {
    return ButtonContent;
  }

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          {/* Div bọc ngoài để trigger tooltip ổn định hơn */}
          <div className="w-full flex justify-center">
            {ButtonContent}
          </div>
        </TooltipTrigger>
        
        {/* 👇 FIX LỖI TOOLTIP BỊ CẮT */}
        <TooltipContent 
          side="right" 
          sideOffset={10} // Cách ra 1 chút cho thoáng
          className="z-[9999] bg-slate-900 text-white border-none font-medium shadow-xl"
        >
          {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};