import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { ArticleForm } from "@/components/agent/articles/article-form";
import { DeleteArticleButton } from "@/components/agent/articles/delete-article-button";

export default async function ArticlePage({
  params: { id },
}: {
  params: { id: string };
}) {
  const supabase = await createClient();

  const { data: article } = await supabase
    .from("articles")
    .select("*")
    .eq("id", id)
    .single();

  if (!article) {
    notFound();
  }

  return (
    <div className="container mx-auto py-10 pt-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Edit Article</h2>
          <p className="text-muted-foreground">
            Make changes to this article
          </p>
        </div>
        <DeleteArticleButton articleId={article.id} />
      </div>
      <ArticleForm article={article} />
    </div>
  );
}
