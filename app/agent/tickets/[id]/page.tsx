import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent } from '@/components/ui/card'

export const dynamic = 'force-dynamic'

interface TemplateField {
  id: string
  name: string
  type: string
  description?: string
  choices?: string[]
}

export default async function TicketPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()

  const { data: ticket } = await supabase
    .from('tickets')
    .select(`
      *,
      profiles(name),
      ticket_templates!inner(
        id,
        name,
        template_fields(
          id,
          name,
          type,
          description,
          choices,
          rank
        )
      )
    `)
    .eq('id', params.id)
    .single()

  if (!ticket) {
    notFound()
  }

  const templateFields = ticket.ticket_templates.template_fields.sort(
    (a: any, b: any) => a.rank - b.rank
  )

  return (
    <div className="container mx-auto py-10 pt-8">
      <div className="mb-8">
        <div className="flex items-center gap-2">
          <Link href="/agent/tickets">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">{ticket.title}</h1>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Clock className="h-4 w-4" />
            <span>Created {new Date(ticket.created_at).toLocaleString()}</span>
          </div>

          {ticket.description && (
            <>
              <div className="mb-6">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Description</h3>
                <div className="text-sm whitespace-pre-wrap">{ticket.description}</div>
              </div>
              <Separator className="my-6" />
            </>
          )}

          <div className="grid gap-y-6">
            {templateFields.map((field: TemplateField) => (
              <div key={field.id}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm font-medium mb-1.5">{field.name}</div>
                    {field.description && (
                      <div className="text-xs text-muted-foreground">
                        {field.description}
                      </div>
                    )}
                  </div>
                  <div className="mt-0.5">
                    {field.type === 'select' && field.choices ? (
                      <Badge variant={
                        field.name.toLowerCase() === 'status' ? (
                          ticket.fields?.[field.id] === "Closed" ? "secondary" :
                          ticket.fields?.[field.id] === "In Progress" ? "default" :
                          "outline"
                        ) : field.name.toLowerCase() === 'priority' ? (
                          ticket.fields?.[field.id] === "High" ? "destructive" :
                          ticket.fields?.[field.id] === "Medium" ? "default" :
                          "outline"
                        ) : "outline"
                      }>
                        {ticket.fields?.[field.id] || 'Not set'}
                      </Badge>
                    ) : (
                      <span className="text-sm">
                        {ticket.fields?.[field.id] || 'Not set'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
