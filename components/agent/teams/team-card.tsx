'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ManageTeamDialog } from '@/components/agent/teams/manage-team-dialog'
import { TeamMembersDialog } from '@/components/agent/teams/team-members-dialog'
import { useState } from 'react'
import { Users } from 'lucide-react'

interface TeamCardProps {
  team: {
    id: string
    name: string
    description: string
    team_members: { agent_id: string }[]
  }
  isAdmin: boolean
}

export function TeamCard({ team, isAdmin }: TeamCardProps) {
  const [showMembers, setShowMembers] = useState(false)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{team.name}</CardTitle>
          {isAdmin && <ManageTeamDialog team={team} />}
        </div>
        <CardDescription>{team.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          variant="ghost" 
          className="h-auto p-0 hover:bg-transparent"
          onClick={() => setShowMembers(true)}
        >
          <Users className="h-4 w-4" />
          <span className="text-sm">
            {team.team_members.length} members
          </span>
        </Button>
        <TeamMembersDialog
          open={showMembers}
          onOpenChange={setShowMembers}
          teamId={team.id}
          memberCount={team.team_members.length}
        />
      </CardContent>
    </Card>
  )
} 