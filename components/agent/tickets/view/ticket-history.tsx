'use client'

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns'
import { Sparkles } from "lucide-react"
import { AIChatModal } from "./ai-chat-modal"

interface TicketUpdate {
  id: string
  comment: string | null
  updates: {
    id?: string
    field: string
    type?: string    // Add type field
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
}

function isEditorEmpty(content: string) {
  // Remove HTML tags and whitespace
  const strippedContent = content.replace(/<[^>]*>/g, '').trim()
  return !strippedContent
}

const formatDate = (date: Date) => {
  if (isToday(date)) {
    return `today at ${format(date, 'h:mm a')}`
  }
  if (isYesterday(date)) {
    return `yesterday at ${format(date, 'h:mm a')}`
  }
  if (new Date().getFullYear() === date.getFullYear()) {
    return format(date, 'MMM d \'at\' h:mm a')
  }
  return format(date, 'MMM d, yyyy \'at\' h:mm a')
}

export function TicketHistory({ ticketId, updates }: TicketHistoryProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [publicComment, setPublicComment] = useState("")
  const [internalComment, setInternalComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [agentDetails, setAgentDetails] = useState<Record<string, Agent>>({})
  const [hideFieldUpdates, setHideFieldUpdates] = useState(false)
  const [aiChatOpen, setAiChatOpen] = useState(false)

  // Fetch agent details for all agent IDs in updates
  useEffect(() => {
    const fetchAgentDetails = async () => {
      const agentIds = new Set<string>()
      
      updates.forEach(update => {
        if (update.updates) {
          update.updates.forEach(change => {
            if (change.type === 'agent') {
              if (change.old_value && change.old_value !== '""') {
                agentIds.add(change.old_value.replace(/^"|"$/g, ''))
              }
              if (change.new_value && change.new_value !== '""') {
                agentIds.add(change.new_value.replace(/^"|"$/g, ''))
              }
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
          const id = agent.id.replace(/^"|"$/g, '')
          details[id] = agent
        })
        setAgentDetails(details)
      }
    }

    fetchAgentDetails()
  }, [updates])

  const handleSubmit = async (comment: string, isInternal: boolean) => {
    if (!comment.trim()) return

    setIsSubmitting(true)
    try {
      const supabase = createClient()
      
      const { error } = await supabase.rpc('update_ticket', {
        ticket_id: ticketId,
        field_updates: [],
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

  const formatValue = (value: string, isAgentField: boolean) => {
    if (!isAgentField) return value || 'Not set'
    
    if (!value || value === '""') return 'Not assigned'
    
    const agentId = value.replace(/^"|"$/g, '')
    const agent = agentDetails[agentId]
    return agent ? `${agent.name} (${agent.email})` : value
  }

  const formatUpdate = (update: TicketUpdate) => {
    return (
      <div className="space-y-4">
        {update.comment && (
          <div className="bg-muted rounded-lg p-4">
            <div 
              className="!text-base prose prose-sm max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(update.comment)
              }}
            />
          </div>
        )}
        {update.updates && (
          <div className="space-y-1 text-sm">
            {update.updates.map((change, index) => {
              const isAgentField = change.type === 'agent'

              return (
                <div key={index} className="text-muted-foreground">
                  Changed <Badge variant="outline">{change.field}</Badge> from{' '}
                  <span className="text-primary">
                    {formatValue(change.old_value, isAgentField)}
                  </span> to{' '}
                  <span className="text-primary">
                    {formatValue(change.new_value, isAgentField)}
                  </span>
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
      <CardHeader className="relative">
        <CardTitle>Ticket History</CardTitle>
        <div className="absolute right-4 top-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setAiChatOpen(true)}
          >
            <Sparkles className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
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
                        {update.created_by.name} ({update.created_by.email}) {formatDate(new Date(update.created_at))}
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
              <div className="space-y-2">
                {updates
                  .filter(update => update.internal)
                  .filter(update => !hideFieldUpdates || update.comment)
                  .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                  .map(update => (
                    <div key={update.id} className="space-y-1 pb-2">
                      <div className="text-sm text-muted-foreground">
                        {update.created_by.name} ({update.created_by.email}) {formatDate(new Date(update.created_at))}
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
      </CardContent>

      <AIChatModal 
        open={aiChatOpen} 
        onOpenChange={setAiChatOpen}
        ticketId={ticketId}
      />
    </Card>
  )
} 