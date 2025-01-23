import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, Clock, User, HelpCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { TicketFields } from '@/components/agent/tickets/view/ticket-fields'
import { TicketHistory } from '@/components/agent/tickets/view/ticket-history'

export const dynamic = 'force-dynamic'

export default async function TicketPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()
  const ticketId = (await params).id

  const { data: ticket, error } = await supabase
    .from('tickets')
    .select(`
      *,
      creator:profiles!created_by(name, email),
      ticket_templates(
        id,
        name,
        template_fields(
          id,
          name,
          type,
          choices
        )
      ),
      ticket_updates(
        id,
        comment,
        updates,
        internal,
        created_at,
        created_by(name, email)
      )
    `)
    .eq('id', ticketId)
    .single()

  if (error) {
    console.error('Error fetching ticket:', error)
  }

  if (!ticket) {
    notFound()
  }

  // Merge template field choices with ticket fields
  const fieldsWithChoices = ticket.fields.map((field: any) => {
    const templateField = ticket.ticket_templates.template_fields.find(
      (tf: any) => tf.id === field.id
    )
    return {
      ...field,
      choices: templateField?.choices
    }
  })

  return (
    <div className="container mx-auto py-10 pt-8">
      <div className="mb-8">
        <div className="flex items-center gap-2">
          <Link href="/agent/tickets">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">View Ticket</h1>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="col-span-2">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-bold">{ticket.title}</CardTitle>
                <CardDescription>
                  Reported by {ticket.creator?.name} ({ticket.creator?.email}) on {new Date(ticket.created_at).toLocaleString()}
                </CardDescription>
              </CardHeader>
              <CardContent>              
                {ticket.description && (
                  <div className="text-foreground whitespace-pre-wrap">
                    {ticket.description}
                  </div>
                )}
              </CardContent>
            </Card>
            <TicketHistory 
              ticketId={ticket.id}
              updates={ticket.ticket_updates}
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <TicketFields 
            ticketId={ticket.id}
            fields={fieldsWithChoices}
            tags={ticket.tags || []}
          />
        </div>
      </div>
    </div>
  )
}
