import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"

export function RecentTickets() {
  // This would normally fetch from your database
  const tickets = [
    {
      id: "1",
      title: "Cannot access account",
      status: "open",
      priority: "high",
      created: new Date(2024, 2, 15),
    },
    {
      id: "2",
      title: "Payment failed",
      status: "in-progress",
      priority: "medium",
      created: new Date(2024, 2, 14),
    },
  ]

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Priority</TableHead>
          <TableHead>Created</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tickets.map((ticket) => (
          <TableRow key={ticket.id}>
            <TableCell className="font-medium">{ticket.title}</TableCell>
            <TableCell>
              <Badge variant={ticket.status === "open" ? "default" : "secondary"}>
                {ticket.status}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge variant={ticket.priority === "high" ? "destructive" : "default"}>
                {ticket.priority}
              </Badge>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {formatDistanceToNow(ticket.created, { addSuffix: true })}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
} 