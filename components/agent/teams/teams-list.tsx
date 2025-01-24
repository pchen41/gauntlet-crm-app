import { TeamCard } from '@/components/agent/teams/team-card'

interface TeamsListProps {
  teams: {
    id: string
    name: string
    description: string
    team_members: { agent_id: string }[]
  }[]
}

export function TeamsList({ teams }: TeamsListProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {teams.map((team) => (
        <TeamCard key={team.id} team={team} />
      ))}
    </div>
  )
} 