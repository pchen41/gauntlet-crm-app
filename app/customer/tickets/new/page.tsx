import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { CreateTicketForm } from '@/components/customer/tickets/create-ticket-form'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface TemplateField {
  rank: number
}

export default async function NewCustomerTicketPage() {
  const supabase = await createClient()

  const { data: { user: sessionUser } } = await supabase.auth.getUser()
  if (!sessionUser) {
    redirect('/login')
  }

  const { data: templates } = await supabase
    .from('ticket_templates')
    .select(`
      id,
      name,
      template_fields (
        id,
        name,
        type,
        required,
        choices,
        default_value,
        visible_to_customer,
        editable_by_customer,
        rank
      )
    `)
    .is('deleted_at', null)
    .order('name')

  // Sort template fields by rank and filter for customer editable fields
  templates?.forEach(template => {
    template.template_fields = template.template_fields
      .filter(field => field.visible_to_customer && field.editable_by_customer)
      .sort((a: TemplateField, b: TemplateField) => a.rank - b.rank)
  })

  async function createTicket(formData: FormData) {
    'use server'
    
    const supabase = await createClient()
    const { data: { user: sessionUser } } = await supabase.auth.getUser()
    
    if (!sessionUser) {
      throw new Error('Not authenticated')
    }

    const templateId = formData.get('template_id') as string
    const title = formData.get('title') as string
    const description = formData.get('description') as string

    const { data: template } = await supabase
      .from('ticket_templates')
      .select('template_fields(id, name, type, rank, visible_to_customer, editable_by_customer, default_value)')
      .eq('id', templateId)
      .single()

    if (!template?.template_fields) {
      throw new Error('Template not found')
    }

    // Get all fields from template
    const fields = template.template_fields
      .sort((a, b) => a.rank - b.rank)
      .map((field) => {
        // If field is editable by customer, get value from form
        if (field.visible_to_customer && field.editable_by_customer) {
          const value = formData.get(`field_${field.id}`)
          return {
            id: field.id,
            name: field.name,
            value: value ? String(value) : field.default_value || '',
            type: field.type
          }
        }
        // Otherwise use default value
        return {
          id: field.id,
          name: field.name,
          value: field.default_value || '',
          type: field.type
        }
      })

    const { error } = await supabase
      .from('tickets')
      .insert({
        title,
        description,
        ticket_template_id: templateId,
        fields,
        created_by: sessionUser.id
      })

    if (error) {
      console.log(error)
      throw new Error('Failed to create ticket')
    }

    redirect('/customer/tickets')
  }

  return (
    <div className="container mx-auto py-10 pt-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-6">
          <Link href="/customer/tickets">
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
          createTicket={createTicket}
        />
      </div>
    </div>
  )
}
