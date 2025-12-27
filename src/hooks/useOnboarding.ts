import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface OnboardingProgress {
  id: string;
  user_id: string;
  current_step: number;
  personal_goals: string[];
  professional_goals: string[];
  fitness_goals: string[];
  completed_at: string | null;
}

export const useOnboarding = () => {
  const { user } = useAuth();
  const [progress, setProgress] = useState<OnboardingProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProgress();
    } else {
      setProgress(null);
      setLoading(false);
    }
  }, [user]);

  const fetchProgress = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("onboarding_progress")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;

      const onboardingData: OnboardingProgress = {
        id: data.id,
        user_id: data.user_id,
        current_step: data.current_step,
        personal_goals: (data.personal_goals as string[]) || [],
        professional_goals: (data.professional_goals as string[]) || [],
        fitness_goals: (data.fitness_goals as string[]) || [],
        completed_at: data.completed_at,
      };

      setProgress(onboardingData);
      setIsCompleted(!!data.completed_at);
    } catch (error) {
      console.error("Error fetching onboarding progress:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async (updates: Partial<OnboardingProgress>) => {
    if (!user || !progress) return;

    try {
      const { error } = await supabase
        .from("onboarding_progress")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);

      if (error) throw error;

      setProgress({ ...progress, ...updates });
    } catch (error) {
      console.error("Error updating onboarding progress:", error);
      throw error;
    }
  };

  const completeOnboarding = async () => {
    if (!user) return;

    try {
      const completedAt = new Date().toISOString();
      
      // Update onboarding_progress
      await supabase
        .from("onboarding_progress")
        .update({ completed_at: completedAt })
        .eq("user_id", user.id);

      // Update profiles
      await supabase
        .from("profiles")
        .update({ onboarding_completed: true })
        .eq("user_id", user.id);

      setIsCompleted(true);
      if (progress) {
        setProgress({ ...progress, completed_at: completedAt });
      }
    } catch (error) {
      console.error("Error completing onboarding:", error);
      throw error;
    }
  };

  return {
    progress,
    loading,
    isCompleted,
    updateProgress,
    completeOnboarding,
    refetch: fetchProgress,
  };
};
