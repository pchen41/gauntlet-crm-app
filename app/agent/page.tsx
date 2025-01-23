import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle, Inbox, Clock, Star, Filter, CheckCircle2, Ticket } from "lucide-react"
import { RecentTickets } from "../../components/agent/home/recent-tickets"
import { AgentMetrics } from "../../components/agent/home/agent-metrics"
import { SavedViews } from "../../components/agent/home/saved-views"
import { getAgentMetrics } from "@/lib/actions/agent-metrics"

export default async function AgentDashboard() {
  const metrics = await getAgentMetrics();

  return (
    <div className="flex flex-col gap-6 p-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here&apos;s an overview of your support queue.</p>
        </div>
        <div className="flex gap-4">
          <Button asChild>
            <a href="/agent/tickets">
              <Ticket className="h-4 w-4" />
              View Tickets
            </a>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Assigned Tickets</CardTitle>
            <Inbox className="h-4 w-4 text-muted-foreground !mt-0" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.assignedTickets}</div>
            <p className="text-xs text-muted-foreground">
              In the last 7 days
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Resolved Tickets</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground !mt-0" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.resolvedTickets}</div>
            <p className="text-xs text-muted-foreground">
              In the last 7 days
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground !mt-0" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.avgResponseTime}</div>
            <p className="text-xs text-muted-foreground">
              Average time to first response
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Resolution Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground !mt-0" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.avgResolutionTime}</div>
            <p className="text-xs text-muted-foreground">
              Average time to resolution
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Tickets</CardTitle>
            <CardDescription>The most recent tickets assigned to you</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentTickets tickets={metrics.recentTickets} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
