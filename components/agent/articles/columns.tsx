"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, ArrowUp, ArrowDown, Pencil } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

export type Article = {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
};

export const columns: ColumnDef<Article>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => {
      const isAsc = column.getIsSorted() === "asc";
      const isDesc = column.getIsSorted() === "desc";
      return (
        <Button
          variant="ghost"
          className="-ml-4 h-8 hover:bg-transparent"
          onClick={() => column.toggleSorting(isAsc)}
        >
          Title
          {!isAsc && !isDesc && <ArrowUpDown className="h-4 w-4" />}
          {isAsc && <ArrowUp className="h-4 w-4" />}
          {isDesc && <ArrowDown className="h-4 w-4" />}
        </Button>
      );
    },
    cell: ({ row }) => (
      <Link
        href={`/agent/articles/${row.original.id}`}
        className="hover:underline"
      >
        {row.getValue("title")}
      </Link>
    ),
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => {
      const isAsc = column.getIsSorted() === "asc";
      const isDesc = column.getIsSorted() === "desc";
      return (
        <Button
          variant="ghost"
          className="-ml-4 h-8 hover:bg-transparent"
          onClick={() => column.toggleSorting(isAsc)}
        >
          Created
          {!isAsc && !isDesc && <ArrowUpDown className="h-4 w-4" />}
          {isAsc && <ArrowUp className="h-4 w-4" />}
          {isDesc && <ArrowDown className="h-4 w-4" />}
        </Button>
      );
    },
    cell: ({ row }) => format(new Date(row.getValue("created_at")), "MMM d, yyyy"),
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => {
      return (
        <div className="text-right">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              window.location.href = `/agent/articles/update/${row.original.id}`;
            }}
          >
            <Pencil className="h-3 w-3" />
            Edit
          </Button>
        </div>
      );
    },
  },
]; 