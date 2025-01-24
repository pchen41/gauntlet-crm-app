import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface TicketField {
  id: string
  name: string
  value: string | number
  type: string
  choices?: string[]
}

interface CustomerTicketFieldsProps {
  fields: TicketField[]
  tags: string[]
}

export function CustomerTicketFields({ fields, tags }: CustomerTicketFieldsProps) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle>Ticket Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {fields.map((field) => (
          <div key={field.id} className="space-y-1">
            <div className="text-sm font-medium text-muted-foreground">
              {field.name}
            </div>
            <div className="text-sm">
              {field.name === 'Status' ? (
                <Badge variant='outline'>
                  {field.value || 'Not set'}
                </Badge>
              ) : (
                field.value || 'Not set'
              )}
            </div>
          </div>
        ))}
        
        {tags && tags.length > 0 && (
          <div className="space-y-1">
            <div className="text-sm font-medium text-muted-foreground">
              Tags
            </div>
            <div className="flex flex-wrap gap-1">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 