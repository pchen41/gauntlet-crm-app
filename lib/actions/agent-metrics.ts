import { createClient } from "@/utils/supabase/client";

export type RecentTicket = {
  id: string;
  title: string;
  status: string;
  priority: string;
  created_at: string;
};

export type AgentMetrics = {
  assignedTickets: number;
  newTickets: number;
  resolvedTickets: number;
  avgResolutionTime: string;
  avgResponseTime: string;
  assignedTrend: number;
  recentTickets: RecentTicket[];
};

type TicketField = {
  name: string;
  value: string;
};

type TicketUpdate = {
  created_at: string;
  updates: Array<{
    field: string;
    new_value: string;
  }>;
  internal: boolean;
  created_by: string;
  ticket_id?: string;
};

type TicketData = {
  id: string;
  title: string;
  fields: TicketField[];
  created_at: string;
  ticket_updates: TicketUpdate[];
};

export async function getAgentMetrics(): Promise<AgentMetrics> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error("User not authenticated");

  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  
  const { data: ticketsData } = await supabase
    .from('tickets')
    .select(`
      id,
      title,
      fields,
      created_at,
      ticket_updates (
        created_at,
        updates,
        internal,
        created_by
      )
    `)
    .gte('created_at', twoWeeksAgo.toISOString())
    .returns<TicketData[]>();

  if (!ticketsData) {
    return {
      assignedTickets: 0,
      newTickets: 0,
      resolvedTickets: 0,
      avgResolutionTime: '0h',
      avgResponseTime: '0h',
      assignedTrend: 0,
      recentTickets: [],
    };
  }

  // Process the consolidated data
  const currentWeekTickets = ticketsData.filter(t => 
    new Date(t.created_at) >= oneWeekAgo
  );
  const previousWeekTickets = ticketsData.filter(t => 
    new Date(t.created_at) >= twoWeeksAgo && new Date(t.created_at) < oneWeekAgo
  );

  // Filter assigned tickets
  const isAssignedToUser = (fields: TicketField[]) => 
    fields.some(f => f.name === 'Assigned To' && f.value === user.id);

  const assignedTickets = currentWeekTickets.filter(t => 
    isAssignedToUser(t.fields)
  ).length;

  const previousAssigned = previousWeekTickets.filter(t => 
    isAssignedToUser(t.fields)
  ).length;

  // Calculate resolved tickets
  const resolvedTickets = new Set(
    ticketsData
      .filter(t => new Date(t.created_at) >= oneWeekAgo)
      .flatMap(t => t.ticket_updates || [])
      .filter(update => 
        update.created_by === user.id &&
        update.updates?.some?.(u => u.field === 'Status' && u.new_value === 'Resolved')
      )
      .map(update => update.ticket_id)
  ).size;

  // Calculate average times for assigned tickets
  const assignedTicketsData = ticketsData.filter(t => 
    new Date(t.created_at) >= oneWeekAgo && isAssignedToUser(t.fields)
  );

  let totalResolutionTime = 0;
  let resolutionCount = 0;
  let totalResponseTime = 0;
  let responseCount = 0;

  assignedTicketsData.forEach(ticket => {
    const createdAt = new Date(ticket.created_at).getTime();
    const updates = ticket.ticket_updates || [];
    
    // Resolution time
    const resolveUpdate = updates.find(u => 
      u.updates?.some?.(upd => upd.field === 'Status' && upd.new_value === 'Resolved')
    );
    if (resolveUpdate) {
      totalResolutionTime += new Date(resolveUpdate.created_at).getTime() - createdAt;
      resolutionCount++;
    }

    // Response time
    const firstResponse = updates
      .filter(u => !u.internal)
      .sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      )[0];
    if (firstResponse) {
      totalResponseTime += new Date(firstResponse.created_at).getTime() - createdAt;
      responseCount++;
    }
  });

  const avgResolutionHours = resolutionCount 
    ? (totalResolutionTime / resolutionCount) / (1000 * 60 * 60)
    : 0;
  const avgResponseHours = responseCount 
    ? (totalResponseTime / responseCount) / (1000 * 60 * 60)
    : 0;

  // Calculate trends
  const assignedTrend = previousAssigned 
    ? ((assignedTickets - previousAssigned) / previousAssigned) * 100 
    : 0;

  // Format recent tickets
  const recentTickets: RecentTicket[] = assignedTicketsData
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)
    .map(ticket => ({
      id: ticket.id,
      title: ticket.title,
      status: ticket.fields.find(f => f.name === 'Status')?.value || 'New',
      priority: ticket.fields.find(f => f.name === 'Priority')?.value || 'Medium',
      created_at: ticket.created_at,
    }));

  return {
    assignedTickets,
    newTickets: currentWeekTickets.length,
    resolvedTickets,
    avgResolutionTime: `${avgResolutionHours.toFixed(1)}h`,
    avgResponseTime: `${avgResponseHours.toFixed(1)}h`,
    assignedTrend,
    recentTickets,
  };
} 