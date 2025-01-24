import { createClient } from '@/utils/supabase/server'
import { TeamsList } from '@/components/agent/teams/teams-list'
import { CreateTeamButton } from '@/components/agent/teams/create-team-button'
import { Separator } from '@/components/ui/separator'

export default async function TeamsPage() {
  const supabase = await createClient()
  
  const { data: teams } = await supabase
    .from('teams')
    .select('*, team_members(agent_id)')
    .order('name')

  return (
    <div className="container mx-auto py-10 pt-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Teams</h1>
        <CreateTeamButton />
      </div>
      <Separator className="my-6" />
      <TeamsList teams={teams || []} />
    </div>
  )
}
