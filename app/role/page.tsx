'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { createClient } from '@/utils/supabase/client'

async function updateUserRoles(roles: string[]) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No user found')

  const { error } = await supabase
    .from('profiles')
    .update({ roles })
    .eq('id', user.id)

  if (error) throw error
}

export default function AgentRolePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleAccept = async () => {
    setIsLoading(true)
    try {
      await updateUserRoles(['agent'])
      router.push('/agent')
    } catch (error) {
      setIsLoading(false)
      console.error('Error updating roles:', error)
    }
  }

  const handleDecline = () => {
    router.push('/')
  }

  return (
    <div className="container mx-auto max-w-screen-xl flex items-center justify-center min-h-screen py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Become an Agent</CardTitle>
          <CardDescription>
            Would you like to become an agent? Agents can view and manage support tickets. You will still have access to the customer portal.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Button 
            onClick={handleAccept} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "Adding role..." : "Yes, make me an agent"}
          </Button>
          <Button 
            onClick={handleDecline} 
            variant="outline" 
            className="w-full"
          >
            No, take me back
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
