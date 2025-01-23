'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AgentSelect } from './agent-select'
import { createClient } from "@/utils/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Agent {
  id: string
  name: string
  email: string
}

interface TicketField {
  id: string
  name: string
  value: string
  type: 'text' | 'number' | 'select' | 'agent'
  choices?: string[]
}

interface TicketFieldsProps {
  ticketId: string
  fields: TicketField[]
  tags: string[]
}

export function TicketFields({ ticketId, fields, tags }: TicketFieldsProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [fieldValues, setFieldValues] = useState<TicketField[]>(fields)
  const [originalValues, setOriginalValues] = useState<TicketField[]>(fields)
  const [agentDetails, setAgentDetails] = useState<Record<string, Agent>>({})
  const [tagValues, setTagValues] = useState<string[]>(tags)

  // Fetch agent details for all agent values
  useEffect(() => {
    const fetchAgentDetails = async () => {
      const agentIds = fieldValues
        .filter(field => field.value && field.type === 'agent')
        .map(field => field.value)
      
      if (agentIds.length === 0) return

      const supabase = createClient()
      const { data } = await supabase
        .from('profiles')
        .select('id, name, email')
        .in('id', agentIds)

      if (data) {
        const details: Record<string, Agent> = {}
        data.forEach(agent => {
          // Strip quotes if they exist
          const id = agent.id.replace(/^"|"$/g, '')
          details[id] = agent
        })
        setAgentDetails(details)
      }
    }

    fetchAgentDetails()
  }, [fieldValues])

  const hasChanges = !isEqual(fieldValues, originalValues) || !arrayEquals(tagValues, tags)

  const handleFieldChange = (fieldName: string, value: string) => {
    setFieldValues(prev => 
      prev.map(field => 
        field.name === fieldName ? { ...field, value } : field
      )
    )
  }

  const handleCancel = () => {
    setFieldValues(originalValues)
    setTagValues(tags)
    setIsEditing(false)
  }

  const handleSubmit = async () => {
    try {
      const supabase = createClient()
      
      const params: any = {
        ticket_id: ticketId,
        field_updates: fieldValues.map(field => ({
          id: field.id,
          value: field.value
        })),
        updater_id: (await supabase.auth.getUser()).data.user?.id,
        internal: true
      }

      // Only include tags if they've changed
      if (!arrayEquals(tagValues, tags)) {
        params.new_tags = tagValues.map(t => t.trim()).filter(Boolean)
      }
      
      const { error } = await supabase.rpc('update_ticket', params)

      if (error) throw error

      setOriginalValues(fieldValues)
      setIsEditing(false)
      
      toast({
        title: "Success",
        description: "Ticket fields have been updated",
      })

      router.refresh()
      
    } catch (error: any) {
      console.error('Error updating ticket:', error)
      toast({
        title: "Failed to update ticket fields",
        description: error?.message || "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  const renderFieldInput = (field: TicketField) => {
    switch (field.type) {
      case 'number':
        return (
          <Input
            type="number"
            value={field.value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            className="text-sm"
          />
        )
      case 'select':
        return (
          <Select
            value={field.value}
            onValueChange={(value) => handleFieldChange(field.name, value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              {field.choices?.map((choice) => (
                <SelectItem key={choice} value={choice}>
                  {choice}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      case 'agent':
        return (
          <AgentSelect
            value={field.value}
            onChange={(value) => handleFieldChange(field.name, value)}
          />
        )
      case 'text':
      default:
        return (
          <Input
            type="text"
            value={field.value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            className="text-sm"
          />
        )
    }
  }

  return (
    <Card className="group">
      <CardContent className="pt-6">
        <div className="space-y-4">
          {fieldValues.map((field, index) => (
            <div key={field.id}>
              <div className="mb-1">
                <div className="flex items-center justify-between gap-1.5">
                  <div className="text-sm font-medium text-muted-foreground">
                    {field.name}
                  </div>
                  {index === 0 && !isEditing && (
                    <Button
                      variant="link"
                      className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => setIsEditing(true)}
                    >
                      Edit
                    </Button>
                  )}
                </div>
              </div>
              <div>
                {isEditing ? (
                  renderFieldInput(field)
                ) : (
                  field.type === 'agent' ? (
                    <div className="text-sm">
                      {field.value ? (
                        agentDetails[field.value] ? (
                          <span>
                            {agentDetails[field.value].name} ({agentDetails[field.value].email})
                          </span>
                        ) : (
                          'Loading...'
                        )
                      ) : (
                        <span className="text-muted-foreground">Not assigned</span>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm">
                      {field.value || 'Not set'}
                    </div>
                  )
                )}
              </div>
            </div>
          ))}
          
          <div>
            <div className="mb-1">
              <div className="flex items-center justify-between gap-1.5">
                <div className="text-sm font-medium text-muted-foreground">
                  Tags
                </div>
              </div>
            </div>
            <div>
              {isEditing ? (
                <Input
                  value={tagValues.join(',')}
                  onChange={(e) => {
                    setTagValues(e.target.value ? e.target.value.split(',') : [])
                  }}
                  placeholder="Tags separated by commas, e.g. tag1,tag2,tag3"
                  className="text-sm"
                />
              ) : tagValues.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {tagValues.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  No tags
                </div>
              )}
            </div>
          </div>

          {isEditing && (
            <div className="flex gap-4">
              <Button onClick={handleSubmit} disabled={!hasChanges}>
                Submit
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Helper function to compare arrays
function arrayEquals(a: string[], b: string[]) {
  return a.length === b.length && a.every((val, index) => val === b[index]);
}

// Add lodash isEqual for deep comparison of arrays
function isEqual(arr1: TicketField[], arr2: TicketField[]): boolean {
  if (arr1.length !== arr2.length) return false
  return arr1.every((field, index) => 
    field.name === arr2[index].name && field.value === arr2[index].value
  )
} 