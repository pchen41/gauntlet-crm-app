import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"

type RecentTicketsProps = {
  tickets: {
    id: string;
    title: string;
    status: string;
    priority: string;
    created_at: string;
  }[];
};

export function RecentTickets({ tickets }: RecentTicketsProps) {
  if (tickets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center pb-2 text-center">
        <p className="text-lg font-medium text-muted-foreground">No recent tickets</p>
        <p className="text-sm text-muted-foreground">New tickets will appear here</p>
      </div>
    );
  }

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
          <TableRow key={ticket.id} className="hover:bg-muted/50 cursor-pointer group">
            <TableCell className="font-medium">
              <Link 
                href={`/agent/tickets/${ticket.id}`}
                className="block"
              >
                {ticket.title}
              </Link>
            </TableCell>
            <TableCell>
              <Link 
                href={`/agent/tickets/${ticket.id}`}
                className="block"
              >
                <Badge variant="outline">
                  {ticket.status}
                </Badge>
              </Link>
            </TableCell>
            <TableCell>
              <Link 
                href={`/agent/tickets/${ticket.id}`}
                className="block"
              >
                <Badge variant="outline">
                  {ticket.priority}
                </Badge>
              </Link>
            </TableCell>
            <TableCell className="text-muted-foreground">
              <Link 
                href={`/agent/tickets/${ticket.id}`}
                className="block"
              >
                {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
} 