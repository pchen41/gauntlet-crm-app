import { Metadata } from "next"
import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { MessageSquare, Search, Ticket, FileText } from "lucide-react"
import { ChatButton } from "@/components/customer/home/chat-button"

export const metadata: Metadata = {
  title: "Customer Support Portal",
  description: "View tickets and get support",
}

export default async function CustomerPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Fetch recent tickets
  const { data: tickets } = await supabase
    .from('tickets')
    .select('*')
    .eq('created_by', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <h1 className="text-4xl font-bold mb-8">Support Portal</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ticket className="h-5 w-5" />
              Submit a Ticket
            </CardTitle>
            <CardDescription>Create a new support request</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/customer/tickets/new">New Ticket</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Chat Support
            </CardTitle>
            <CardDescription>Get instant help from our AI assistant</CardDescription>
          </CardHeader>
          <CardContent>
            <ChatButton />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Knowledge Base
            </CardTitle>
            <CardDescription>Browse help articles and FAQs</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="secondary" className="w-full">
              <Link href="/customer/articles">View Articles</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Recent Tickets</h2>
          <Button asChild variant="outline">
            <Link href="/customer/tickets">View All Tickets</Link>
          </Button>
        </div>

        {tickets && tickets.length > 0 ? (
          <div className="rounded-lg border">
            <div className="divide-y">
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="flex items-center justify-between p-4 hover:bg-muted/50"
                >
                  <div className="flex flex-col gap-1">
                    <Link
                      href={`/customer/tickets/${ticket.id}`}
                      className="font-medium hover:underline"
                    >
                      {ticket.title}
                    </Link>
                    <div className="text-sm text-muted-foreground">
                      Created {new Date(ticket.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-sm font-medium ring-1 ring-inset ring-muted-foreground/20">
                      {ticket.fields.find((f: { name: string, value: string }) => f.name === 'Status')?.value || 'Unknown'}
                    </span>
                    <Button variant="ghost" size="default" asChild>
                      <Link href={`/customer/tickets/${ticket.id}`}>
                        View →
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No tickets found. Create a new ticket to get started.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
