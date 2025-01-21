"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

interface TemplateField {
  id: string
  name: string
  type: string
  description?: string
  required: boolean
  defaultValue?: string
  choices?: string[]
  rank: number
  isDefault: boolean
  visibleToCustomer: boolean
  editableByCustomer: boolean
}

interface TemplateFormProps {
  template: {
    id: string
    name: string
    description: string | null
    fields: TemplateField[]
  }
  create: boolean
  onSubmit: (data: {
    name: string
    description: string
    fields: TemplateField[]
  }) => void
  onFormChange?: (changed: boolean) => void
  submitDisabled?: boolean
}

export function TemplateForm({ 
  template, 
  create, 
  onSubmit,
  onFormChange,
  submitDisabled 
}: TemplateFormProps) {
  const [fields, setFields] = useState<TemplateField[]>(template.fields)
  const [name, setName] = useState(template?.name || "")
  const [description, setDescription] = useState(template?.description || "")

  // Add function to check if form has changes
  const checkForChanges = () => {
    const hasNameChanged = name !== template.name
    const hasDescriptionChanged = description !== template.description

    const hasFieldsChanged = JSON.stringify(fields) !== JSON.stringify(template.fields)

    const hasChanges = hasNameChanged || hasDescriptionChanged || hasFieldsChanged
    onFormChange?.(hasChanges)
  }

  // Add effect to check for changes whenever form values update
  useEffect(() => {
    checkForChanges()
  }, [name, description, fields])

  const addField = () => {
    const newField: TemplateField = {
      id: Math.random().toString(),
      name: "",
      type: "text",
      required: false,
      rank: fields.length,
      isDefault: false,
      visibleToCustomer: true,
      editableByCustomer: false
    }
    setFields([...fields, newField])
  }

  const removeField = (id: string) => {
    const field = fields.find(f => f.id === id)
    if (field?.isDefault) return // Prevent removal of default fields
    setFields(fields.filter((field) => field.id !== id))
  }

  const updateField = (id: string, updates: Partial<TemplateField>) => {
    setFields(
      fields.map((field) =>
        field.id === id ? { ...field, ...updates } : field
      )
    )
  }

  const renderFieldOptions = (field: TemplateField) => {
    // Hide default value for customer and agent types
    if (field.type === "customer" || field.type === "agent") {
      return null
    }

    switch (field.type) {
      case "select":
      case "multi-select":
        return (
          <div className="space-y-4">
            <div className="mt-2">
              <Label className="mb-2.5 block">Default Value</Label>
              <Select
                value={field.defaultValue || "none"}
                onValueChange={(value) => updateField(field.id, { 
                  defaultValue: value === "none" ? undefined : value 
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a default value" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No default</SelectItem>
                  {field.choices?.filter(choice => choice.trim() !== '')?.map((choice, index) => (
                    <SelectItem key={index} value={choice}>
                      {choice}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-2.5 block">Choices</Label>
              <div className="flex flex-wrap gap-2">
                {field.choices?.map((choice, index) => (
                  <div key={index} className="flex items-center">
                    <Input
                      value={choice}
                      onChange={(e) => {
                        const newChoices = [...(field.choices || [])]
                        newChoices[index] = e.target.value
                        updateField(field.id, { choices: newChoices })
                      }}
                      className="w-32 rounded-r-none"
                      disabled={field.isDefault && field.type !== "select"}
                    />
                    {(!field.isDefault || field.type === "select") && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="border-y border-r rounded-l-none"
                        onClick={() => {
                          const newChoices = [...(field.choices || [])]
                          newChoices.splice(index, 1)
                          updateField(field.id, { choices: newChoices })
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                {(!field.isDefault || field.type === "select") && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-9"
                    onClick={() =>
                      updateField(field.id, {
                        choices: [...(field.choices || []), `Option ${(field.choices?.length || 0) + 1}`],
                      })
                    }
                  >
                    Add Choice
                  </Button>
                )}
              </div>
            </div>
          </div>
        )
      default:
        return (
          <div className="mt-2">
            <Label className="mb-2.5 block">Default Value</Label>
            {field.type === "number" ? (
              <Input
                type="number"
                value={field.defaultValue || ""}
                onChange={(e) => updateField(field.id, { defaultValue: e.target.value })}
                placeholder="Enter default value"
              />
            ) : field.type === "date" ? (
              <Input
                type="date"
                value={field.defaultValue || ""}
                onChange={(e) => updateField(field.id, { defaultValue: e.target.value })}
              />
            ) : field.type === "text" ? (
              <Input
                type="text"
                value={field.defaultValue || ""}
                onChange={(e) => updateField(field.id, { defaultValue: e.target.value })}
                placeholder="Enter default value"
              />
            ) : null}
          </div>
        )
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit({ name, description, fields })
      }}
      className="space-y-6"
    >
      <div className="space-y-4">
        <div>
          <Label htmlFor="name" className="mb-2.5 block">Template Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="description" className="mb-2.5 block">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Fields</h3>
          <Button type="button" size="sm" onClick={addField}>
            <Plus className="h-4 w-4" />
            Add Field
          </Button>
        </div>

        {fields.map((field) => (
          <div
            key={field.id}
            className="border rounded-lg p-4 space-y-6"
          >
            <div className="flex justify-between">
              <div className="flex-1 space-y-6 p-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="mb-2.5 block">Field Name</Label>
                    <Input
                      value={field.name}
                      onChange={(e) =>
                        updateField(field.id, { name: e.target.value })
                      }
                      required
                      disabled={field.isDefault}
                    />
                  </div>
                  <div>
                    <Label className="mb-2.5 block">Field Type</Label>
                    <Select
                      value={field.type}
                      onValueChange={(value) =>
                        updateField(field.id, { type: value })
                      }
                      disabled={field.isDefault}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="number">Number</SelectItem>
                        <SelectItem value="select">Select</SelectItem>
                        {/*<SelectItem value="multi-select">Multi-select</SelectItem>*/}
                        <SelectItem value="date">Date</SelectItem>
                        <SelectItem value="customer">Customer</SelectItem>
                        <SelectItem value="agent">Agent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="mb-2.5 block">Description</Label>
                  <Input
                    value={field.description || ""}
                    onChange={(e) =>
                      updateField(field.id, { description: e.target.value })
                    }
                    placeholder="Enter field description"
                  />
                </div>

                {renderFieldOptions(field)}

                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`required-${field.id}`}
                      checked={field.required}
                      onCheckedChange={(checked: boolean) =>
                        updateField(field.id, { required: checked })
                      }
                    />
                    <Label 
                      htmlFor={`required-${field.id}`}
                      className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Required
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`visible-${field.id}`}
                      checked={field.visibleToCustomer}
                      onCheckedChange={(checked: boolean) =>
                        updateField(field.id, { visibleToCustomer: checked })
                      }
                    />
                    <Label 
                      htmlFor={`visible-${field.id}`}
                      className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Visible to customer
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`editable-${field.id}`}
                      checked={field.editableByCustomer}
                      onCheckedChange={(checked: boolean) =>
                        updateField(field.id, { editableByCustomer: checked })
                      }
                      disabled={!field.visibleToCustomer}
                    />
                    <Label 
                      htmlFor={`editable-${field.id}`}
                      className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Editable by customer
                    </Label>
                  </div>
                </div>
              </div>
              {!field.isDefault && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="ml-4"
                  onClick={() => removeField(field.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end space-x-4">
        <Button type="submit" disabled={submitDisabled}>
          {create ? "Create Template" : "Update Template"}
        </Button>
      </div>
    </form>
  )
} 