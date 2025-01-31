"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"

const formSchema = z.object({
  template_id: z.string().min(1, "Please select a template"),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  fields: z.array(z.object({
    id: z.string(),
    name: z.string(),
    value: z.string(),
    type: z.string()
  }))
})

interface Template {
  id: string
  name: string
  template_fields: {
    id: string
    name: string
    type: string
    required: boolean
    choices?: string[]
    default_value?: string
    visible_to_customer: boolean
    editable_by_customer: boolean
    rank: number
  }[]
}

interface CreateTicketFormProps {
  templates: Template[]
  createTicket: (formData: FormData) => Promise<void>
}

export function CreateTicketForm({ templates, createTicket }: CreateTicketFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      template_id: "",
      title: "",
      description: "",
      fields: []
    },
  })

  // Initialize customFields with default values when template changes
  const selectedTemplateId = form.watch("template_id")
  const title = form.watch("title")
  const description = form.watch("description")
  const selectedTemplate = templates.find(t => t.id === selectedTemplateId)
  
  const [customFields, setCustomFields] = useState<Record<string, string>>({})

  // Update customFields when template changes
  useEffect(() => {
    if (selectedTemplate) {
      const defaults = selectedTemplate.template_fields.reduce((acc, field) => ({
        ...acc,
        [`field_${field.id}`]: field.default_value || ''
      }), {})
      setCustomFields(defaults)
    }
  }, [selectedTemplate])

  const customerVisibleFields = selectedTemplate?.template_fields.filter(
    field => field.visible_to_customer && field.editable_by_customer
  ) || []

  // Check if any required customer-editable fields are empty
  const hasEmptyRequiredFields = customerVisibleFields
    .filter(field => field.required)
    .some(field => !customFields[`field_${field.id}`]?.trim())

  // Disable button if required fields are empty or form is submitting
  const isSubmitDisabled = !selectedTemplateId || 
    !title?.trim() || 
    !description?.trim() || 
    hasEmptyRequiredFields ||
    isSubmitting

  return (
    <Form {...form}>
      <form 
        action={async (formData) => {
          try {
            setIsSubmitting(true)
            await createTicket(formData)
          } finally {
            setIsSubmitting(false)
          }
        }} 
        className="space-y-5"
      >
        <FormField
          control={form.control}
          name="template_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Template</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a template" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <input 
          type="hidden" 
          name="template_id" 
          value={form.watch("template_id")} 
        />

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Ticket title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe your issue..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {customerVisibleFields.map((field) => (
          <FormItem key={field.id}>
            <FormLabel>
              {field.name}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </FormLabel>
            <FormControl>
              {field.type === 'select' ? (
                <Select
                  name={`field_${field.id}`}
                  defaultValue={field.default_value}
                  required={field.required}
                  onValueChange={(value) => {
                    setCustomFields(prev => ({
                      ...prev,
                      [`field_${field.id}`]: value
                    }))
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={`Select ${field.name}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {field.choices?.map((choice) => (
                      <SelectItem key={choice} value={choice}>
                        {choice}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  name={`field_${field.id}`}
                  type={field.type}
                  defaultValue={field.default_value}
                  required={field.required}
                  onChange={(e) => {
                    setCustomFields(prev => ({
                      ...prev,
                      [`field_${field.id}`]: e.target.value
                    }))
                  }}
                />
              )}
            </FormControl>
          </FormItem>
        ))}

        <Button 
          type="submit" 
          className="!mt-6"
          disabled={isSubmitDisabled}
        >
          {isSubmitting ? "Creating..." : "Create Ticket"}
        </Button>
      </form>
    </Form>
  )
} 