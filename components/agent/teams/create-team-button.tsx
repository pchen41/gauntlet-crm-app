'use client'

import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { CreateTeamDialog } from '@/components/agent/teams/create-team-dialog'

export function CreateTeamButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        Create Team
      </Button>
      <CreateTeamDialog open={open} onOpenChange={setOpen} />
    </>
  )
} 