"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState, use } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Pencil } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/utils/supabase/client"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface Template {
  id: string
  name: string
  description: string | null
  created_at: string
  created_by: string
  deleted_at: string | null
  parent_id: string | null
  profiles: {
    name: string
    email: string
  }
  version_templates?: {
    id: string
    name: string
    description: string | null
    created_at: string
    profiles: {
      name: string
      email: string
    }
  }[]
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

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default function TemplatePage({ params }: PageProps) {
  const router = useRouter()
  const supabase = createClient()
  const [template, setTemplate] = useState<Template | null>(null)
  const [fields, setFields] = useState<TemplateField[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const resolvedParams = use(params)

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const { data: templateData, error: templateError } = await supabase
          .from('ticket_templates')
          .select(`
            *,
            profiles:created_by (
              name,
              email
            )
          `)
          .eq('id', resolvedParams.id)
          .single()

        if (templateError) throw templateError
        if (!templateData) throw new Error('Template not found')

        const { data: historyData, error: historyError } = await supabase
          .from('ticket_templates')
          .select(`
            id,
            name,
            description,
            created_at,
            profiles:created_by (
              name,
              email
            )
          `)
          .or(
            templateData.parent_id 
              ? `id.eq.${templateData.parent_id},parent_id.eq.${templateData.parent_id},parent_id.eq.${templateData.id}`
              : `id.eq.${templateData.id},parent_id.eq.${templateData.id}`
          )
          .order('created_at', { ascending: false })

        if (historyError) throw historyError

        setTemplate({ ...templateData, version_templates: historyData })

        const { data: fieldsData, error: fieldsError } = await supabase
          .from('template_fields')
          .select('*')
          .eq('ticket_template_id', resolvedParams.id)
          .order('rank', { ascending: true })

        if (fieldsError) throw fieldsError

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
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

  return (
    <div className="container mx-auto py-10 pt-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Link href="/agent/templates">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">View Template</h1>
          </div>
          <Button
            onClick={() => router.push(`/agent/templates/update/${template.id}`)}
          >
            <Pencil className="h-4 w-4" />
            Edit Template
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">{template.name}</CardTitle>
          {template.description && (
            <CardDescription>{template.description}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Required</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Choices</TableHead>
                <TableHead>Customer Access</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fields.map((field) => (
                <TableRow key={field.id}>
                  <TableCell className="font-medium">{field.name}</TableCell>
                  <TableCell>{field.type}</TableCell>
                  <TableCell>{field.required ? "Yes" : "No"}</TableCell>
                  <TableCell>{field.description || "-"}</TableCell>
                  <TableCell>
                    {field.type === 'select' ? (
                      field.choices?.length ? (
                        <div className="flex flex-wrap gap-1">
                          {field.choices.map((choice, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium ring-1 ring-inset ring-muted"
                            >
                              {choice}
                            </span>
                          ))}
                        </div>
                      ) : "-"
                    ) : "-"}
                  </TableCell>
                  <TableCell>
                    {field.visible_to_customer
                      ? field.editable_by_customer
                        ? "Can edit"
                        : "Can view"
                      : "No access"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="text-xs text-muted-foreground mt-4">
            Created by {template.profiles.name} ({template.profiles.email}) on {new Date(template.created_at).toLocaleString()}
          </div>
        </CardContent>
      </Card>

      {template.version_templates && template.version_templates.length > 1 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Template History</CardTitle>
            <CardDescription>Previous versions of this template</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {template.version_templates.map((version, index) => (
                <div
                  key={version.id}
                  className={`flex items-start justify-between ${
                    index !== template.version_templates!.length - 1
                      ? "pb-6 border-b"
                      : ""
                  }`}
                >
                  <div>
                    <div className="font-medium">{version.name}</div>
                    <div className="text-xs text-muted-foreground">
                      Created by {version.profiles.name} ({version.profiles.email}) on{" "}
                      {new Date(version.created_at).toLocaleString()}
                    </div>
                  </div>
                  {version.id === template.id ? (
                    <div className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                      Current version
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/agent/templates/${version.id}`)}
                    >
                      View
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
