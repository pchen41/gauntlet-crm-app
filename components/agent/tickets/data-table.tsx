"use client"

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
  getFilteredRowModel,
  ColumnFiltersState,
  VisibilityState,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { FormattedTicket } from "./columns"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Settings2, ArrowUpDown, ChevronDown, Search, ListFilter, AlertCircle, User, FileText, Tags, X } from "lucide-react"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  currentUser: {
    id: string
    name: string
    email: string
  }
}

export function DataTable<TData, TValue>({
  columns,
  data,
  currentUser,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const router = useRouter()

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  const getActiveFilters = () => {
    const filters = table.getState().columnFilters.map(filter => ({
      id: filter.id,
      value: filter.value as string,
      type: 'filter'
    }))

    const sorting = table.getState().sorting.map(sort => ({
      id: sort.id,
      value: sort.desc ? 'Desc' : 'Asc',
      type: 'sort'
    }))

    return [...filters, ...sorting]
  }

  const handleViewSelect = (view: string) => {
    table.resetColumnFilters()
    
    switch (view) {
      case 'assigned':
        table.getColumn('assignedTo')?.setFilterValue(currentUser.name)
        break
      case 'created':
        table.getColumn('createdBy')?.setFilterValue(currentUser.name)
        break
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="justify-start">
                <Search className="h-4 w-4" />
                Title
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0" align="start">
              <Command>
                <CommandInput
                  placeholder="Search title..."
                  value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
                  onValueChange={(value) =>
                    table.getColumn("title")?.setFilterValue(value)
                  }
                />
              </Command>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="justify-start">
                <ListFilter className="h-4 w-4" />
                Status
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0" align="start">
              <Command>
                <CommandInput
                  placeholder="Filter status..."
                  value={(table.getColumn("status")?.getFilterValue() as string) ?? ""}
                  onValueChange={(value) =>
                    table.getColumn("status")?.setFilterValue(value)
                  }
                />
              </Command>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="justify-start">
                <AlertCircle className="h-4 w-4" />
                Priority
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0" align="start">
              <Command>
                <CommandInput
                  placeholder="Filter priority..."
                  value={(table.getColumn("priority")?.getFilterValue() as string) ?? ""}
                  onValueChange={(value) =>
                    table.getColumn("priority")?.setFilterValue(value)
                  }
                />
              </Command>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="justify-start">
                <User className="h-4 w-4" />
                Assigned To
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0" align="start">
              <Command>
                <CommandInput
                  placeholder="Filter assigned to..."
                  value={(table.getColumn("assignedTo")?.getFilterValue() as string) ?? ""}
                  onValueChange={(value) =>
                    table.getColumn("assignedTo")?.setFilterValue(value)
                  }
                />
              </Command>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="justify-start">
                <User className="h-4 w-4" />
                Created By
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0" align="start">
              <Command>
                <CommandInput
                  placeholder="Filter created by..."
                  value={(table.getColumn("createdBy")?.getFilterValue() as string) ?? ""}
                  onValueChange={(value) =>
                    table.getColumn("createdBy")?.setFilterValue(value)
                  }
                />
              </Command>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="justify-start">
                <FileText className="h-4 w-4" />
                Template
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0" align="start">
              <Command>
                <CommandInput
                  placeholder="Filter template..."
                  value={(table.getColumn("template")?.getFilterValue() as string) ?? ""}
                  onValueChange={(value) =>
                    table.getColumn("template")?.setFilterValue(value)
                  }
                />
              </Command>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="justify-start">
                <Tags className="h-4 w-4" />
                Tags
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0" align="start">
              <Command>
                <CommandInput
                  placeholder="Filter tags..."
                  value={(table.getColumn("tags")?.getFilterValue() as string) ?? ""}
                  onValueChange={(value) =>
                    table.getColumn("tags")?.setFilterValue(value)
                  }
                />
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Views
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleViewSelect('assigned')}>
                Assigned to me
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleViewSelect('created')}>
                Created by me
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Columns
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id.replace(/([A-Z])/g, ' $1').trim()}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {getActiveFilters().length > 0 && (
        <div className="flex flex-wrap gap-2">
          {getActiveFilters().map(filter => (
            <Badge
              key={`${filter.type}-${filter.id}`}
              variant="secondary"
              className="flex items-center gap-1"
            >
              {filter.type === 'sort' ? (
                <>
                  Sort by {filter.id.charAt(0).toUpperCase() + filter.id.slice(1).replace(/([A-Z])/g, ' $1')}: {filter.value}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => table.getColumn(filter.id)?.clearSorting()}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </>
              ) : (
                <>
                  {filter.id.charAt(0).toUpperCase() + filter.id.slice(1).replace(/([A-Z])/g, ' $1')}: {filter.value}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => table.getColumn(filter.id)?.setFilterValue("")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </>
              )}
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            className="h-6"
            onClick={() => {
              table.resetColumnFilters()
            }}
          >
            Reset filters
          </Button>
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => {
                    const ticket = row.original as FormattedTicket;
                    if (ticket.id) {
                      window.location.href = `/agent/tickets/${ticket.id}`;
                    }
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
} 