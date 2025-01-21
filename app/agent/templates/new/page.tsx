"use client"

import { useRouter } from "next/navigation"
import { TemplateForm } from "@/components/agent/templates/template-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/utils/supabase/client"
import { useToast } from "@/hooks/use-toast"

type TemplateFormData = {
  name: string
  description?: string
  fields: {
    name: string
    description?: string
    type: string
    required: boolean
    rank: number
    defaultValue?: string
    choices?: string[]
    isDefault: boolean
    visibleToCustomer: boolean
  }[]
}

const DEFAULT_FIELDS = [
  {
    id: "assigned_to",
    name: "Assigned To",
    type: "agent",
    description: "Agent responsible for this ticket",
    required: true,
    rank: 0,
    isDefault: true,
    visibleToCustomer: true
  },
  {
    id: "status",
    name: "Status",
    type: "select",
    description: "Current status of the ticket",
    required: true,
    choices: ["New", "In Progress", "Waiting For Customer", "Resolved"],
    defaultValue: "New",
    rank: 1,
    isDefault: true,
    visibleToCustomer: true
  },
  {
    id: "priority",
    name: "Priority",
    type: "select",
    description: "Ticket priority (0 = Highest, 3 = Lowest)",
    required: true,
    choices: ["0", "1", "2", "3"],
    rank: 2,
    isDefault: true,
    visibleToCustomer: true
  },
]

export default function NewTemplatePage() {
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()

  const handleSubmit = async (data: TemplateFormData) => {
    try {
      const transformedFields = data.fields.map(field => ({
        name: field.name,
        description: field.description,
        type: field.type,
        required: field.required,
        default_value: field.defaultValue,
        choices: field.choices,
        isDefault: field.isDefault,
        visible_to_customer: field.visibleToCustomer
      }))

      const { data: templateId, error } = await supabase
        .rpc('create_ticket_template', {
          p_name: data.name,
          p_description: data.description || null,
          p_fields: transformedFields
        })

      if (error) throw error

      toast({
        title: "Success",
        description: "Template created successfully",
      })
      
      router.push("/agent/templates")
    } catch (error) {
      toast({
        title: "Failed to create template",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      })
    }
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
          <h1 className="text-3xl font-bold">Create Template</h1>
        </div>
      </div>
      <div className="border rounded-lg p-6 bg-card">
        <TemplateForm 
          template={{ 
            id: "", 
            name: "", 
            description: null, 
            fields: DEFAULT_FIELDS 
          }}
          create={true}
          onSubmit={handleSubmit} 
        />
      </div>
    </div>
  )
}
