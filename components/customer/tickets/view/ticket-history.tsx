'use client'

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Editor } from '@/components/rich-text/editor'
import { Button } from "@/components/ui/button"
import { createClient } from "@/utils/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import DOMPurify from 'isomorphic-dompurify'
import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns'

interface TicketUpdate {
  id: string
  comment: string | null
  updates: {
    id?: string
    field: string
    old_value: string
    new_value: string
  }[] | null
  created_at: string
  created_by: {
    name: string
    email: string
  }
}

interface CustomerTicketHistoryProps {
  ticketId: string
  updates: TicketUpdate[]
}

function isEditorEmpty(content: string) {
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

export function CustomerTicketHistory({ ticketId, updates }: CustomerTicketHistoryProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!comment.trim()) return

    setIsSubmitting(true)
    try {
      const supabase = createClient()
      
      const { error } = await supabase.rpc('update_ticket', {
        ticket_id: ticketId,
        field_updates: [],
        updater_id: (await supabase.auth.getUser()).data.user?.id,
        comment: comment,
        internal: false
      })

      if (error) throw error

      toast({
        title: "Success",
        description: "Comment added successfully",
      })
      
      setComment("")
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
            {update.updates.map((change, index) => (
              <div key={index} className="text-muted-foreground">
                Changed <Badge variant="outline">{change.field}</Badge> from{' '}
                <span className="text-primary">
                  {change.old_value || 'Not set'}
                </span> to{' '}
                <span className="text-primary">
                  {change.new_value}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle>Comments</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <Editor
            value={comment}
            onChange={setComment}
            placeholder="Add a comment..."
            className="min-h-[100px]"
          />
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting || isEditorEmpty(comment)}
          >
            {isSubmitting && (
              <Loader2 className="h-4 w-4 animate-spin" /> 
            )}
            Submit
          </Button>
          {updates.length > 0 && <Separator />}
        </div>
        {updates.length > 0 && (
          <div className="space-y-4">
            {updates
              .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
              .map(update => (
                <div key={update.id} className="space-y-1">
                  <div className="text-sm text-muted-foreground">
                    {update.created_by.name} {formatDate(new Date(update.created_at))}
                  </div>
                  <div className="whitespace-pre-wrap text-sm">
                    {formatUpdate(update)}
                  </div>
                </div>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
} 