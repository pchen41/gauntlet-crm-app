"use client"

import { Bot } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { UserNav } from "@/components/user/user-nav"
import { createClient } from "@/utils/supabase/client"
import { useEffect, useState } from "react"

export function Header() {
  const pathname = usePathname()
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    async function checkRole() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('roles')
          .eq('id', user.id)
          .single()
        
        if (data?.roles?.includes('admin')) {
          setIsAdmin(true)
        }
      }
    }
    checkRole()
  }, [])

  return (
    <div className="fixed top-0 left-0 right-0 z-50 border-b bg-background">
      <div className="flex h-16 items-center px-4">
        <div className="flex items-center gap-2 mr-8">
          <Bot className="h-6 w-6" />
          <span className="font-bold">autoCRM</span>
        </div>

        <nav className="flex items-center space-x-4 lg:space-x-6">
          <Link 
            href="/agent" 
            className={cn(
              "text-sm hover:text-primary",
              pathname === "/agent" || pathname === "/agent/" 
                ? "text-primary" 
                : "text-muted-foreground"
            )}
          >
            Dashboard
          </Link>
          <Link 
            href="/agent/tickets" 
            className={cn(
              "text-sm hover:text-primary",
              pathname.startsWith("/agent/tickets") 
                ? "text-primary" 
                : "text-muted-foreground"
            )}
          >
            Tickets
          </Link>
          <Link 
            href="/agent/templates" 
            className={cn(
              "text-sm hover:text-primary",
              pathname.startsWith("/agent/templates") 
                ? "text-primary" 
                : "text-muted-foreground"
            )}
          >
            Templates
          </Link>
          <Link 
            href="/agent/articles" 
            className={cn(
              "text-sm hover:text-primary",
              pathname.startsWith("/agent/articles") 
                ? "text-primary" 
                : "text-muted-foreground"
            )}
          >
            Articles
          </Link>
          {isAdmin && (
            <Link 
              href="/agent/teams" 
              className={cn(
                "text-sm hover:text-primary",
                pathname.startsWith("/agent/teams") 
                  ? "text-primary" 
                  : "text-muted-foreground"
              )}
            >
              Teams
            </Link>
          )}
        </nav>

        <div className="ml-auto flex items-center">
          <UserNav />
        </div>
      </div>
    </div>
  )
} 