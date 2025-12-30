import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GoalBreakdown {
  quarterly: {
    Q1: { focus: string; milestones: string[] };
    Q2: { focus: string; milestones: string[] };
    Q3: { focus: string; milestones: string[] };
    Q4: { focus: string; milestones: string[] };
  };
  monthly: {
    [quarter: string]: {
      [month: string]: { focus: string; milestones: string[] };
    };
  };
  weekly: {
    [quarter: string]: {
      [month: string]: {
        [week: string]: { focus: string; actions: string[] };
      };
    };
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { goalTitle, goalDescription, breakdownType } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (!goalTitle) {
      return new Response(JSON.stringify({ error: "Goal title is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Breaking down goal: ${goalTitle}`);

    // Determine what breakdown to generate
    const needsQuarterly = breakdownType === 'quarterly' || breakdownType === 'all';
    const needsMonthly = breakdownType === 'monthly' || breakdownType === 'all';
    const needsWeekly = breakdownType === 'weekly' || breakdownType === 'all';

    let systemPrompt = `You are an expert goal-setting coach. Your task is to break down high-level annual goals into actionable quarterly, monthly, and weekly plans.

Given an annual goal, provide a strategic breakdown that:
1. Divides the goal into 4 quarters (Q1-Q4) with clear focus areas and milestones
2. Breaks each quarter into 3 months with specific monthly focuses and milestones
3. Provides weekly action plans for each month with actionable steps

Respond ONLY with a valid JSON object in this exact format:
{
  "quarterly": {
    "Q1": { "focus": "string describing Q1 focus", "milestones": ["milestone 1", "milestone 2", "milestone 3"] },
    "Q2": { "focus": "string describing Q2 focus", "milestones": ["milestone 1", "milestone 2", "milestone 3"] },
    "Q3": { "focus": "string describing Q3 focus", "milestones": ["milestone 1", "milestone 2", "milestone 3"] },
    "Q4": { "focus": "string describing Q4 focus", "milestones": ["milestone 1", "milestone 2", "milestone 3"] }
  },
  "monthly": {
    "Q1": {
      "January": { "focus": "string", "milestones": ["milestone 1", "milestone 2"] },
      "February": { "focus": "string", "milestones": ["milestone 1", "milestone 2"] },
      "March": { "focus": "string", "milestones": ["milestone 1", "milestone 2"] }
    },
    "Q2": {
      "April": { "focus": "string", "milestones": ["milestone 1", "milestone 2"] },
      "May": { "focus": "string", "milestones": ["milestone 1", "milestone 2"] },
      "June": { "focus": "string", "milestones": ["milestone 1", "milestone 2"] }
    },
    "Q3": {
      "July": { "focus": "string", "milestones": ["milestone 1", "milestone 2"] },
      "August": { "focus": "string", "milestones": ["milestone 1", "milestone 2"] },
      "September": { "focus": "string", "milestones": ["milestone 1", "milestone 2"] }
    },
    "Q4": {
      "October": { "focus": "string", "milestones": ["milestone 1", "milestone 2"] },
      "November": { "focus": "string", "milestones": ["milestone 1", "milestone 2"] },
      "December": { "focus": "string", "milestones": ["milestone 1", "milestone 2"] }
    }
  },
  "weekly": {
    "Q1": {
      "January": {
        "Week 1": { "focus": "string", "actions": ["action 1", "action 2", "action 3"] },
        "Week 2": { "focus": "string", "actions": ["action 1", "action 2", "action 3"] },
        "Week 3": { "focus": "string", "actions": ["action 1", "action 2", "action 3"] },
        "Week 4": { "focus": "string", "actions": ["action 1", "action 2", "action 3"] }
      }
    }
  }
}

Make the breakdown realistic, actionable, and progressive. Each level should build on the previous one.`;

    const userPrompt = `Break down this annual goal into quarterly, monthly, and weekly plans:
Goal: ${goalTitle}
${goalDescription ? `Description: ${goalDescription}` : ''}

Provide a comprehensive breakdown that helps the user achieve this goal throughout the year.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: userPrompt
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    console.log("AI response:", content);

    // Parse the JSON response
    let breakdown: GoalBreakdown;
    try {
      // Extract JSON from the response (it might have markdown code blocks)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        breakdown = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      // Return a basic fallback structure
      breakdown = {
        quarterly: {
          Q1: { focus: "Foundation phase - Set up and plan", milestones: ["Establish baseline", "Create plan", "Set up systems"] },
          Q2: { focus: "Build phase - Make progress", milestones: ["Complete first milestone", "Build momentum", "Overcome challenges"] },
          Q3: { focus: "Accelerate phase - Push forward", milestones: ["Achieve major progress", "Scale efforts", "Refine approach"] },
          Q4: { focus: "Complete phase - Finish strong", milestones: ["Reach targets", "Review progress", "Plan ahead"] }
        },
        monthly: {},
        weekly: {}
      };
    }

    // Filter based on breakdownType
    const result: Partial<GoalBreakdown> = {};
    if (needsQuarterly) result.quarterly = breakdown.quarterly;
    if (needsMonthly) result.monthly = breakdown.monthly;
    if (needsWeekly) result.weekly = breakdown.weekly;

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in breakdown-goal function:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

