"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Editor } from '@/components/rich-text/editor';
import { useState } from "react";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
});

type ArticleFormValues = z.infer<typeof formSchema>;

interface ArticleFormProps {
  article?: {
    id: string;
    title: string;
    content: string;
  };
}

function isEditorEmpty(content: string) {
  // Remove HTML tags and whitespace
  const strippedContent = content.replace(/<[^>]*>/g, '').trim();
  return !strippedContent;
}

export function ArticleForm({ article }: ArticleFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();
  const [content, setContent] = useState(article?.content || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ArticleFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: article?.title || "",
    },
  });

  const onSubmit = async (data: ArticleFormValues) => {
    if (isEditorEmpty(content)) {
      toast({
        title: "Error",
        description: "Content is required",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (article) {
        const { error } = await supabase
          .from("articles")
          .update({
            title: data.title,
            content: content,
            updated_at: new Date().toISOString(),
          })
          .eq("id", article.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("articles").insert({
          title: data.title,
          content: content,
        });

        if (error) throw error;
      }

      toast({
        title: article ? "Article updated" : "Article created",
        description: article
          ? "Your article has been updated successfully."
          : "Your article has been created successfully.",
      });

      router.push("/agent/articles");
      router.refresh();
    } catch (error: any) {
      console.error('Error saving article:', error);
      toast({
        title: "Error",
        description: error?.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  const isFormValid = form.watch("title") && !isEditorEmpty(content);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Article title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormItem>
          <FormLabel>Content</FormLabel>
          <Editor
            value={content}
            onChange={setContent}
            placeholder="Write your article content here..."
            className="min-h-[275px]"
          />
        </FormItem>
        <div className="flex gap-4">
          <Button 
            type="submit" 
            disabled={isSubmitting || !isFormValid}
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {article ? "Update Article" : "Create Article"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/agent/articles")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
} 