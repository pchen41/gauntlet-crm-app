"use client"

import { useEffect, useState } from "react"
import { Plus, Pencil, LoaderCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"

interface TicketTemplate {
  id: string
  name: string
  description: string | null
  created_at: string
  created_by: string
}

export default function TemplatesPage() {
  const router = useRouter()
  const [templates, setTemplates] = useState<TicketTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchTemplates() {
      try {
        const { data, error } = await supabase
          .from("ticket_templates")
          .select("*")
          .is("deleted_at", null)
          .order("created_at", { ascending: false })

        if (error) {
          console.error("Error fetching templates:", error)
          return
        }

        setTemplates(data || [])
      } catch (error) {
        console.error("Error:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTemplates()
  })

  return (
    <div className="container mx-auto py-10 pt-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Ticket Templates</h1>
        <Button onClick={() => router.push("/agent/templates/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Create Template
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  <div className="flex justify-center w-full">
                    <LoaderCircle className="h-8 w-8 animate-spin" />
                  </div>
                </TableCell>
              </TableRow>
            ) : templates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  No templates found. Create your first template!
                </TableCell>
              </TableRow>
            ) : (
              templates.map((template) => (
                <TableRow 
                  key={template.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => router.push(`/agent/templates/${template.id}`)}
                >
                  <TableCell>{template.name}</TableCell>
                  <TableCell>{template.description}</TableCell>
                  <TableCell>
                    {new Date(template.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/agent/templates/update/${template.id}`)
                      }}
                    >
                      <Pencil className="h-3 w-3" />
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
