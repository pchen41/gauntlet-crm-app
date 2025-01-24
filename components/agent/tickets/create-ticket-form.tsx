'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'

interface Agent {
  id: string
  name: string
}

interface TemplateField {
  id: string
  name: string
  type: string
  required: boolean
  choices?: string[]
  default_value?: string | null
  visible_to_customer: boolean
  description?: string
}

interface Template {
  id: string
  name: string
  description: string | null
  template_fields: TemplateField[]
}

interface CreateTicketFormProps {
  templates: Template[]
  agents: Agent[]
  createTicket: (formData: FormData) => Promise<void>
}

const formSchema = z.object({
  template_id: z.string().min(1, 'Template is required'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
})

export function CreateTicketForm({ templates, agents, createTicket }: CreateTicketFormProps) {
  const router = useRouter()
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      template_id: '',
      title: '',
      description: '',
    },
  })

  const selectedTemplateFields = templates
    .find((template) => template.id === selectedTemplate)
    ?.template_fields || []

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      const formData = new FormData()
      // Add form fields to FormData
      Object.entries(data).forEach(([key, value]) => {
        if (value) formData.append(key, value)
      })
      
      // Add template fields to FormData
      const formElement = document.querySelector('form')
      if (formElement) {
        selectedTemplateFields.forEach((field) => {
          const fieldName = `field_${field.id}`
          const fieldValue = (formElement.elements as any)[fieldName]?.value
          if (fieldValue) {
            formData.append(fieldName, fieldValue)
          }
        })
      }

      await createTicket(formData)
      toast.success('Ticket created successfully')
      router.push('/agent/tickets')
    } catch (error) {
      toast.error('Failed to create ticket')
      console.error(error)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-5">
          <FormField
            control={form.control}
            name="template_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Template</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value)
                    setSelectedTemplate(value)
                  }}
                  value={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a template" />
                  </SelectTrigger>
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

          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input {...field} />
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
                  <Textarea {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {selectedTemplateFields.map((templateField) => {
            const fieldName = `field_${templateField.id}`
            
            switch (templateField.type) {
              case 'text':
                return (
                  <FormItem key={templateField.id}>
                    <FormLabel>{templateField.name}</FormLabel>
                    {templateField.description && (
                      <FormDescription>{templateField.description}</FormDescription>
                    )}
                    <FormControl>
                      <Input
                        name={fieldName}
                        required={templateField.required}
                        defaultValue={templateField.default_value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )
              case 'select':
                return (
                  <FormItem key={templateField.id}>
                    <FormLabel>{templateField.name}</FormLabel>
                    {templateField.description && (
                      <FormDescription>{templateField.description}</FormDescription>
                    )}
                    <Select name={fieldName} defaultValue={templateField.default_value || ''}>
                      <SelectTrigger>
                        <SelectValue placeholder={`Select ${templateField.name}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {templateField.choices?.map((choice) => (
                          <SelectItem key={choice} value={choice}>
                            {choice}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )
            }
          })}
        </div>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button type="submit">Create Ticket</Button>
        </div>
      </form>
    </Form>
  )
} 