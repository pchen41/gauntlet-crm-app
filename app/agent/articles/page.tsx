import { createClient } from "@/utils/supabase/server";
import { DataTable } from "../../../components/agent/articles/data-table";
import { columns } from "../../../components/agent/articles/columns";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function ArticlesPage() {
  const supabase = await createClient();

  const { data: articles } = await supabase
    .from("articles")
    .select("id, title, content, created_at, created_by, updated_at")
    .order("created_at", { ascending: false });

  return (
    <div className="container mx-auto py-10 pt-8 space-y-8">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Articles</h2>
          <p className="text-muted-foreground">
            Create and manage knowledge base articles
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Link href="/agent/articles/new">
            <Button>
              <Plus className="h-4 w-4" />
              New Article
            </Button>
          </Link>
        </div>
      </div>
      <DataTable columns={columns} data={articles || []} />
    </div>
  );
}
