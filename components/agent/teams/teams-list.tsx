import { TeamCard } from '@/components/agent/teams/team-card'

interface TeamsListProps {
  teams: {
    id: string
    name: string
    description: string
    team_members: { agent_id: string }[]
  }[]
  isAdmin: boolean
}

export function TeamsList({ teams, isAdmin }: TeamsListProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {teams.map((team) => (
        <TeamCard key={team.id} team={team} isAdmin={isAdmin} />
      ))}
    </div>
  )
} 