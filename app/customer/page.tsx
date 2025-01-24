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
          <div className="grid gap-4">
            {tickets.map((ticket) => (
              <Card key={ticket.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{ticket.title}</CardTitle>
                  <CardDescription>
                    Status: {ticket.fields.find((f: { name: string, value: string }) => f.name === 'Status')?.value || 'Unknown'}
                    {' • '}
                    Created: {new Date(ticket.created_at).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="link" className="px-0">
                    <Link href={`/customer/tickets/${ticket.id}`}>View Details →</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
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
