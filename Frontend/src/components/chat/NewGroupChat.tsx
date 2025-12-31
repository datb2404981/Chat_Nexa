import React from 'react'
import { Plus } from 'lucide-react'
import { SidebarGroupAction } from "@/components/ui/sidebar"
import CreateGroupModal from "./CreateGroupModal"

const NewGroupChat = () => {
  const [open, setOpen] = React.useState(false)

  return (
    <>
      <SidebarGroupAction 
        title="New Group" 
        onClick={() => setOpen(true)}
        className="hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300 hover:scale-110 hover:shadow-sm [&>svg]:transition-transform [&>svg]:duration-300 hover:[&>svg]:rotate-90"
      >
        <Plus />
      </SidebarGroupAction>
      
      <CreateGroupModal open={open} onOpenChange={setOpen} />
    </>
  )
}

export default NewGroupChat