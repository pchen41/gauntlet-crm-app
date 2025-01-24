import { Header } from "@/components/agent/header/header"
import { Metadata } from "next"
import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"

export const metadata: Metadata = {
  title: "Agent Dashboard",
  description: "Support ticket management system",
}

export default async function AgentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('roles')
    .eq('id', user.id)
    .single()

  if (!profile?.roles?.includes('agent')) {
    redirect('/role')
  }

  return (
    <div className="fixed inset-0">
      <Header />
      <main className="absolute top-16 bottom-0 left-0 right-0 overflow-auto">
        {children}
      </main>
    </div>
  )
} 