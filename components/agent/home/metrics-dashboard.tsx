'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Inbox, Clock, CheckCircle2 } from "lucide-react"
import { RecentTickets } from "./recent-tickets"
import { getAgentMetrics } from "@/lib/actions/agent-metrics"
import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"

interface Metrics {
  assignedTickets: number;
  resolvedTickets: number;
  avgResponseTime: string;
  avgResolutionTime: string;
  recentTickets: any[]; // Update this type based on your actual ticket type
}

export function MetricsDashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);

  useEffect(() => {
    const loadMetrics = async () => {
      const data = await getAgentMetrics();
      setMetrics(data);
    };
    loadMetrics();
  }, []);

  return (
    <>
      <div className="grid gap-6 md:grid-cols-4">
        <MetricCard
          title="Assigned Tickets"
          icon={<Inbox className="h-4 w-4 text-muted-foreground !mt-0" />}
          value={metrics?.assignedTickets}
          subtitle="In the last 7 days"
        />
        <MetricCard
          title="Resolved Tickets"
          icon={<CheckCircle2 className="h-4 w-4 text-muted-foreground !mt-0" />}
          value={metrics?.resolvedTickets}
          subtitle="In the last 7 days"
        />
        <MetricCard
          title="Response Time"
          icon={<Clock className="h-4 w-4 text-muted-foreground !mt-0" />}
          value={metrics?.avgResponseTime}
          subtitle="Average time to first response"
        />
        <MetricCard
          title="Resolution Time"
          icon={<Clock className="h-4 w-4 text-muted-foreground !mt-0" />}
          value={metrics?.avgResolutionTime}
          subtitle="Average time to resolution"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle>Recent Tickets</CardTitle>
            <CardDescription>The most recent tickets assigned to you</CardDescription>
          </CardHeader>
          <CardContent>
            {metrics ? (
              <RecentTickets tickets={metrics.recentTickets} />
            ) : (
              <Skeleton className="h-[50px] w-full" />
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function MetricCard({ title, icon, value, subtitle }: {
  title: string;
  icon: React.ReactNode;
  value: number | string | undefined;
  subtitle: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {value !== undefined ? (
          <div className="text-2xl font-bold">{value}</div>
        ) : (
          <Skeleton className="h-8 w-10" />
        )}
        <p className="text-xs text-muted-foreground">
          {subtitle}
        </p>
      </CardContent>
    </Card>
  );
} 