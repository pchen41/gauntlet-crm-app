"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from 'date-fns'
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type FormattedTicket = {
  id: string
  title: string
  status: string
  template: string
  createdAt: string
  updatedAt: string
  href: string
}

export const columns: ColumnDef<FormattedTicket>[] = [
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return <Badge variant="outline">{status}</Badge>
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "template",
    header: "Template",
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Created
          {column.getIsSorted() === "asc" ? (
            <ArrowUp className="w-4 h-4 ml-1" />
          ) : column.getIsSorted() === "desc" ? (
            <ArrowDown className="w-4 h-4 ml-1" />
          ) : (
            <ArrowUpDown className="w-4 h-4 ml-1" />
          )}
        </Button>
      )
    },
    cell: ({ row }) => {
      return formatDistanceToNow(new Date(row.getValue("createdAt")), { addSuffix: true })
    },
  },
  {
    accessorKey: "updatedAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Updated
          {column.getIsSorted() === "asc" ? (
            <ArrowUp className="w-4 h-4 ml-1" />
          ) : column.getIsSorted() === "desc" ? (
            <ArrowDown className="w-4 h-4 ml-1" />
          ) : (
            <ArrowUpDown className="w-4 h-4 ml-1" />
          )}
        </Button>
      )
    },
    cell: ({ row }) => {
      return formatDistanceToNow(new Date(row.getValue("updatedAt")), { addSuffix: true })
    },
  },
] 