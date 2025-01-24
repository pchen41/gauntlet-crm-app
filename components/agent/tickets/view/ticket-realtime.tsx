'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { RealtimeChannel } from '@supabase/supabase-js'

interface TemplateField {
  id: string
  name: string
  type: string
  choices?: string[]
}

interface TicketTemplate {
  id: string
  name: string
  template_fields: TemplateField[]
}

interface Profile {
  name: string
  email: string
}

interface TicketUpdate {
  id: string
  comment?: string
  updates?: {
    id?: string
    field: string
    old_value: string
    new_value: string
  }[]
  internal: boolean
  created_at: string
  created_by: Profile
}

interface Ticket {
  id: string
  title: string
  description?: string
  created_at: string
  created_by: string
  ticket_template_id: string
  updated_at: string
  fields: {
    id: string
    name: string
    value: any
    type: string
  }[]
  tags?: string[]
  creator: Profile
  ticket_templates: TicketTemplate
  ticket_updates: TicketUpdate[]
}

interface TicketComponentProps {
  ticket: Ticket
}

interface TicketRealtimeProps {
  ticketId: string
  children: React.ReactNode
  initialTicket: Ticket
}

export function TicketRealtime({ ticketId, children, initialTicket }: TicketRealtimeProps) {
  const [ticket, setTicket] = useState<Ticket>(initialTicket)
  const supabase = createClient()

  useEffect(() => {
    let ticketChannel: RealtimeChannel

    const setupRealtimeSubscription = async () => {
      // Subscribe to ticket changes
      ticketChannel = supabase
        .channel(`ticket-${ticketId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'tickets',
            filter: `id=eq.${ticketId}`
          },
          async (payload) => {
            // Fetch the updated ticket data
            const { data: updatedTicket } = await supabase
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
                    choices
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

            if (updatedTicket) {
              setTicket(updatedTicket)
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'ticket_updates',
            filter: `ticket_id=eq.${ticketId}`
          },
          async (payload) => {
            // Fetch the updated ticket data
            const { data: updatedTicket } = await supabase
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
                    choices
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

            if (updatedTicket) {
              setTicket(updatedTicket)
            }
          }
        )
        .subscribe()
    }

    setupRealtimeSubscription()

    return () => {
      if (ticketChannel) {
        supabase.removeChannel(ticketChannel)
      }
    }
  }, [ticketId])

  // Clone children and pass the updated ticket data
  return (
    <>
      {React.Children.map(children, (child) => {
        if (React.isValidElement<TicketComponentProps>(child)) {
          return React.cloneElement(child, { ticket })
        }
        return child
      })}
    </>
  )
}