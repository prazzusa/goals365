import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { exerciseName } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`Classifying exercise: ${exerciseName}`);

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
            content: `You are a fitness expert that classifies exercises. Given an exercise name, classify it into one of these categories:
- "strength" - Weight training, resistance exercises (e.g., Bicep Curl, Bench Press, Squats with weights, Deadlift, Push-ups, Pull-ups)
- "cardio" - Aerobic exercises (e.g., Running, Cycling, Swimming, Jump Rope, HIIT)
- "flexibility" - Stretching and flexibility (e.g., Yoga, Pilates, Stretching)

Respond ONLY with a valid JSON object in this exact format:
{"type": "strength" | "cardio" | "flexibility", "requiresSets": boolean, "requiresReps": boolean, "requiresDuration": boolean, "suggestedCaloriesPerMinute": number}

For strength exercises: requiresSets=true, requiresReps=true, requiresDuration=false
For cardio exercises: requiresSets=false, requiresReps=false, requiresDuration=true
For flexibility exercises: requiresSets=false, requiresReps=false, requiresDuration=true`
          },
          {
            role: "user",
            content: `Classify this exercise: "${exerciseName}"`
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
    let classification;
    try {
      // Extract JSON from the response (it might have markdown code blocks)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        classification = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      // Default fallback
      classification = {
        type: "cardio",
        requiresSets: false,
        requiresReps: false,
        requiresDuration: true,
        suggestedCaloriesPerMinute: 5
      };
    }

    return new Response(JSON.stringify(classification), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in classify-exercise function:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
