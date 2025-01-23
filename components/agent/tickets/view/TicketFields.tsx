'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AgentSelect } from './AgentSelect'
import { createClient } from "@/utils/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface TemplateField {
  id: string
  name: string
  type: string
  description?: string
  choices?: string[]
}

interface Agent {
  id: string
  name: string
  email: string
}

interface TicketFieldsProps {
  ticketId: string
  templateFields: TemplateField[]
  fields: Record<string, string>
  tags: string[]
}

export function TicketFields({ ticketId, templateFields, fields, tags }: TicketFieldsProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [fieldValues, setFieldValues] = useState(fields)
  const [originalValues, setOriginalValues] = useState(fields)
  const [agentDetails, setAgentDetails] = useState<Record<string, Agent>>({})
  const [tagValues, setTagValues] = useState<string[]>(tags)

  // Fetch agent details for all agent-type fields
  useEffect(() => {
    const fetchAgentDetails = async () => {
      const agentFields = templateFields
        .filter(field => field.type === 'agent' && fieldValues[field.id])
        .map(field => fieldValues[field.id])
      
      if (agentFields.length === 0) return

      const supabase = createClient()
      const { data } = await supabase
        .from('profiles')
        .select('id, name, email')
        .in('id', agentFields)

      if (data) {
        const details: Record<string, Agent> = {}
        data.forEach(agent => {
          details[agent.id] = agent
        })
        setAgentDetails(details)
      }
    }

    fetchAgentDetails()
  }, [templateFields, fieldValues])

  const hasChanges = Object.entries(fieldValues).some(
    ([key, value]) => value !== originalValues[key]
  ) || !arrayEquals(tagValues, tags)

  const handleFieldChange = (fieldId: string, value: string) => {
    setFieldValues(prev => ({ ...prev, [fieldId]: value }))
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
        field_updates: fieldValues,
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

  return (
    <Card className="group">
      <CardContent className="pt-6">
        <div className="space-y-4">
          {templateFields.map((field, index) => (
            <div key={field.id}>
              <div className="mb-1">
                <div className="flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1.5">
                    {field.description ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger className="text-left">
                            <div className="text-sm font-medium text-muted-foreground">
                              {field.name}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">{field.description}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <div className="text-sm font-medium text-muted-foreground">
                        {field.name}
                      </div>
                    )}
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
                  field.type === 'select' && field.choices ? (
                    <Select
                      value={fieldValues[field.id] || ''}
                      onValueChange={(value) => handleFieldChange(field.id, value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent>
                        {field.choices.map((choice) => (
                          <SelectItem key={choice} value={choice}>
                            {choice}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : field.type === 'agent' ? (
                    <AgentSelect
                      value={fieldValues[field.id] || ''}
                      onChange={(value) => handleFieldChange(field.id, value)}
                    />
                  ) : (
                    <Input
                      value={fieldValues[field.id] || ''}
                      onChange={(e) => handleFieldChange(field.id, e.target.value)}
                      className="text-sm"
                    />
                  )
                ) : (
                  field.type === 'agent' ? (
                    <div className="text-sm">
                      {fieldValues[field.id] ? (
                        agentDetails[fieldValues[field.id]] ? (
                          <span>
                            {agentDetails[fieldValues[field.id]].name} ({agentDetails[fieldValues[field.id]].email})
                          </span>
                        ) : (
                          'Loading...'
                        )
                      ) : (
                        <span className="text-muted-foreground">Not assigned</span>
                      )}
                    </div>
                  ) : field.type === 'select' && field.choices ? (
                    <Badge variant="outline">
                      {fieldValues[field.id] || 'Not set'}
                    </Badge>
                  ) : (
                    <div className="text-sm">
                      {fieldValues[field.id] || 'Not set'}
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