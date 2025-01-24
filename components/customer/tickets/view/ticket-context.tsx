'use client'

import { createContext, useContext } from 'react'

const TicketContext = createContext<any>(null)

export function useTicket() {
  const context = useContext(TicketContext)
  if (!context) {
    throw new Error('useTicket must be used within a TicketProvider')
  }
  return context
}

export { TicketContext } 