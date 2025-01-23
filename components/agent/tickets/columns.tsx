"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import Link from "next/link"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { formatDistanceToNow } from "date-fns"

export type FormattedTicket = {
  id: string
  title: string
  assignedTo: string
  status: string
  priority: string
  template: string
  createdBy: string
  creatorEmail: string
  createdAt: string
  updatedAt: string
  tags: string[]
  href: string
  assignedToEmail: string | null
}

export const columns: ColumnDef<FormattedTicket>[] = [
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => {
      return <Link href={row.original.href} className="hover:underline">{row.getValue("title")}</Link>
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      return <Badge variant="outline">{row.getValue("status")}</Badge>
    },
  },
  {
    accessorKey: "priority",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center gap-1 p-0 hover:bg-transparent"
        >
          Priority
          {column.getIsSorted() === "asc" ? (
            <ArrowUp className="h-4 w-4" />
          ) : column.getIsSorted() === "desc" ? (
            <ArrowDown className="h-4 w-4" />
          ) : (
            <ArrowUpDown className="h-4 w-4" />
          )}
        </Button>
      )
    },
  },
  {
    accessorKey: "assignedTo",
    header: "Assigned To",
    enableHiding: true,
    cell: ({ row }) => {
      const assignedToEmail = row.original.assignedToEmail
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span>{row.getValue("assignedTo") || 'Unassigned'}</span>
            </TooltipTrigger>
            <TooltipContent>
              <p>{assignedToEmail || 'No email available'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    },
  },
  {
    accessorKey: "template",
    header: "Template",
    enableHiding: true,
  },
  {
    accessorKey: "createdBy",
    header: "Created By",
    enableHiding: true,
    cell: ({ row }) => {
      const creatorEmail = row.original.creatorEmail
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span>{row.getValue("createdBy")}</span>
            </TooltipTrigger>
            <TooltipContent>
              <p>{creatorEmail || 'No email available'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center gap-1 p-0 hover:bg-transparent"
        >
          Created At
          {column.getIsSorted() === "asc" ? (
            <ArrowUp className="h-4 w-4" />
          ) : column.getIsSorted() === "desc" ? (
            <ArrowDown className="h-4 w-4" />
          ) : (
            <ArrowUpDown className="h-4 w-4" />
          )}
        </Button>
      )
    },
    cell: ({ row }) => {
      const date = new Date(row.original.createdAt)
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span>{formatDistanceToNow(date, { addSuffix: true })}</span>
            </TooltipTrigger>
            <TooltipContent>
              <p>{date.toLocaleString()}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    },
  },
  {
    accessorKey: "updatedAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center gap-1 p-0 hover:bg-transparent"
        >
          Updated At
          {column.getIsSorted() === "asc" ? (
            <ArrowUp className="h-4 w-4" />
          ) : column.getIsSorted() === "desc" ? (
            <ArrowDown className="h-4 w-4" />
          ) : (
            <ArrowUpDown className="h-4 w-4" />
          )}
        </Button>
      )
    },
    cell: ({ row }) => {
      const date = new Date(row.original.updatedAt)
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span>{formatDistanceToNow(date, { addSuffix: true })}</span>
            </TooltipTrigger>
            <TooltipContent>
              <p>{date.toLocaleString()}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    },
  },
  {
    accessorKey: "tags",
    header: "Tags",
    enableHiding: true,
    filterFn: (row, id, value) => {
      const tags = row.getValue(id) as string[]
      return tags.some(tag => 
        tag.toLowerCase().includes((value as string).toLowerCase())
      )
    },
    cell: ({ row }) => {
      const tags = row.getValue("tags") as string[]
      return (
        <div className="flex gap-1">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      )
    },
  }
] 