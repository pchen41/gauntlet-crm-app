"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthFormWrapper } from "@/components/auth/auth-form-wrapper"
import { toast } from "sonner"
import { LoaderCircle } from "lucide-react"

export default function AgentSignUp() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    const formData = new FormData(event.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const name = formData.get("name") as string

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: 'agent',
          name
        }
      }
    })

    setIsLoading(false)

    if (error) {
      return toast.error(error.message)
    }

    // toast.success("Check your email for the confirmation link")
    router.push("/agent/login")
  }

  return (
    <AuthFormWrapper
      title="Create agent account"
      description="Enter your email below"
    >
      <div className="flex flex-col gap-4">
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              type="text"
              autoCapitalize="words"
              autoComplete="name"
              disabled={isLoading}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={isLoading}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              disabled={isLoading}
              required
            />
          </div>
          <Button className="w-full mt-1" type="submit" disabled={isLoading}>
            {isLoading ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : null}
            Create account
          </Button>
        </form>
        <div className="text-center text-sm">
          Already have an account?{" "}
          <Link 
            href="/agent/login"
            className="font-medium text-primary hover:underline"
          >
            Sign in
          </Link>
        </div>
      </div>
    </AuthFormWrapper>
  )
} 