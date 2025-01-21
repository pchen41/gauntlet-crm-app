import { cn } from "@/lib/utils"
import { Bot } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

interface AuthFormWrapperProps {
  children: React.ReactNode
  className?: string
  title: string
  description: string
}

export function AuthFormWrapper({ 
  children, 
  className,
  title,
  description
}: AuthFormWrapperProps) {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-muted px-4">
      <div className="w-full max-w-[350px] space-y-6">
        <div className="flex flex-col items-center space-y-2 text-center">
          <a href="/" className="flex items-center gap-2 font-medium">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Bot className="h-4 w-4" />
            </div>
            autoCRM
          </a>
        </div>
        <Card className="w-full">
          <CardHeader className="space-y-1 text-center">
            <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
            <p className="text-sm text-muted-foreground">{description}</p>
          </CardHeader>
          <CardContent>
            {children}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 