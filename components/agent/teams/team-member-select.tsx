'use client'

import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useToast } from '@/hooks/use-toast'
import { createClient } from '@/utils/supabase/client'
import { Check, ChevronDown } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface TeamMemberSelectProps {
  teamId: string
  currentMembers: { agent_id: string }[]
}

export function TeamMemberSelect({
  teamId,
  currentMembers,
}: TeamMemberSelectProps) {
  const [open, setOpen] = useState(false)
  const [agents, setAgents] = useState<{ id: string; name: string }[]>([])
  const [selectedAgents, setSelectedAgents] = useState<Set<string>>(
    new Set(currentMembers.map((m) => m.agent_id))
  )
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    async function loadAgents() {
      const supabase = createClient()
      const { data } = await supabase
        .from('profiles')
        .select('id, name')
        .contains('roles', ['agent'])

      if (data) {
        setAgents(data)
      }
    }

    loadAgents()
  }, [])

  async function toggleAgent(agentId: string) {
    const supabase = createClient()
    const newSelected = new Set(selectedAgents)

    if (selectedAgents.has(agentId)) {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('team_id', teamId)
        .eq('agent_id', agentId)

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to remove team member"
        })
        return
      }

      newSelected.delete(agentId)
    } else {
      const { error } = await supabase
        .from('team_members')
        .insert([{ team_id: teamId, agent_id: agentId }])

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to add team member"
        })
        return
      }

      newSelected.add(agentId)
    }

    setSelectedAgents(newSelected)
    router.refresh()
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedAgents.size} members selected
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Search agents..." className="h-9" />
          <CommandEmpty>No agents found.</CommandEmpty>
          <CommandGroup>
            {agents.map((agent) => (
              <CommandItem
                key={agent.id}
                onSelect={() => toggleAgent(agent.id)}
              >
                {agent.name}
                <Check
                  className={`ml-auto h-4 w-4 ${
                    selectedAgents.has(agent.id) ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
} 