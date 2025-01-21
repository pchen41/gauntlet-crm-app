import { Header } from "@/components/agent/header/header"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Agent Dashboard",
  description: "Support ticket management system",
}

export default function AgentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 pt-16">
        {children}
      </main>
    </div>
  )
} 