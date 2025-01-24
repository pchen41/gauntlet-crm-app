'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Avatar } from '@/components/ui/avatar'
import UserAvatar from '@/components/user/user-avatar'
import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'

interface TeamMembersDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  teamId: string
  memberCount: number
}

interface TeamMember {
  id: string
  name: string | null
  email: string | null
}

export function TeamMembersDialog({
  open,
  onOpenChange,
  teamId,
  memberCount
}: TeamMembersDialogProps) {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadMembers() {
      if (!open) return
      
      setLoading(true)
      const supabase = createClient()
      const { data } = await supabase
        .from('team_members')
        .select(`
          agent:profiles (
            id,
            name,
            email
          )
        `)
        .eq('team_id', teamId)

      if (data) {
        const memberData = data.map(d => d.agent as unknown as TeamMember)
        setMembers(memberData)
      }
      setLoading(false)
    }

    loadMembers()
  }, [teamId, open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Team Members ({memberCount})</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading members...</p>
          ) : members.length === 0 ? (
            <p className="text-sm text-muted-foreground">No members found</p>
          ) : (
            <div className="space-y-2">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center space-x-2 p-3 bg-muted rounded-md"
                >
                  <Avatar className="h-8 w-8">
                    <UserAvatar
                      name={member.name || 'Unknown'}
                      email={member.email || undefined}
                    />
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">{member.name || 'Unnamed'}</span>
                    <span className="text-xs text-muted-foreground">
                      {member.email || 'No email'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
} 