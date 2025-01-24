'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { TicketFields } from '@/components/agent/tickets/view/ticket-fields'
import { TicketHistory } from '@/components/agent/tickets/view/ticket-history'
import { useState } from 'react'

interface TicketContentProps {
  ticket: any
}

export function TicketContent({ ticket }: TicketContentProps) {
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