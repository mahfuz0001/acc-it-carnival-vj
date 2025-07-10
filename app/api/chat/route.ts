import { type NextRequest, NextResponse } from "next/server";
import { generateChatResponse } from "@/lib/ai/gemini-client";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

// System prompt with event information
const SYSTEM_PROMPT = `
You are an AI assistant for the IT Carnival event. Your name is CarnivalBot.
The IT Carnival is a tech event featuring competitions, workshops, and networking opportunities.

Here are some key details about the event:
- Date: June 15-17, 2023
- Location: Tech Convention Center, Downtown
- Main events: Hackathon, CTF Competition, Tech Talks, Workshops
- Registration is required for all events
- Teams can have up to 4 members for competitions
- Prizes include cash rewards, tech gadgets, and internship opportunities

Be helpful, friendly, and informative. If you don't know something specific about the event, 
acknowledge that and offer to help with general information or suggest where they might find more details.
`;

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Invalid request format" },
        { status: 400 }
      );
    }

    // Get user session for personalization
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // Enhance system prompt with user-specific information if available
    let enhancedPrompt = SYSTEM_PROMPT;

    if (session?.user) {
      // Get user's registered events
      const { data: registrations } = await supabase
        .from("registrations")
        .select("events(name, start_date, end_date, location)")
        .eq("user_id", session.user.id);

      if (registrations && registrations.length > 0) {
        enhancedPrompt += `\n\nThe user is registered for the following events:\n`;
        registrations.forEach((reg) => {
          if (
            reg.events &&
            Array.isArray(reg.events) &&
            reg.events.length > 0
          ) {
            enhancedPrompt += `- ${reg.events[0].name} (${new Date(reg.events[0].start_date).toLocaleDateString()})\n`;
          }
        });
      }

      // Get user's teams
      const { data: teams } = await supabase
        .from("team_members")
        .select("teams(name, events(name))")
        .eq("user_id", session.user.id);

      if (teams && teams.length > 0) {
        enhancedPrompt += `\n\nThe user is a member of the following teams:\n`;
        teams.forEach((team) => {
          if (team.teams) {
            enhancedPrompt += `- Team "${team.teams[0].name}" for event "${team.teams[0].events[0].name || "Unknown"}"\n`;
          }
        });
      }
    }

    // Generate response using Gemini
    const { response, error } = await generateChatResponse(
      messages,
      enhancedPrompt
    );

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ response });
  } catch (error) {
    console.error("Error in chat API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
