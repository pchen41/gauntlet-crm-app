import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle, Inbox, Clock, Star, Filter } from "lucide-react"
import { RecentTickets } from "../../components/agent/home/recent-tickets"
import { AgentMetrics } from "../../components/agent/home/agent-metrics"
import { SavedViews } from "../../components/agent/home/saved-views"

export default function AgentDashboard() {
  return (
    <div className="flex flex-col gap-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's an overview of your support queue.</p>
        </div>
        <div className="flex gap-4">
          <Button>
            <Filter className="mr-2 h-4 w-4" />
            Create View
          </Button>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Ticket
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Assigned Tickets</CardTitle>
            <Inbox className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">123</div>
            <p className="text-xs text-muted-foreground">
              +10% from last week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Average Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1.2h</div>
            <p className="text-xs text-muted-foreground">
              -15% from last week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94%</div>
            <p className="text-xs text-muted-foreground">
              +2% from last week
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Tickets</CardTitle>
            <CardDescription>Your most recent assigned tickets</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentTickets />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Your Metrics</CardTitle>
            <CardDescription>Performance metrics for the last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <AgentMetrics />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Saved Views</CardTitle>
          <CardDescription>Quick access to your customized ticket views</CardDescription>
        </CardHeader>
        <CardContent>
          <SavedViews />
        </CardContent>
      </Card>
    </div>
  )
}
