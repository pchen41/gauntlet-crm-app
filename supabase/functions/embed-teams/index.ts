// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'jsr:@supabase/supabase-js@2'
import OpenAI from 'jsr:@openai/openai'

Deno.serve(async (req) => {
  const payload = await req.json()
  
  const name = payload.record.name;
  const description = payload.record.description;
  const text = `${name} - ${description}`
  const metadata = {
    groupId: payload.record.id,
  }

  const authHeader = req.headers.get('Authorization')!
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: authHeader } } }
  );

  const openAIClient = new OpenAI({
    apiKey: Deno.env.get("OPENAI_API_KEY"),
  });

  const embeddingResponse = await openAIClient.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  })

  const embedding = embeddingResponse.data[0].embedding;

  const { data, error } =await supabaseClient.from('teams_rag').insert({
    content: text,
    embedding: embedding,
    metadata: metadata,
  })


  if (error) {
    return new Response(error.message, { status: 500 })
  }
  return new Response();
})
