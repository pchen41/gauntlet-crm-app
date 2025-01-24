'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import { TicketContext } from './ticket-context'

interface TicketRealtimeProps {
  ticketId: string
  initialTicket: any
  children: React.ReactNode
}

export function TicketRealtime({ ticketId, initialTicket, children }: TicketRealtimeProps) {
  const [ticket, setTicket] = useState(initialTicket)

  useEffect(() => {
    const supabase = createClient()

    // Subscribe to ticket changes
    const ticketSubscription = supabase
      .channel(`ticket-${ticketId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tickets',
          filter: `id=eq.${ticketId}`,
        },
        async (payload) => {
          if (payload.eventType === 'DELETE') {
            return
          }

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

          if (updatedTicket) {
            setTicket(updatedTicket)
          }
        }
      )
      .subscribe()

    // Subscribe to ticket updates
    const updatesSubscription = supabase
      .channel(`ticket-updates-${ticketId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ticket_updates',
          filter: `ticket_id=eq.${ticketId}`,
        },
        async (payload) => {
          // Fetch the updated ticket data to get the complete update information
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

          if (updatedTicket) {
            setTicket(updatedTicket)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(ticketSubscription)
      supabase.removeChannel(updatesSubscription)
    }
  }, [ticketId])

  return (
    <TicketContext.Provider value={ticket}>
      {children}
    </TicketContext.Provider>
  )
} 