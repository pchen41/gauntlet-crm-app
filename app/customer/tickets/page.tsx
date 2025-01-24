import { Suspense } from 'react'
import { createClient } from '@/utils/supabase/server'
import { DataTable } from '@/components/customer/tickets/data-table'
import { columns, FormattedTicket } from '@/components/customer/tickets/columns'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

interface Ticket {
  id: string
  title: string
  created_at: string
  updated_at: string
  fields: {
    id: string
    name: string
    value: string
    type: string
  }[]
  ticket_templates: {
    name: string | null
  }[]
}

export default async function CustomerTicketsPage() {
  const supabase = await createClient()

  const { data: { user: sessionUser } } = await supabase.auth.getUser()
  if (!sessionUser) {
    redirect('/login')
  }

  const { data: tickets, error } = await supabase
    .from('tickets')
    .select(`
      id,
      title,
      created_at,
      updated_at,
      fields,
      ticket_templates (name)
    `)
    .eq('created_by', sessionUser.id)
    .order('created_at', { ascending: false })

  const formattedTickets: FormattedTicket[] = (tickets || []).map((ticket: Ticket) => {
    // Helper function to find field value by name
    const getFieldValue = (fieldName: string) => {
      if (!Array.isArray(ticket.fields)) return 'Unknown'
      const field = ticket.fields.find((f: any) => f.name === fieldName)
      return field?.value || 'Unknown'
    }

    return {
      id: ticket.id,
      title: ticket.title,
      status: getFieldValue('Status'),
      // @ts-expect-error
      template: ticket.ticket_templates?.name || 'Unknown',
      createdAt: ticket.created_at,
      updatedAt: ticket.updated_at,
      href: `/customer/tickets/${ticket.id}`,
    }
  })

  return (
    <div className="container mx-auto py-10 pt-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">My Tickets</h1>
        <Link href="/customer/tickets/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Ticket
          </Button>
        </Link>
      </div>

      <Suspense fallback={<div>Loading tickets...</div>}>
        <DataTable 
          columns={columns} 
          data={formattedTickets || []} 
        />
      </Suspense>
    </div>
  )
}
