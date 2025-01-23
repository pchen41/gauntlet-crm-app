import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { CreateTicketForm } from '@/components/agent/tickets/create-ticket-form'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface TemplateField {
  rank: number
}

export default async function NewTicketPage() {
  const supabase = await createClient()

  const { data: templates } = await supabase
    .from('ticket_templates')
    .select(`
      *,
      template_fields (
        id,
        name,
        type,
        required,
        choices,
        default_value,
        visible_to_customer,
        rank
      )
    `)
    .is('deleted_at', null)
    .order('name')

  // Sort template fields by rank
  templates?.forEach(template => {
    template.template_fields.sort((a: TemplateField, b: TemplateField) => a.rank - b.rank)
  })

  const { data: agents } = await supabase
    .from('profiles')
    .select(`
      id,
      name,
      roles!inner(role)
    `)
    .eq('roles.role', 'agent')
    .order('name')

  async function createTicket(formData: FormData) {
    'use server'
    
    const supabase = await createClient()
    const templateId = formData.get('template_id') as string
    const title = formData.get('title') as string
    const description = formData.get('description') as string

    const { data: template } = await supabase
      .from('ticket_templates')
      .select('template_fields(id, name, type, rank)')
      .eq('id', templateId)
      .single()

    // Convert form data to array of fields with id, name, value, and type
    const fields = template?.template_fields
      ?.sort((a, b) => a.rank - b.rank)
      .map((field) => {
        const value = formData.get(`field_${field.id}`)
        return {
          id: field.id,
          name: field.name,
          value: value ? String(value) : '',
          type: field.type
        }
      }) || []

    const { error } = await supabase
      .from('tickets')
      .insert({
        title,
        description,
        ticket_template_id: templateId,
        fields,
      })

    if (error) {
      throw new Error('Failed to create ticket')
    }

    redirect('/agent/tickets')
  }

  return (
    <div className="container mx-auto py-10 pt-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-6">
          <Link href="/agent/tickets">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Create Ticket</h1>
        </div>
      </div>
      <div className="border rounded-lg p-6 bg-card">
        <CreateTicketForm
          templates={templates || []}
          agents={agents || []}
          createTicket={createTicket}
        />
      </div>
    </div>
  )
}
