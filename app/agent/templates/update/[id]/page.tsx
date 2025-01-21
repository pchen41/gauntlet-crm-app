"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState, use } from "react"
import { TemplateForm } from "@/components/agent/templates/template-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default function UpdateTemplatePage({ params }: PageProps) {
  const router = useRouter()
  const [template, setTemplate] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const resolvedParams = use(params)

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        // Mock data with fields
        setTemplate({
          id: resolvedParams.id,
          name: "Mock Template",
          description: "This is a mock template for testing",
          fields: [
            {
              id: "1",
              name: "Customer Name",
              type: "text",
              description: "Full name of the customer",
              required: true,
              rank: 0,
              isDefault: true,
              visibleToCustomer: true
            },
            {
              id: "2",
              name: "Priority",
              type: "select",
              description: "Ticket priority level",
              required: true,
              rank: 1,
              isDefault: true,
              visibleToCustomer: true,
              choices: ["Low", "Medium", "High", "Urgent"],
              defaultValue: "Medium"
            },
            {
              id: "3",
              name: "Due Date",
              type: "date",
              description: "When this needs to be completed",
              required: false,
              rank: 2,
              isDefault: false,
              visibleToCustomer: true
            }
          ]
        })
      } catch (error) {
        console.error("Failed to fetch template:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTemplate()
  }, [resolvedParams.id])

  const handleSubmit = async (data: any) => {
    try {
      // TODO: Implement API call to update template
      console.log("Updating template:", data)
      
      // Redirect back to templates list
      router.push("/agent/templates")
    } catch (error) {
      console.error("Failed to update template:", error)
      // TODO: Add error handling
    }
  }

  if (loading) {
    return <div>Loading...</div> // TODO: Add proper loading state
  }

  if (!template) {
    return <div>Template not found</div> // TODO: Add proper error state
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-6">
          <Link href="/agent/templates">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Edit Template</h1>
        </div>
      </div>
      <div className="border rounded-lg p-6 bg-card">
        <TemplateForm template={template} create={false} onSubmit={handleSubmit} />
      </div>
    </div>
  )
}
