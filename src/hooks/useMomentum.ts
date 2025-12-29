import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface MomentumData {
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

const DEFAULT_MOMENTUM: MomentumData = {
  score: 0,
  level: "seed",
  streakDays: 0,
  longestStreak: 0,
  consistencyScore: 0,
  effortScore: 0,
  recoveryScore: 0,
  balanceScore: 0,
  totalGoalsCompleted: 0,
  weeklyChange: 0,
};

export const useMomentum = () => {
  const { user, session } = useAuth();
  const [momentum, setMomentum] = useState<MomentumData>(DEFAULT_MOMENTUM);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMomentum = useCallback(async () => {
    if (!user || !session) {
      setMomentum(DEFAULT_MOMENTUM);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/calculate-momentum`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to calculate momentum");
      }

      const data = await response.json();
      
      setMomentum({
        score: data.score || 0,
        level: data.level || "seed",
        streakDays: data.streakDays || 0,
        longestStreak: data.longestStreak || 0,
        consistencyScore: data.consistencyScore || 0,
        effortScore: data.effortScore || 0,
        recoveryScore: data.recoveryScore || 0,
        balanceScore: data.balanceScore || 0,
        totalGoalsCompleted: data.totalGoalsCompleted || 0,
        weeklyChange: data.weeklyChange || 0,
      });
    } catch (err) {
      console.error("Error fetching momentum:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
      
      // Try to load cached data from database
      try {
        const today = new Date();
        const dayOfWeek = today.getDay();
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - dayOfWeek);
        const weekStartStr = weekStart.toISOString().split("T")[0];

        const { data: cached } = await supabase
          .from("momentum_scores")
          .select("*")
          .eq("user_id", user.id)
          .eq("week_start", weekStartStr)
          .single();

        if (cached) {
          setMomentum({
            score: cached.score || 0,
            level: (cached.level as MomentumData["level"]) || "seed",
            streakDays: cached.streak_days || 0,
            longestStreak: cached.longest_streak || 0,
            consistencyScore: cached.consistency_score || 0,
            effortScore: cached.effort_score || 0,
            recoveryScore: cached.recovery_score || 0,
            balanceScore: cached.balance_score || 0,
            totalGoalsCompleted: cached.total_goals_completed || 0,
            weeklyChange: 0,
          });
        }
      } catch {
        // Use default if cache also fails
      }
    } finally {
      setLoading(false);
    }
  }, [user, session]);

  useEffect(() => {
    fetchMomentum();
  }, [fetchMomentum]);

  return {
    momentum,
    loading,
    error,
    refresh: fetchMomentum,
  };
};
