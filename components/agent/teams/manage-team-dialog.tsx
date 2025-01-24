'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { createClient } from '@/utils/supabase/client'
import { MoreHorizontal } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { TeamMemberSelect } from '@/components/agent/teams/team-member-select'

interface ManageTeamDialogProps {
  team: {
    id: string
    name: string
    description: string
    team_members: { agent_id: string }[]
  }
}

export function ManageTeamDialog({ team }: ManageTeamDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const name = formData.get('name') as string
    const description = formData.get('description') as string

    const supabase = createClient()
    const { error } = await supabase
      .from('teams')
      .update({ name, description })
      .eq('id', team.id)

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update team"
      })
    } else {
      toast({
        title: "Success",
        description: "Team updated successfully"
      })
      setOpen(false)
      router.refresh()
    }

    setLoading(false)
  }

  async function onDelete() {
    if (!confirm('Are you sure you want to delete this team?')) return

    const supabase = createClient()
    const { error } = await supabase
      .from('teams')
      .delete()
      .eq('id', team.id)

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete team"
      })
    } else {
      toast({
        title: "Success",
        description: "Team deleted successfully"
      })
      setOpen(false)
      router.refresh()
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="link" className="h-2">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setOpen(true)}>
            Edit Team
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onDelete} className="text-red-600">
            Delete Team
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Team</DialogTitle>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                defaultValue={team.name}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={team.description}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Team Members</Label>
              <TeamMemberSelect
                teamId={team.id}
                currentMembers={team.team_members}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              Save Changes
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
} 