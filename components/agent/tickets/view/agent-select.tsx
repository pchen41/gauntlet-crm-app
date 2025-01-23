'use client'

import { Check, ChevronsUpDown } from "lucide-react"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { createClient } from "@/utils/supabase/client"

interface AgentSelectProps {
  value: string
  onChange: (value: string) => void
}

interface Agent {
  id: string
  name: string
  email: string
}

export function AgentSelect({ value, onChange }: AgentSelectProps) {
  const [open, setOpen] = useState(false)
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)

  // Fetch initial agent data when value is provided
  useEffect(() => {
    const fetchAgent = async () => {
      if (value) {
        const supabase = createClient()
        const { data } = await supabase
          .from('profiles')
          .select('id, name, email')
          .eq('id', value)
          .single()
        
        if (data) {
          setSelectedAgent(data)
        }
      }
    }
    fetchAgent()
  }, [value])

  const searchAgents = async (search: string) => {
    if (search === "") {
      setAgents([])
      return
    }
    setLoading(true)
    const supabase = createClient()
    
    let query = supabase
      .from('profiles')
      .select('id, name, email')
      .contains('roles', ['agent'])

    if (value) {  // Only exclude current agent if one is selected
      query = query.neq('id', value)
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`)
    }

    const { data, error } = await query.limit(5)

    if (error) {
      console.error('Error searching agents:', error)
    } else {
      setAgents(data || [])
    }
    
    setLoading(false)
  }

  // Initial search when opened
  useEffect(() => {
    if (open) {
      searchAgents('')
    }
  }, [open])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between text-sm"
        >
          {selectedAgent ? (
            <span className="flex-1 text-left">
              {selectedAgent.name} ({selectedAgent.email})
            </span>
          ) : (
            <span className="text-muted-foreground">Not assigned</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-2" align="start">
        <div className="space-y-2">
          <Input
            placeholder="Search by name or email..."
            className="h-8"
            onChange={(e) => searchAgents(e.target.value)}
          />
          <div>
            <Button
              variant="ghost"
              className="w-full justify-start text-left mb-1 pl-2"
              onClick={() => {
                onChange("")
                setSelectedAgent(null)
                setOpen(false)
              }}
            >
              <div className="flex-1">
                <div className="text-muted-foreground">Not assigned</div>
              </div>
            </Button>
            {loading ? (
              <div className="py-2 text-sm text-muted-foreground text-center">
                Searching...
              </div>
            ) : agents.length === 0 ? (
              <div className="py-2 text-sm text-muted-foreground text-center">
                No agents found.
              </div>
            ) : (
              <div className="space-y-1">
                {agents.map((agent) => (
                  <Button
                    key={agent.id}
                    variant="ghost"
                    className="w-full justify-start text-left pl-2 h-12"
                    onClick={() => {
                      onChange(agent.id)
                      setSelectedAgent(agent)
                      setOpen(false)
                    }}
                  >
                    <div className="flex-1">
                      <div>{agent.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {agent.email}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
} 