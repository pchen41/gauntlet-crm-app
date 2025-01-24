"use client"

import { Bot } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { UserNav } from "@/components/user/user-nav"

export function Header() {
  const pathname = usePathname()

  return (
    <div className="fixed top-0 left-0 right-0 z-50 border-b bg-background">
      <div className="flex h-16 items-center px-4">
        <div className="flex items-center gap-2 mr-8">
          <Bot className="h-6 w-6" />
          <span className="font-bold">autoCRM</span>
        </div>

        <nav className="flex items-center space-x-4 lg:space-x-6">
          <Link 
            href="/customer" 
            className={cn(
              "text-sm hover:text-primary",
              pathname === "/customer" || pathname === "/customer/" 
                ? "text-primary" 
                : "text-muted-foreground"
            )}
          >
            Home
          </Link>
          <Link 
            href="/customer/tickets" 
            className={cn(
              "text-sm hover:text-primary",
              pathname.startsWith("/customer/tickets") 
                ? "text-primary" 
                : "text-muted-foreground"
            )}
          >
            My Tickets
          </Link>
          <Link 
            href="/customer/articles" 
            className={cn(
              "text-sm hover:text-primary",
              pathname.startsWith("/customer/articles") 
                ? "text-primary" 
                : "text-muted-foreground"
            )}
          >
            Articles
          </Link>
        </nav>

        <div className="ml-auto flex items-center">
          <UserNav />
        </div>
      </div>
    </div>
  )
} 