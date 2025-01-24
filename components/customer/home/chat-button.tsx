'use client'

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { useState } from "react"

export function ChatButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button variant="secondary" className="w-full" onClick={() => setOpen(true)}>
        Start Chat
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Not Implemented</DialogTitle>
            <DialogDescription>
              AI Chat support coming next week :)
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  )
} 