import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DailyGoal {
  id: string;
  category: string;
  completed: boolean;
  date: string;
  progress: number;
}

interface MomentumResult {
  score: number;
  level: "seed" | "build" | "rise" | "flow" | "mastery";
  streakDays: number;
  longestStreak: number;
  consistencyScore: number;
  effortScore: number;
  recoveryScore: number;
  balanceScore: number;
  totalGoalsCompleted: number;
  weeklyChange: number;
}

function getLevel(score: number): "seed" | "build" | "rise" | "flow" | "mastery" {
  if (score <= 200) return "seed";
  if (score <= 400) return "build";
  if (score <= 600) return "rise";
  if (score <= 800) return "flow";
  return "mastery";
}

function calculateStreak(goals: DailyGoal[]): { current: number; longest: number } {
  if (goals.length === 0) return { current: 0, longest: 0 };

  // Group goals by date
  const goalsByDate = new Map<string, DailyGoal[]>();
  goals.forEach((goal) => {
    const existing = goalsByDate.get(goal.date) || [];
    existing.push(goal);
    goalsByDate.set(goal.date, existing);
  });

  // Sort dates descending
  const dates = Array.from(goalsByDate.keys()).sort((a, b) => b.localeCompare(a));
  
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  
  const today = new Date().toISOString().split("T")[0];
  let expectedDate = today;

  for (const date of dates) {
    const dayGoals = goalsByDate.get(date) || [];
    const completedAny = dayGoals.some((g) => g.completed);
    
    // Check if this is the expected date in sequence
    if (date === expectedDate && completedAny) {
      tempStreak++;
      if (currentStreak === 0) currentStreak = tempStreak;
    } else if (completedAny) {
      // Gap detected, reset for current but track longest
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 0;
    }

    // Move expected date back by one day
    const d = new Date(expectedDate);
    d.setDate(d.getDate() - 1);
    expectedDate = d.toISOString().split("T")[0];
  }

  longestStreak = Math.max(longestStreak, tempStreak);
  
  return { current: currentStreak, longest: longestStreak };
}

function calculateConsistency(goals: DailyGoal[], days: number = 30): number {
  if (goals.length === 0) return 0;

  // Count unique days with at least one completed goal
  const completedDays = new Set<string>();
  goals.forEach((g) => {
    if (g.completed) completedDays.add(g.date);
  });

  // Calculate percentage of days with completed goals
  const consistencyRatio = completedDays.size / Math.min(days, 30);
  
  // Score from 0-100, with bonus for streaks
  return Math.min(100, Math.round(consistencyRatio * 100));
}

function calculateEffort(goals: DailyGoal[]): number {
  if (goals.length === 0) return 0;

  const totalGoals = goals.length;
  const completedGoals = goals.filter((g) => g.completed).length;
  const avgProgress = goals.reduce((sum, g) => sum + g.progress, 0) / totalGoals;

  // Combine completion rate and average progress
  const completionRate = completedGoals / totalGoals;
  const progressRate = avgProgress / 100;

  // Weight completion more heavily
  const effortScore = completionRate * 0.7 + progressRate * 0.3;
  
  return Math.min(100, Math.round(effortScore * 100));
}

function calculateRecovery(goals: DailyGoal[]): number {
  if (goals.length === 0) return 50; // Neutral for new users

  // Group by date
  const goalsByDate = new Map<string, DailyGoal[]>();
  goals.forEach((goal) => {
    const existing = goalsByDate.get(goal.date) || [];
    existing.push(goal);
    goalsByDate.set(goal.date, existing);
  });

  const dates = Array.from(goalsByDate.keys()).sort((a, b) => a.localeCompare(b));
  
  let recoveries = 0;
  let opportunities = 0;
  let wasMissed = false;

  for (const date of dates) {
    const dayGoals = goalsByDate.get(date) || [];
    const completedAny = dayGoals.some((g) => g.completed);

    if (wasMissed && completedAny) {
      recoveries++;
      opportunities++;
      wasMissed = false;
    } else if (!completedAny) {
      if (!wasMissed) opportunities++;
      wasMissed = true;
    } else {
      wasMissed = false;
    }
  }

  if (opportunities === 0) return 80; // No missed days = good recovery potential
  
  return Math.min(100, Math.round((recoveries / opportunities) * 100 + 20));
}

function calculateBalance(goals: DailyGoal[]): number {
  if (goals.length === 0) return 0;

  // Count goals per category
  const categories = new Map<string, number>();
  goals.forEach((g) => {
    if (g.completed) {
      categories.set(g.category, (categories.get(g.category) || 0) + 1);
    }
  });

  const categoryCount = categories.size;
  if (categoryCount === 0) return 0;
  if (categoryCount === 1) return 40; // Single focus is okay but not balanced

  // Calculate distribution evenness
  const values = Array.from(categories.values());
  const total = values.reduce((a, b) => a + b, 0);
  const avg = total / categoryCount;
  
  // Lower variance = better balance
  const variance = values.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / categoryCount;
  const maxVariance = Math.pow(total, 2);
  const balanceRatio = 1 - Math.sqrt(variance) / Math.sqrt(maxVariance);

  // Bonus for having multiple categories
  const categoryBonus = Math.min(30, categoryCount * 10);
  
  return Math.min(100, Math.round(balanceRatio * 70 + categoryBonus));
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from token
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch goals from last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const startDate = thirtyDaysAgo.toISOString().split("T")[0];

    const { data: goals, error: goalsError } = await supabase
      .from("daily_goals")
      .select("*")
      .eq("user_id", user.id)
      .gte("date", startDate)
      .order("date", { ascending: false });

    if (goalsError) {
      console.error("Goals fetch error:", goalsError);
      return new Response(JSON.stringify({ error: "Failed to fetch goals" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const typedGoals = (goals || []) as DailyGoal[];

    // Calculate all component scores
    const { current: streakDays, longest: longestStreak } = calculateStreak(typedGoals);
    const consistencyScore = calculateConsistency(typedGoals);
    const effortScore = calculateEffort(typedGoals);
    const recoveryScore = calculateRecovery(typedGoals);
    const balanceScore = calculateBalance(typedGoals);

    // Calculate total score (weighted average, 0-1000 scale)
    const totalScore = Math.round(
      (consistencyScore * 0.35 + 
       effortScore * 0.30 + 
       recoveryScore * 0.15 + 
       balanceScore * 0.20) * 10
    );

    // Add streak bonus (up to 100 points)
    const streakBonus = Math.min(100, streakDays * 10);
    const finalScore = Math.min(1000, totalScore + streakBonus);

    const level = getLevel(finalScore);
    const totalGoalsCompleted = typedGoals.filter((g) => g.completed).length;

    // Get week start for storage
    const today = new Date();
    const dayOfWeek = today.getDay();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - dayOfWeek);
    const weekStartStr = weekStart.toISOString().split("T")[0];

    // Fetch previous week's score for comparison
    const prevWeekStart = new Date(weekStart);
    prevWeekStart.setDate(prevWeekStart.getDate() - 7);
    const prevWeekStartStr = prevWeekStart.toISOString().split("T")[0];

    const { data: prevScore } = await supabase
      .from("momentum_scores")
      .select("score")
      .eq("user_id", user.id)
      .eq("week_start", prevWeekStartStr)
      .single();

    const weeklyChange = prevScore ? finalScore - (prevScore.score || 0) : 0;

    // Upsert momentum score
    const { error: upsertError } = await supabase
      .from("momentum_scores")
      .upsert({
        user_id: user.id,
        week_start: weekStartStr,
        score: finalScore,
        level,
        streak_days: streakDays,
        longest_streak: Math.max(longestStreak, streakDays),
        consistency_score: consistencyScore,
        effort_score: effortScore,
        recovery_score: recoveryScore,
        balance_score: balanceScore,
        total_goals_completed: totalGoalsCompleted,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: "user_id,week_start",
      });

    if (upsertError) {
      console.error("Upsert error:", upsertError);
    }

    const result: MomentumResult = {
      score: finalScore,
      level,
      streakDays,
      longestStreak: Math.max(longestStreak, streakDays),
      consistencyScore,
      effortScore,
      recoveryScore,
      balanceScore,
      totalGoalsCompleted,
      weeklyChange,
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
