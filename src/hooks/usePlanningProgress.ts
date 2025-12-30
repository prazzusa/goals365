import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type PlanningPhase = "quarterly" | "monthly" | "weekly" | "completed";

export interface PlanningProgress {
  id: string;
  user_id: string;
  current_phase: PlanningPhase;
  quarterly_step: number;
  monthly_step: number;
  weekly_step: number;
  quarterly_vision: string | null;
  selected_categories: string[];
  completed_at: string | null;
}

export const usePlanningProgress = () => {
  const { user } = useAuth();
  const [progress, setProgress] = useState<PlanningProgress | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProgress = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("planning_progress")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Error fetching planning progress:", error);
    } else {
      setProgress(data as PlanningProgress | null);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  const initializeProgress = async () => {
    if (!user) return null;

    const { data, error } = await supabase
      .from("planning_progress")
      .insert({
        user_id: user.id,
        current_phase: "quarterly",
        quarterly_step: 0,
      })
      .select()
      .single();

    if (error) {
      console.error("Error initializing progress:", error);
      return null;
    }

    setProgress(data as PlanningProgress);
    return data;
  };

  const updateProgress = async (updates: Partial<Omit<PlanningProgress, "id" | "user_id">>) => {
    if (!user || !progress) return;

    const { error } = await supabase
      .from("planning_progress")
      .update(updates)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error updating progress:", error);
      return;
    }

    setProgress((prev) => prev ? { ...prev, ...updates } : null);
  };

  const updateQuarterlyStep = async (step: number, additionalData?: { vision?: string; categories?: string[] }) => {
    const updates: Record<string, unknown> = { quarterly_step: step };
    if (additionalData?.vision !== undefined) updates.quarterly_vision = additionalData.vision;
    if (additionalData?.categories !== undefined) updates.selected_categories = additionalData.categories;
    await updateProgress(updates);
  };

  const moveToMonthly = async () => {
    await updateProgress({ current_phase: "monthly", monthly_step: 0 });
  };

  const updateMonthlyStep = async (step: number) => {
    await updateProgress({ monthly_step: step });
  };

  const moveToWeekly = async () => {
    await updateProgress({ current_phase: "weekly", weekly_step: 0 });
  };

  const updateWeeklyStep = async (step: number) => {
    await updateProgress({ weekly_step: step });
  };

  const completeAllPlanning = async () => {
    await updateProgress({ 
      current_phase: "completed", 
      completed_at: new Date().toISOString() 
    });
  };

  const isCompleted = progress?.current_phase === "completed";

  return {
    progress,
    loading,
    isCompleted,
    initializeProgress,
    updateProgress,
    updateQuarterlyStep,
    moveToMonthly,
    updateMonthlyStep,
    moveToWeekly,
    updateWeeklyStep,
    completeAllPlanning,
    refetch: fetchProgress,
  };
};
