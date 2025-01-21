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
    <div className="fixed inset-0">
      <Header />
      <main className="absolute top-16 bottom-0 left-0 right-0 overflow-auto">
        {children}
      </main>
    </div>
  )
} 