import { Suspense } from 'react'
import { createClient } from '@/utils/supabase/server'
import { DataTable } from '../../../components/agent/tickets/data-table'
import { columns } from '../../../components/agent/tickets/columns'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

interface Ticket {
  id: string
  title: string
  created_at: string
  created_by: string | null
  fields: {
    status?: string
    priority?: string
  }
  assigned_to: {
    name: string | null
    email: string | null
  }[]
  creator: {
    name: string | null
    email: string | null
  }[]
  ticket_templates: {
    name: string | null
  }[]
}

export default async function TicketsPage() {
  const supabase = await createClient()

  const { data: tickets, error } = await supabase
    .from('tickets')
    .select(`
      id,
      title,
      created_at,
      created_by,
      fields,
      assigned_to:profiles!tickets_assigned_to_fkey (name, email),
      creator:profiles!tickets_created_by_fkey (name, email),
      ticket_templates (name)
    `)
    .order('created_at', { ascending: false })

  const formattedTickets = (tickets || []).map((ticket: Ticket) => ({
    id: ticket.id,
    title: ticket.title,
    // @ts-expect-error
    assignedTo: ticket.assigned_to?.name || 'Unassigned',
    status: ticket.fields?.status || 'New',
    priority: ticket.fields?.priority || 'Normal',
    // @ts-expect-error
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
