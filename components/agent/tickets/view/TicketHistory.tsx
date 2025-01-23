'use client'

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { createClient } from "@/utils/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { Editor } from '@/components/rich-text/editor'
import { Loader2 } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import DOMPurify from 'isomorphic-dompurify'
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

interface TicketUpdate {
  id: string
  comment: string | null
  updates: {
    field: string
    old_value: string
    new_value: string
  }[] | null
  internal: boolean
  created_at: string
  created_by: {
    name: string
    email: string
  }
}

interface Agent {
  id: string
  name: string
  email: string
}

interface TicketHistoryProps {
  ticketId: string
  updates: TicketUpdate[]
  templateFields: Array<{
    id: string
    name: string
    type: string
  }>
}

function isEditorEmpty(content: string) {
  // Remove HTML tags and whitespace
  const strippedContent = content.replace(/<[^>]*>/g, '').trim()
  return !strippedContent
}

export function TicketHistory({ ticketId, updates, templateFields }: TicketHistoryProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [publicComment, setPublicComment] = useState("")
  const [internalComment, setInternalComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [agentDetails, setAgentDetails] = useState<Record<string, Agent>>({})
  const [hideFieldUpdates, setHideFieldUpdates] = useState(false)

  // Fetch agent details for all agent IDs in updates
  useEffect(() => {
    const fetchAgentDetails = async () => {
      const agentIds = new Set<string>()
      
      updates.forEach(update => {
        if (update.updates) {
          update.updates.forEach(change => {
            const field = templateFields.find(f => f.id === change.field)
            if (field?.type === 'agent') {
              if (change.old_value && change.old_value !== '""') agentIds.add(change.old_value)
              if (change.new_value && change.new_value !== '""') agentIds.add(change.new_value)
            }
          })
        }
      })
      if (agentIds.size === 0) return

      const supabase = createClient()
      const { data } = await supabase
        .from('profiles')
        .select('id, name, email')
        .in('id', Array.from(agentIds))

      if (data) {
        const details: Record<string, Agent> = {}
        data.forEach(agent => {
          details[`"${agent.id}"`] = agent
        })
        setAgentDetails(details)
      }
    }

    fetchAgentDetails()
  }, [updates, templateFields])

  const handleSubmit = async (comment: string, isInternal: boolean) => {
    if (!comment.trim()) return

    setIsSubmitting(true)
    try {
      const supabase = createClient()
      
      const { error } = await supabase.rpc('update_ticket', {
        ticket_id: ticketId,
        field_updates: {},
        updater_id: (await supabase.auth.getUser()).data.user?.id,
        comment: comment,
        internal: isInternal
      })

      if (error) throw error

      toast({
        title: "Success",
        description: "Comment added successfully",
      })
      
      // Clear only the submitted comment
      if (isInternal) {
        setInternalComment("")
      } else {
        setPublicComment("")
      }
      setIsSubmitting(false)
      router.refresh()
    } catch (error: any) {
      console.error('Error adding comment:', error)
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      })
      setIsSubmitting(false)
    }
  }

  const formatUpdate = (update: TicketUpdate) => {
    return (
      <div className="space-y-1">
        {update.comment && (
          <div 
            className="!text-base prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(update.comment)
            }}
          />
        )}
        {update.updates && (
          <div className="space-y-1">
            {update.updates.map((change, index) => {
              const field = templateFields.find(f => f.id === change.field)
              const fieldName = field?.name || change.field

              if (field?.type === 'agent') {
                const oldAgent = change.old_value ? agentDetails[change.old_value] : null
                const newAgent = change.new_value ? agentDetails[change.new_value] : null
                
                const oldValue = oldAgent ? `${oldAgent.name} (${oldAgent.email})` : 'Not assigned'
                const newValue = newAgent ? `${newAgent.name} (${newAgent.email})` : 'Not assigned'

                return (
                  <div key={index} className="text-muted-foreground">
                    Changed <Badge variant="outline">{fieldName}</Badge> from{' '}
                    <span className="text-primary">{oldValue}</span> to <span className="text-primary">{newValue}</span>
                  </div>
                )
              }

              const oldValue = change.old_value || 'Not set'
              const newValue = change.new_value

              return (
                <div key={index} className="text-muted-foreground">
                  Changed <Badge variant="outline">{fieldName}</Badge> from{' '}
                  <span className="text-primary">{oldValue}</span> to <span className="text-primary">{newValue}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <Tabs defaultValue="public">
          <TabsList>
            <TabsTrigger value="public">Public</TabsTrigger>
            <TabsTrigger value="internal">Internal</TabsTrigger>
          </TabsList>
          <TabsContent value="public" className="space-y-4">
            <div className="space-y-4 pt-4">
              <div className="space-y-4">
                <Editor
                  value={publicComment}
                  onChange={setPublicComment}
                  placeholder="Add a public update..."
                  className="min-h-[100px]"
                />
                <Button 
                  onClick={() => handleSubmit(publicComment, false)}
                  disabled={isSubmitting || isEditorEmpty(publicComment)}
                >
                  {isSubmitting && (
                    <Loader2 className="h-4 w-4 animate-spin" /> 
                  )}
                  Submit
                </Button>
                {updates.some(update => !update.internal) && <Separator />}
              </div>
              <div className="space-y-4">
                {updates
                  .filter(update => !update.internal)
                  .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                  .map(update => (
                    <div key={update.id} className="space-y-1">
                      <div className="text-sm text-muted-foreground">
                        {update.created_by.name} ({update.created_by.email}) on {new Date(update.created_at).toLocaleString()}
                      </div>
                      <div className="whitespace-pre-wrap text-sm">
                        {formatUpdate(update)}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </TabsContent>
          <TabsContent value="internal" className="space-y-4">
            <div className="space-y-4 pt-4">
              <div className="space-y-4">
                <Editor
                  value={internalComment}
                  onChange={setInternalComment}
                  placeholder="Add an internal note..."
                  className="min-h-[100px]"
                />
                <div className="flex items-center justify-between">
                  <Button 
                    onClick={() => handleSubmit(internalComment, true)}
                    disabled={isSubmitting || isEditorEmpty(internalComment)}
                  >
                    {isSubmitting && (
                      <Loader2 className="h-4 w-4 animate-spin" /> 
                    )}
                    Submit
                  </Button>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="hide-field-updates"
                      checked={hideFieldUpdates}
                      onCheckedChange={setHideFieldUpdates}
                    />
                    <Label htmlFor="hide-field-updates" className="text-muted-foreground">Hide field updates</Label>
                  </div>
                </div>
                {updates.some(update => update.internal) && <Separator />}
              </div>
              <div className="space-y-4">
                {updates
                  .filter(update => update.internal)
                  .filter(update => !hideFieldUpdates || update.comment)
                  .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                  .map(update => (
                    <div key={update.id} className="space-y-1">
                      <div className="text-sm text-muted-foreground">
                        {update.created_by.name} ({update.created_by.email}) on {new Date(update.created_at).toLocaleString()}
                      </div>
                      <div className="whitespace-pre-wrap text-sm">
                        {formatUpdate(update)}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardHeader>
    </Card>
  )
} 