import { createClient } from '@/utils/supabase/server'
import { TeamsList } from '@/components/agent/teams/teams-list'
import { CreateTeamButton } from '@/components/agent/teams/create-team-button'
import { Separator } from '@/components/ui/separator'
import { redirect } from 'next/navigation'

export default async function TeamsPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('roles')
    .eq('id', user.id)
    .single()

  const isAdmin = profile?.roles?.includes('admin')

  const { data: teams } = await supabase
    .from('teams')
    .select('*, team_members(agent_id)')
    .order('name')

  return (
    <div className="container mx-auto py-10 pt-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Teams</h1>
        {isAdmin && <CreateTeamButton />}
      </div>
      <Separator className="my-6" />
      <TeamsList teams={teams || []} isAdmin={isAdmin} />
    </div>
  )
}
