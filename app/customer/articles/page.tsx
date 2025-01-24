import { createClient } from "@/utils/supabase/server";
import { DataTable } from "@/components/customer/articles/data-table";
import { columns } from "@/components/customer/articles/columns";

export default async function CustomerArticlesPage() {
  const supabase = await createClient();

  const { data: articles } = await supabase
    .from("articles")
    .select("id, title, content, created_at, created_by, updated_at")
    .order("created_at", { ascending: false });

  return (
    <div className="container mx-auto py-10 pt-8 space-y-4">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Knowledge Base</h2>
          <p className="text-muted-foreground">
            Browse through our help articles
          </p>
        </div>
      </div>
      <DataTable columns={columns} data={articles || []} />
    </div>
  );
}
