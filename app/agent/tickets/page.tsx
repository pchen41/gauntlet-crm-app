import { Suspense } from 'react'
import { createClient } from '@/utils/supabase/server'
import { DataTable } from '../../../components/agent/tickets/data-table'
import { columns } from '../../../components/agent/tickets/columns'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

interface Profile {
  name: string | null
}

interface TicketTemplate {
  name: string | null
}

interface Ticket {
  id: string
  title: string
  created_at: string
  fields?: {
    status?: string
    priority?: string
  }
  profiles?: {
    tickets_assigned_to?: Profile
    tickets_created_by?: Profile
  }
  ticket_templates?: TicketTemplate
}

export default async function TicketsPage() {
  const supabase = await createClient()

  const { data: tickets } = await supabase
    .from('tickets')
    .select(`
      id,
      title,
      created_at,
      assigned_to,
      created_by,
      fields,
      profiles(name),
      ticket_templates(name)
    `)
    .order('created_at', { ascending: false })

  const formattedTickets = (tickets || []).map((ticket: any) => ({
    id: ticket.id,
    title: ticket.title,
    assignedTo: ticket.assigned_to || 'Unassigned',
    status: ticket.fields?.status || 'New',
    priority: ticket.fields?.priority || 'Normal',
    template: ticket.ticket_templates?.name,
    createdBy: ticket.created_by,
    createdAt: new Date(ticket.created_at).toLocaleString(),
    href: `/agent/tickets/${ticket.id}`,
  }))

  return (
    <div className="container mx-auto py-10 pt-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Tickets</h1>
        <Link href="/agent/tickets/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Ticket
          </Button>
        </Link>
      </div>

      <Suspense fallback={<div>Loading tickets...</div>}>
        <DataTable columns={columns} data={formattedTickets || []} />
      </Suspense>
    </div>
  )
}
