import { Button } from "@/components/ui/button"
import { Filter, ArrowRight } from "lucide-react"

export function SavedViews() {
  const views = [
    { id: "1", name: "High Priority", description: "All high priority tickets" },
    { id: "2", name: "Unassigned", description: "Tickets waiting for assignment" },
    { id: "3", name: "My Open Tickets", description: "All my open tickets" },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {views.map((view) => (
        <Button
          key={view.id}
          variant="outline"
          className="h-auto flex items-start gap-4 p-4 justify-between"
        >
          <div className="flex gap-4 items-center">
            <Filter className="h-4 w-4" />
            <div className="text-left">
              <div className="font-semibold">{view.name}</div>
              <div className="text-sm text-muted-foreground">{view.description}</div>
            </div>
          </div>
          <ArrowRight className="h-4 w-4" />
        </Button>
      ))}
    </div>
  )
} 