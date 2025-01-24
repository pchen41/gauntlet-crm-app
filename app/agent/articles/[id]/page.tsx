import { notFound } from "next/navigation"
import { format } from "date-fns"
import { createClient } from "@/utils/supabase/server"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { ReadOnlyContent } from "@/components/articles/read-only-content"

async function getArticle(id: string) {
  const supabase = await createClient()
  
  const { data: article, error } = await supabase
    .from("articles")
    .select(`
      *,
      created_by_profile:profiles!articles_created_by_fkey(name),
      updated_by_profile:profiles!articles_updated_by_fkey(name)
    `)
    .eq("id", id)
    .single()

  if (error || !article) {
    return null
  }

  return article
}

export default async function ArticlePage({
  params,
}: {
  params: { id: string }
}) {
  const article = await getArticle(params.id)

  if (!article) {
    notFound()
  }

  return (
    <div className="container mx-auto py-10 pt-8 space-y-8">
      <div className="mb-8">
        <div className="flex items-center gap-2">
          <Link href="/agent/articles">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">View Article</h1>
        </div>
      </div>

      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-col space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              {article.title}
            </h1>
            <div className="flex items-center space-x-1.5 text-sm text-muted-foreground">
              <span>Written by {article.created_by_profile?.name} on {format(new Date(article.created_at), "MMMM d, yyyy")}</span>
              {article.updated_at !== article.created_at && (
                <>
                  <span>•</span>
                  <span className="italic">
                    Updated by {article.updated_by_profile?.name} on{" "}
                    {format(new Date(article.updated_at), "MMMM d, yyyy")}
                  </span>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ReadOnlyContent content={article.content} />
        </CardContent>
      </Card>
    </div>
  )
} 