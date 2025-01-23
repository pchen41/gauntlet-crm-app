import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

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

export async function getAgentMetrics(): Promise<AgentMetrics> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error("User not authenticated");

  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  
  // Get assigned tickets in last week
  const { count: assignedTickets } = await supabase
    .from('tickets')
    .select('*', { count: 'exact' })
    .gte('created_at', oneWeekAgo.toISOString())
    .filter('fields', 'cs', `[{"name": "Assigned To", "value": "${user.id}"}]`)

  // Get assigned tickets in previous week for trend
  const { count: previousAssigned } = await supabase
    .from('tickets')
    .select('*', { count: 'exact' })
    .gte('created_at', twoWeeksAgo.toISOString())
    .lt('created_at', oneWeekAgo.toISOString())
    .filter('fields', 'cs', `[{"name": "Assigned To", "value": "${user.id}"}]`)

  // Get new tickets created in last week
  const { count: newTickets } = await supabase
    .from('tickets')
    .select('*', { count: 'exact' })
    .gte('created_at', oneWeekAgo.toISOString());

  // Get resolved tickets in last week
  const { data: resolvedTicketsData } = await supabase
    .from('ticket_updates')
    .select(`
      ticket_id,
      created_by
    `)
    .filter('updates', 'cs', `[{"field": "Status", "new_value": "Resolved"}]`)
    .eq('created_by', user.id)
    .gte('created_at', oneWeekAgo.toISOString())

  // Count unique ticket IDs
  const resolvedTickets = new Set(resolvedTicketsData?.map(update => update.ticket_id)).size;

  // Get average resolution time
  const { data: resolutionTimes } = await supabase
    .from('tickets')
    .select(`
      created_at,
      ticket_updates!inner (
        created_at,
        updates
      )
    `)
    .filter('fields', 'cs', `[{"name": "Assigned To", "value": "${user.id}"}]`)
    .filter('ticket_updates.updates', 'cs', `[{"field": "Status", "new_value": "Resolved"}]`)
    .gte('created_at', oneWeekAgo.toISOString());

  // Get average first response time
  const { data: responseTimes } = await supabase
    .from('tickets')
    .select(`
      created_at,
      ticket_updates!inner (
        created_at,
        internal
      )
    `)
    .filter('fields', 'cs', `[{"name": "Assigned To", "value": "${user.id}"}]`)
    .eq('ticket_updates.internal', false)
    .gte('created_at', oneWeekAgo.toISOString());
  
  // Calculate average resolution time
  let totalResolutionTime = 0;
  resolutionTimes?.forEach(ticket => {
    const createdAt = new Date(ticket.created_at);
    const resolvedAt = new Date(ticket.ticket_updates[0].created_at);
    totalResolutionTime += resolvedAt.getTime() - createdAt.getTime();
  });
  const avgResolutionHours = resolutionTimes?.length 
    ? (totalResolutionTime / resolutionTimes.length) / (1000 * 60 * 60)
    : 0;

  // Calculate average response time
  let totalResponseTime = 0;
  responseTimes?.forEach(ticket => {
    const createdAt = new Date(ticket.created_at);
    const firstResponseAt = new Date(ticket.ticket_updates[0].created_at);
    totalResponseTime += firstResponseAt.getTime() - createdAt.getTime();
  });
  const avgResponseHours = responseTimes?.length 
    ? (totalResponseTime / responseTimes.length) / (1000 * 60 * 60)
    : 0;

  // Calculate trends (percentage change)
  const assignedTrend = previousAssigned ? ((assignedTickets || 0 - previousAssigned) / previousAssigned) * 100 : 0;

  // Get recent tickets
  const { data: recentTickets } = await supabase
    .from('tickets')
    .select(`
      id,
      title,
      fields,
      created_at
    `)
    .filter('fields', 'cs', `[{"name": "Assigned To", "value": "${user.id}"}]`)
    .order('created_at', { ascending: false })
    .limit(5);

  const formattedRecentTickets: RecentTicket[] = recentTickets?.map(ticket => {
    const fields = ticket.fields as Array<{ name: string; value: string }>;
    return {
      id: ticket.id,
      title: ticket.title,
      status: fields.find(f => f.name === 'Status')?.value || 'New',
      priority: fields.find(f => f.name === 'Priority')?.value || 'Medium',
      created_at: ticket.created_at,
    };
  }) || [];

  return {
    assignedTickets: assignedTickets || 0,
    newTickets: newTickets || 0,
    resolvedTickets,
    avgResolutionTime: `${avgResolutionHours.toFixed(1)}h`,
    avgResponseTime: `${avgResponseHours.toFixed(1)}h`,
    assignedTrend,
    recentTickets: formattedRecentTickets,
  };
} 