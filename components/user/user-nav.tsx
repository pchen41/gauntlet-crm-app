"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, User, Sun, Moon, Laptop, Palette, IdCard } from "lucide-react"
import { useTheme } from "next-themes"
import { useRouter, usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import UserAvatar from "./user-avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip"

export function UserNav() {
  const { setTheme } = useTheme()
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const [user, setUser] = useState<{
    name: string | null
    email: string | null
    roles: string[] | null
  } | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [showAdminToggle, setShowAdminToggle] = useState(false)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user: sessionUser }, error } = await supabase.auth.getUser()
      
      if (sessionUser) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('name, email, roles')
          .eq('id', sessionUser.id)
          .single()

        setUser({
          name: profile?.name || 'User',
          email: profile?.email || null,
          roles: profile?.roles || null,
        })
        
        // Set initial admin state
        setIsAdmin(profile?.roles?.includes('admin') || false)
        
        // Show admin toggle if user is an agent and viewing an agent page
        setShowAdminToggle(
          profile?.roles?.includes('agent') && 
          pathname?.startsWith('/agent')
        )
      }
    }

    getUser()
  }, [supabase, pathname])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  const handleAdminToggle = async (checked: boolean) => {
    if (!user) return

    const currentRoles = new Set(user.roles || [])
    
    if (checked) {
      currentRoles.add('admin')
    } else {
      currentRoles.delete('admin')
    }

    const newRoles = Array.from(currentRoles)

    const { error } = await supabase
      .from('profiles')
      .update({ roles: newRoles })
      .eq('email', user.email)

    if (!error) {
      setIsAdmin(checked)
      setUser(prev => prev ? { ...prev, roles: newRoles } : null)
      router.refresh()
    }
  }

  const avatar = user ? (
      <UserAvatar
        name={user?.name || ''}
        email={user?.email || ''}
      />) 
    : (<Skeleton className="h-8 w-8 rounded-full" /> )
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            {avatar}
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user?.name || 'User'}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email || 'Loading...'}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {showAdminToggle && (
            <>
              <DropdownMenuItem className="flex items-center gap-2" onSelect={(e) => e.preventDefault()}>
                <TooltipProvider delayDuration={250}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-2">
                        <IdCard className="h-4 w-4" />
                        <span>Admin Mode</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Toggle admin role. Right now this just lets you manage teams.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <div className="ml-auto">
                  <Switch
                    checked={isAdmin}
                    onCheckedChange={handleAdminToggle}
                  />
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Palette className="h-4 w-4" />
              <span>Theme</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => setTheme("light")}>
                <Sun className="h-4 w-4" />
                <span>Light</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                <Moon className="h-4 w-4" />
                <span>Dark</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                <Laptop className="h-4 w-4" />
                <span>System</span>
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 