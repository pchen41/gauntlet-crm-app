import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CustomerTicketFields } from '@/components/customer/tickets/view/ticket-fields'
import { CustomerTicketHistory } from '@/components/customer/tickets/view/ticket-history'

export const dynamic = 'force-dynamic'

export default async function CustomerTicketPage({
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
          choices,
          visible_to_customer
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

  // Filter out non-visible fields and merge template field choices
  const visibleFields = ticket.fields.filter((field: any) => {
    const templateField = ticket.ticket_templates.template_fields.find(
      (tf: any) => tf.id === field.id
    )
    return templateField?.visible_to_customer
  }).map((field: any) => {
    const templateField = ticket.ticket_templates.template_fields.find(
      (tf: any) => tf.id === field.id
    )
    return {
      ...field,
      choices: templateField?.choices
    }
  })

  // Filter out internal updates
  const publicUpdates = ticket.ticket_updates.filter(
    (update: any) => !update.internal
  )

  return (
    <div className="container mx-auto py-10 pt-8">
      <div className="mb-8">
        <div className="flex items-center gap-2">
          <Link href="/customer/tickets">
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
                  Reported on {new Date(ticket.created_at).toLocaleString()}
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
            <CustomerTicketHistory 
              ticketId={ticket.id}
              updates={publicUpdates}
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <CustomerTicketFields 
            fields={visibleFields}
            tags={ticket.tags || []}
          />
        </div>
      </div>
    </div>
  )
}
