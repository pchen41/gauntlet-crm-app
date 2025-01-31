'use server'

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";

export async function processChatMessage(ticketId: string, message: string) {
  console.log("processChatMessage")
  console.log(ticketId)
  console.log(message)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  // Fetch all agents
  const { data: agents, error: agentsError } = await supabase
    .from('profiles')
    .select('id, name, email')
    .contains('roles', ['agent'])

  if (agentsError) {
    console.error('Error fetching agents:', agentsError)
    throw new Error('Failed to fetch agents')
  }

  const { data: ticket, error: ticketError } = await supabase
    .from('tickets')
    .select(`
      id,
      title,
      description,
      fields,
      tags,
      ticket_templates (
        id,
        name,
        template_fields (
          id,
          name,
          type,
          choices
        )
      ),
      ticket_updates (
        id,
        comment,
        updates,
        internal,
        created_at,
        created_by (
          id,
          email,
          name
        )
      )
    `)
    .eq('id', ticketId)
    .single()

  console.log("ticket")
  console.log(ticket)

  if (ticketError || !ticket) {
    console.log("ticketError")
    console.log(ticketError)
    throw new Error('Failed to fetch ticket details')
  }

  // Merge template field information with current field values
  const fieldsWithMetadata = ticket.fields.map((field: any) => {
    const templateField = (ticket.ticket_templates as any).template_fields.find(
      (tf: any) => tf.id === field.id
    )
    return {
      ...field,
      type: templateField?.type,
      choices: templateField?.choices
    }
  })

  const updateTicket = tool(
    async ({ ticketId, fields, comment, internal, tags }) => {
      console.log("updateTicket")
      console.log(ticketId)
      console.log(fields)
      console.log(comment)
      console.log(internal)
      console.log(tags)

      try {    
        // Format the updates for the RPC call
        const fieldUpdates = fields.map((update: any) => ({
          id: update.id,
          value: update.newValue
        }))
    
        // Call the update_ticket RPC function
        const { error } = await supabase.rpc('update_ticket', {
          ticket_id: ticketId,
          field_updates: fieldUpdates,
          updater_id: user.id,
          comment: comment || null,
          internal: internal ?? true,
          new_tags: tags
        })
    
        if (error) {
          console.error('Error updating ticket fields:', error)
          throw error
        }
    
        // Revalidate the ticket page
        // revalidatePath(`/agent/tickets/${ticketId}`)
    
        return { success: true }
      } catch (error) {
        console.error('Error updating ticket fields:', error)
        return { success: false, error }
      }
    },
    {
      name: "updateTicket",
      description: "Update ticket with the given fields and tags.",
      schema: z.object({
        ticketId: z.string(),
        fields: z.array(z.object({
          id: z.string(),
          newValue: z.string()
        })),
        comment: z.string().optional(),
        internal: z.boolean(),
        tags: z.array(z.string()).optional()
      }),
    }
  );

  const llm = new ChatOpenAI({
    apiKey:  process.env.OPENAI_API_KEY,
    model: "gpt-4o",
    temperature: 0.1
  });

  const modelWithTools = llm.bindTools([updateTicket])
  const response = await modelWithTools.invoke(`
    You are an assistant for a support agent at a company.
    Your job is to answer questions about the ticket and make updates to it as requested. If the agent asks for multiple updates, please make all the updates in one call.
    By default, all updates should be internal unless otherwise specified. Do not leave a comment unless otherwise specified.
    You are given a ticket with and id, title, description, and tags:

    Ticket id: ${ticket.id}
    Title: ${ticket.title}
    Description: ${ticket.description}
    Tags: ${ticket.tags ? ticket.tags.join(', ') : ''}

    The ticket has the following fields:
    ${fieldsWithMetadata.map((field: any) => {
      const fieldInfo = [
        `${field.name} (field id: ${field.id})`,
        `Current value: ${Array.isArray(field.value) ? field.value.join(', ') : field.value}`,
        `Type: ${field.type || 'text'}`,
        field.choices ? `Allowed values: ${field.choices.join(', ')}` : ''
      ].filter(Boolean).join('\n    ')
      return fieldInfo
    }).join('\n\n    ')}

    Available agents:
    ${agents.map(agent => `- ${agent.name || agent.email} (id: ${agent.id})`).join('\n    ')}
    When updating a field with an agent type, use the agent's id.

    Ticket update history:
    ${ticket.ticket_updates
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .map(update => `
        Time: ${new Date(update.created_at).toLocaleString()}
        By: ${(update.created_by as any).name || (update.created_by as any).email}
        ${update.comment ? `Comment: ${update.comment}` : ''}
        ${update.updates ? `Updates: ${JSON.stringify(update.updates, null, 2)}` : ''}
        Internal: ${update.internal}
      `).join("\n")}

    You are chatting directly with the support agent and they have sent you the following message:
    ${message}

    Please respond to the agent's message concisely and to the point.
  `)
  
  console.log("response")
  console.log(response)
  
  if(response.tool_calls && response.tool_calls.length > 0) {
    const toolCall = response.tool_calls[0] as any
    const toolOutput = await updateTicket.invoke(toolCall.args);
    console.log("toolOutput")
    console.log(toolOutput)
  }

  return response.content
}