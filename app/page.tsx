import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  ArrowRight,
  Bot,
} from "lucide-react"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between px-4 max-w-6xl mx-auto">
          <div className="flex items-center space-x-2">
            <Bot className="h-8 w-8" />
            <span className="font-bold text-2xl">autoCRM</span>
          </div>
          {/*<nav className="flex items-center">
            <Link href="/login/customer">
              <Button variant="ghost" className="text-muted-foreground font-medium">Customer Login</Button>
            </Link>
            <Link href="/login/agent">
              <Button variant="ghost" className="text-muted-foreground font-medium">Agent Login</Button>
            </Link>
          </nav>*/}
        </div>
      </header>

      <main className="flex-1 flex items-center pb-20 bg-muted">
        <section className="container px-4 space-y-8 text-center max-w-6xl mx-auto">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold tracking-tighter">
              Customer Support Made Simple
            </h1>
            <p className="text-xl text-muted-foreground mx-auto max-w-[600px]">
              A modern customer relationship management platform that streamlines your support operations
              with AI-powered assistance.
            </p>
          </div>
          <div className="flex justify-center gap-4">
            <Link href="/customer/login">
              <Button size="lg">
                I&apos;m a customer
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/agent/login">
              <Button 
                size="lg" 
                variant="outline"
                className="dark:hover:bg-background/50"
              >
                I&apos;m an agent
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>
        {/*
        <section className="container px-4 py-16 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <MessageSquare className="h-8 w-8 mb-2" />
                <CardTitle>Multi-channel Support</CardTitle>
                <CardDescription>
                  Handle tickets from email, chat, and more in one unified platform
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Bot className="h-8 w-8 mb-2" />
                <CardTitle>AI-Powered</CardTitle>
                <CardDescription>
                  Smart chatbot and automated responses for faster resolution
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <BarChart className="h-8 w-8 mb-2" />
                <CardTitle>Advanced Analytics</CardTitle>
                <CardDescription>
                  Track performance metrics and improve team efficiency
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-8 w-8 mb-2" />
                <CardTitle>Team Collaboration</CardTitle>
                <CardDescription>
                  Work together seamlessly with real-time updates
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>*/}
      </main>
    </div>
  )
}