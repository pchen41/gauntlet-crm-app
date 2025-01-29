import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { tool } from "@langchain/core/tools";
import { OpenAIEmbeddings, ChatOpenAI } from "@langchain/openai";
import { createClient } from '@supabase/supabase-js'
import { z } from "zod";
export const dynamic = 'force-dynamic'; // static by default, unless reading the request
export const maxDuration = 60;

// test locally with 'curl -i -X POST -H 'Content-Type: application/json' -H 'Authorization: Bearer YOUR_TOKEN' -d '{"record":{"id": "ticket_id"}}' localhost:3000/api/assign-ticket'
export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const ticketId = payload.record.id
    const authHeader = request.headers.get('Authorization')!
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: ticket, error: ticketError } = await supabase
    .from('tickets')
    .select('title, description, fields')
    .eq('id', ticketId)
    .single();

    if (ticketError || !ticket) {
      console.error("Error fetching ticket details:", ticketError);
      throw new Error('Failed to fetch ticket details');
    }

    const title = ticket.title
    const description = ticket.description

    const updateTicket = tool(
      async ({ ticketId, teamId, priority }) => {
        // Find the field IDs for "Assigned To" and "Priority"
        const assignedToField = ticket.fields.find((f: any) => f.name === 'Assigned To');
        const priorityField = ticket.fields.find((f: any) => f.name === 'Priority');

        if (!assignedToField || !priorityField) {
          throw new Error('Required fields not found in ticket');
        }
        
        // Get team members and team name
        const { data: team, error: teamError } = await supabase
          .from('teams')
          .select(`
            name,
            team_members (
              agent_id
            )
          `)
          .eq('id', teamId)
          .single();

        if (teamError || !team?.team_members?.length) {
          throw new Error('Failed to fetch team details or team has no members');
        }

        // Select random team member
        const randomIndex = Math.floor(Math.random() * team.team_members.length);
        const selectedAgentId = team.team_members[randomIndex].agent_id;

        // Get agent name for return value
        const { data: agentData, error: agentError } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', selectedAgentId)
          .single();

        if (agentError) {
          throw new Error('Failed to fetch agent details');
        }

        // Update ticket using the Postgres function
        const { error: updateError } = await supabase.rpc('update_ticket', {
          ticket_id: ticketId,
          field_updates: [
            {
              id: assignedToField.id,
              value: selectedAgentId
            },
            {
              id: priorityField.id,
              value: priority.toString()
            }
          ],
          updater_id: 'f5e3135c-ff50-4daa-987d-5183c4a36507', // TriageBot user id
          comment: `Automatically assigned to ${agentData.name} from team ${team.name} with priority ${priority} based on ticket content`,
          internal: true
        });

        if (updateError) {
          console.log("updateError")
          console.log(updateError)
          throw new Error('Failed to update ticket: ' + updateError.message);
        }
        return `Ticket ${ticketId} assigned to ${agentData.name} from team ${team.name} with priority ${priority}`
      },
      {
        name: "updateTicket",
        description: "Update ticket with the given team and priority",
        schema: z.object({
          ticketId: z.string(),
          teamId: z.string(), 
          priority: z.number(),
        }),
      }
    );

    const llm = new ChatOpenAI({
      apiKey:  process.env.OPENAI_API_KEY,
      model: "gpt-4o",
      temperature: 0.1
    });

    const vectorStore = new SupabaseVectorStore(
      new OpenAIEmbeddings({ apiKey: process.env.getOPENAI_API_KEY}), 
      { 
        client: supabase, 
        tableName: "teams_rag",
        queryName: "match_teams"
      });

    const text = `${title} - ${description}`
    const teams = await vectorStore.similaritySearch(text, 8)
    const teamsContent = teams.map((team) => `${team.pageContent} (id: ${team.metadata.groupId})`).join("\n");

    const modelWithTools = llm.bindTools([updateTicket])
    const response = await modelWithTools.invoke(`
      You are a support agent for a company. You are given a ticket with and id, title, description:
      Ticket id: ${ticketId}
      Title: ${title}
      Description: ${description}

      Here are potential teams that can handle the ticket:
      ${teamsContent}

      Based on the ticket content, please come up with a priority between 0 and 3, inclusive (lower is higher priority) and select the most relevant team to handle it.
      Update the ticket with this information.
      Keep your response concise and to the point.
    `)
    
    if(response.tool_calls && response.tool_calls.length > 0) {
      const toolCall = response.tool_calls[0] as any
      const toolOutput = await updateTicket.invoke(toolCall.args);
    }
  } catch (error: any) {
    console.error("Error:", error);
    return new Response(error.message, { status: 500 });
  }
  return new Response()
}
  