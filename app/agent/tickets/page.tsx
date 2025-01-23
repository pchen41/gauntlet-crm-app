import { Suspense } from 'react'
import { createClient } from '@/utils/supabase/server'
import { DataTable } from '../../../components/agent/tickets/data-table'
import { columns, FormattedTicket } from '../../../components/agent/tickets/columns'
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
  tags: string[]
  fields: {
    id: string
    name: string
    value: string
    type: string
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

  // Add this to get the current user
  const { data: { user: sessionUser } } = await supabase.auth.getUser()
  const { data: currentUser } = await supabase
    .from('profiles')
    .select('id, name, email')
    .eq('id', sessionUser?.id)
    .single()

  if (!currentUser) {
    redirect('/agent/login')
  }

  const { data: tickets, error } = await supabase
    .from('tickets')
    .select(`
      id,
      title,
      created_at,
      updated_at,
      tags,
      fields,
      creator:profiles!tickets_created_by_fkey (name, email),
      ticket_templates (name)
    `)
    .order('created_at', { ascending: false })

  // Get unique assigned agent IDs
  const assignedAgentIds = [...new Set((tickets || [])
    .map((ticket: Ticket) => {
      const field = ticket.fields?.find((f: any) => f.name === 'Assigned To')
      return field?.value
    })
    .filter(id => id && id !== 'Unknown'))]

  // Fetch only the needed profiles
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, name, email')
    .in('id', assignedAgentIds)

  const formattedTickets: FormattedTicket[] = (tickets || []).map((ticket: Ticket) => {
    // Helper function to find field value by name
    const getFieldValue = (fieldName: string) => {
      if (!Array.isArray(ticket.fields)) return 'Unknown'
      const field = ticket.fields.find((f: any) => f.name === fieldName)
      return field?.value || 'Unknown'
    }

    const assignedToId = getFieldValue('Assigned To')
    const assignedToProfile = assignedToId !== 'Unknown' 
      ? (profiles || []).find(p => p.id === assignedToId)
      : null

    return {
      id: ticket.id,
      title: ticket.title,
      assignedTo: assignedToProfile?.name || 'Unassigned',
      assignedToEmail: assignedToProfile?.email || null,
      status: getFieldValue('Status'),
      priority: getFieldValue('Priority'),
      // @ts-expect-error
      template: ticket.ticket_templates?.name,
      // @ts-expect-error
      createdBy: ticket.creator?.name,
      // @ts-expect-error
      creatorEmail: ticket.creator?.email,
      createdAt: ticket.created_at,
      updatedAt: ticket.updated_at,
      tags: ticket.tags || [],
      href: `/agent/tickets/${ticket.id}`,
    }
  })

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
        <DataTable 
          columns={columns} 
          data={formattedTickets || []} 
          currentUser={{
            id: currentUser.id,
            name: currentUser.name,
            email: currentUser.email
          }}
        />
      </Suspense>
    </div>
  )
}
