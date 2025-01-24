"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState, use } from "react"
import { TemplateForm } from "@/components/agent/templates/template-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft, LoaderCircle } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/utils/supabase/client"

interface Template {
  id: string
  name: string
  description: string | null
  created_at: string
  created_by: string
  deleted_at: string | null
  parent_id: string | null
}

interface TemplateField {
  id: string
  name: string
  type: string
  description: string | null
  required: boolean
  rank: number
  default_value: string | null
  choices: string[] | null
  default: boolean
  visible_to_customer: boolean
  editable_by_customer: boolean
  ticket_template_id: string
}

interface FormTemplateField {
  id: string
  name: string
  type: string
  description?: string
  required: boolean
  rank: number
  defaultValue?: string
  choices?: string[]
  isDefault: boolean
  visibleToCustomer: boolean
  editableByCustomer: boolean
}

interface FormTemplate {
  id: string
  name: string
  description: string | null
  fields: FormTemplateField[]
}

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default function UpdateTemplatePage({ params }: PageProps) {
  const router = useRouter()
  const supabase = createClient()
  const [template, setTemplate] = useState<Template | null>(null)
  const [fields, setFields] = useState<TemplateField[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const resolvedParams = use(params)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        // Fetch template
        const { data: templateData, error: templateError } = await supabase
          .from('ticket_templates')
          .select('*')
          .eq('id', resolvedParams.id)
          .single()

        if (templateError) throw templateError
        if (!templateData) throw new Error('Template not found')

        // Fetch template fields
        const { data: fieldsData, error: fieldsError } = await supabase
          .from('template_fields')
          .select('*')
          .eq('ticket_template_id', resolvedParams.id)
          .order('rank', { ascending: true })

        if (fieldsError) throw fieldsError

        setTemplate(templateData)
        setFields(fieldsData)
      } catch (error) {
        console.error("Failed to fetch template:", error)
        setError(error instanceof Error ? error.message : 'Failed to fetch template')
      } finally {
        setLoading(false)
      }
    }

    fetchTemplate()
  }, [resolvedParams.id, supabase])

  const handleSubmit = async (formData: any) => {
    try {
      const { data: newTemplate, error: templateError } = await supabase
        .rpc('create_ticket_template', {
          p_name: formData.name,
          p_description: formData.description,
          p_fields: formData.fields.map((field: any) => ({
            name: field.name,
            type: field.type,
            description: field.description,
            required: field.required,
            default_value: field.defaultValue,
            choices: field.choices,
            isDefault: field.isDefault,
            visible_to_customer: field.visibleToCustomer,
            editable_by_customer: field.editableByCustomer
          })),
          p_parent_id: template?.parent_id || template?.id
        })

      if (templateError) throw templateError
      router.push("/agent/templates")
    } catch (error) {
      console.error("Failed to update template:", error)
      setError(error instanceof Error ? error.message : 'Failed to update template')
    }
  }

  const handleFormChange = (changed: boolean) => {
    setHasChanges(changed)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <LoaderCircle className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <div className="bg-destructive/15 text-destructive p-4 rounded-lg">
          {error}
        </div>
      </div>
    )
  }

  if (!template) {
    return (
      <div className="container mx-auto py-10">
        <div className="bg-destructive/15 text-destructive p-4 rounded-lg">
          Template not found
        </div>
      </div>
    )
  }

  const formattedTemplate: FormTemplate = {
    id: template.id,
    name: template.name,
    description: template.description,
    fields: fields.map(field => ({
      id: field.id,
      name: field.name,
      type: field.type,
      description: field.description || undefined,
      required: field.required,
      rank: field.rank,
      defaultValue: field.default_value || undefined,
      choices: field.choices || undefined,
      isDefault: field.default,
      visibleToCustomer: field.visible_to_customer,
      editableByCustomer: field.editable_by_customer,
    }))
  }

  return (
    <div className="container mx-auto py-10 pt-8">
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
        <TemplateForm 
          template={formattedTemplate} 
          create={false} 
          onSubmit={handleSubmit}
          onFormChange={handleFormChange}
          submitDisabled={!hasChanges}
        />
      </div>
    </div>
  )
}
