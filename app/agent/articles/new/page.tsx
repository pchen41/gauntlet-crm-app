import { ArticleForm } from "@/components/agent/articles/article-form";

export default function NewArticlePage() {
  return (
    <div className="container mx-auto py-10 pt-8 space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">New Article</h2>
        <p className="text-muted-foreground">
          Create a new knowledge base article
        </p>
      </div>
      <ArticleForm />
    </div>
  );
}
