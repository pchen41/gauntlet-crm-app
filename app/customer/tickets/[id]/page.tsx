import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import { TicketRealtime } from '@/components/customer/tickets/view/ticket-realtime'
import { CustomerTicketContent } from '@/components/customer/tickets/view/ticket-content'

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

  return (
    <TicketRealtime ticketId={ticket.id} initialTicket={ticket}>
      <CustomerTicketContent />
    </TicketRealtime>
  )
}
