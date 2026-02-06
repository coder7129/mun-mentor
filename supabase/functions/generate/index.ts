import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface GenerationRequest {
  project_id: string;
  mode: string;
  tone?: string;
  length?: number;
  amendment_text?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body: GenerationRequest = await req.json();
    const { project_id, mode, tone, length, amendment_text } = body;

    if (!project_id || !mode) {
      return new Response(
        JSON.stringify({ error: "project_id and mode are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch project data
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("*")
      .eq("id", project_id)
      .single();

    if (projectError || !project) {
      return new Response(
        JSON.stringify({ error: "Project not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch country profile
    const { data: profile } = await supabase
      .from("country_profiles")
      .select("*")
      .eq("project_id", project_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    // Fetch sources (resolutions)
    const { data: sources } = await supabase
      .from("sources")
      .select("*")
      .eq("project_id", project_id);

    const mainResolution = sources?.find((s: { type: string }) => s.type === "main_resolution");
    const coResolution = sources?.find((s: { type: string }) => s.type === "co_resolution");

    // Build context
    const context = buildContext(project, profile, mainResolution, coResolution);
    
    // Build prompt based on mode
    const prompt = buildPrompt(mode, context, { tone, length, amendment_text, profile });

    // Call Lovable AI Gateway
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: getSystemPrompt(mode) },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errorText);
      throw new Error("AI generation failed");
    }

    const aiData = await aiResponse.json();
    const result = aiData.choices?.[0]?.message?.content;

    if (!result) {
      throw new Error("No content in AI response");
    }

    return new Response(
      JSON.stringify({ result }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Generate error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function buildContext(
  project: { committee: string; topic: string; chair_report: string },
  profile: { country: string; profile_json: Record<string, unknown> } | null,
  mainResolution: { text: string } | undefined,
  coResolution: { text: string } | undefined
): string {
  let context = `## Committee: ${project.committee}\n## Topic: ${project.topic}\n\n`;
  context += `## Chair Report:\n${project.chair_report}\n\n`;
  
  if (profile) {
    context += `## Country: ${profile.country}\n`;
    context += `## Country Profile:\n${JSON.stringify(profile.profile_json, null, 2)}\n\n`;
  }
  
  if (mainResolution) {
    context += `## Main-Sponsored Resolution:\n${mainResolution.text}\n\n`;
  }
  
  if (coResolution) {
    context += `## Co-Sponsored Resolution:\n${coResolution.text}\n\n`;
  }
  
  return context;
}

function getSystemPrompt(mode: string): string {
  const basePrompt = `You are an expert Model United Nations (MUN) coach and delegate advisor. 
Your outputs must be grounded in the Chair Report provided - this is the source of truth.

CRITICAL RULES:
1. Every output MUST include an "Anchors from Chair Report" section with 3-5 short quoted snippets (5-20 words each) that your output is based on.
2. If information is not supported by the chair report, clearly label it "Not supported by chair report".
3. Never invent facts or statistics not in the chair report.
4. Be specific, actionable, and ready to speak aloud.`;

  const modePrompts: Record<string, string> = {
    country_profile: `${basePrompt}

Generate a country profile as a JSON object with these exact fields:
- behavior_style: One phrase describing UN diplomatic style (e.g., "sovereignty-focused", "legalist", "interventionist")
- priorities: Array of exactly 3 key priorities for this country on this topic
- red_lines: Array of exactly 3 things this country would never accept
- allies: Countries likely to align with this delegation (or "Unknown if not in chair report")
- opponents: Countries likely to oppose (or "Unknown if not in chair report")
- stance_summary: 2-3 sentences summarizing the country's position
- anchors: Array of 3-5 short quoted snippets from the chair report

Return ONLY valid JSON, no markdown.`,

    opening_speech: `${basePrompt}

Generate an opening speech that:
- Opens with a strong hook
- States the delegation's position clearly
- Provides 2-3 key arguments with chair report backing
- Ends with a call to action
- Is timed to the requested length
- Matches the requested tone

Format with clear paragraph breaks and include timing markers.`,

    yield_for: `${basePrompt}

Generate content to SUPPORT the topic/position:
1. 5 rapid-fire supporting points (one-liners ready to speak)
2. 2 "trap questions" - questions that lead opponents into weak positions
3. 6 Points of Information to ask opposing delegates

Format each section clearly.`,

    yield_against: `${basePrompt}

Generate content to OPPOSE the topic/position:
1. 5 rapid-fire opposing points (one-liners ready to speak)
2. 2 "trap questions" - questions that expose weaknesses in supporting arguments
3. 6 Points of Information to challenge proponents

Format each section clearly.`,

    pois: `${basePrompt}

Generate 12 Points of Information:

OFFENSIVE POIs (6): Questions to challenge opponents and expose weaknesses
DEFENSIVE POIs (6): Questions that allow your delegation to reinforce its position

Each POI should be a single, sharp question ready to ask. Format clearly.`,

    explain_topic: `${basePrompt}

Provide a comprehensive topic breakdown:

1. KEY DEFINITIONS: Define 3-5 critical terms
2. CORE DEBATE: What is the fundamental disagreement?
3. MAIN ARGUMENTS FOR: 3-4 key arguments with brief explanations
4. MAIN ARGUMENTS AGAINST: 3-4 key arguments with brief explanations
5. COMMON MISCONCEPTIONS: 2-3 things delegates often get wrong
6. BLOCS/ALIGNMENTS: Expected voting blocs if mentioned in chair report

Format with clear headers.`,

    amend_recommend: `${basePrompt}

Based on the resolution text provided, recommend 3-6 amendments:

For each amendment:
1. CLAUSE TO MODIFY: Identify which clause
2. PROPOSED CHANGE: Specific language to add/remove/modify
3. REASONING: Why this improves the resolution
4. ANCHOR: Quote from chair report supporting this change

Focus on substantive improvements aligned with the country's profile.`,

    amend_for: `${basePrompt}

Generate a speech SUPPORTING the amendment:
- Strong opening statement
- 2-3 reasons why this amendment improves the resolution
- Reference to chair report evidence
- Call to vote in favor

Keep it concise (45-60 seconds speaking time).`,

    amend_against: `${basePrompt}

Generate a speech OPPOSING the amendment:
- Strong opening statement
- 2-3 reasons why this amendment weakens the resolution
- Reference to chair report evidence
- Call to vote against

Keep it concise (45-60 seconds speaking time).`,
  };

  return modePrompts[mode] || basePrompt;
}

function buildPrompt(
  mode: string,
  context: string,
  options: { tone?: string; length?: number; amendment_text?: string; profile?: { country: string } | null }
): string {
  let prompt = context;
  
  if (mode === "country_profile" && options.profile) {
    prompt += `\nGenerate a comprehensive country profile for ${options.profile.country} based on the Chair Report above.`;
  } else if (mode === "opening_speech") {
    prompt += `\nGenerate a ${options.length || 90}-second opening speech with a ${options.tone || "calm"} tone.`;
  } else if (mode === "yield_for") {
    prompt += `\nGenerate yield content to SUPPORT the resolution/topic from this delegation's perspective.`;
  } else if (mode === "yield_against") {
    prompt += `\nGenerate yield content to OPPOSE the resolution/topic from this delegation's perspective.`;
  } else if (mode === "pois") {
    prompt += `\nGenerate 12 Points of Information (6 offensive, 6 defensive) for this delegation.`;
  } else if (mode === "explain_topic") {
    prompt += `\nExplain this topic comprehensively for a delegate preparing for debate.`;
  } else if (mode === "amend_recommend") {
    prompt += `\nBased on the resolution text, recommend amendments aligned with this delegation's position.`;
    if (options.amendment_text) {
      prompt += `\n\nResolution to amend:\n${options.amendment_text}`;
    }
  } else if (mode === "amend_for") {
    prompt += `\nGenerate a speech supporting the proposed amendment.`;
    if (options.amendment_text) {
      prompt += `\n\nAmendment context:\n${options.amendment_text}`;
    }
  } else if (mode === "amend_against") {
    prompt += `\nGenerate a speech opposing the proposed amendment.`;
    if (options.amendment_text) {
      prompt += `\n\nAmendment context:\n${options.amendment_text}`;
    }
  }
  
  return prompt;
}
