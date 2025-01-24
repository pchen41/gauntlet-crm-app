import { Button } from "@/components/ui/button"
import { Ticket } from "lucide-react"
import { MetricsDashboard } from "@/components/agent/home/metrics-dashboard"

export default function AgentDashboard() {
  return (
    <div className="container mx-auto py-10 pt-8 space-y-6">
      <div className="flex items-start justify-between pb-2">
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

      <MetricsDashboard />
    </div>
  )
}
