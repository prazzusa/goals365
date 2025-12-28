import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface YearlyGoal {
  id: string;
  user_id: string;
  category: "personal" | "professional" | "fitness";
  title: string;
  description?: string;
  position: number;
  created_at: string;
}

export interface MonthlyGoal {
  id: string;
  user_id: string;
  yearly_goal_id: string | null;
  title: string;
  month: number;
  year: number;
  completed: boolean;
  created_at: string;
}

export interface WeeklyGoal {
  id: string;
  user_id: string;
  monthly_goal_id: string | null;
  title: string;
  week_start: string;
  completed: boolean;
  created_at: string;
}

export interface DailyGoal {
  id: string;
  user_id: string;
  weekly_goal_id: string | null;
  category: "personal" | "professional" | "fitness";
  title: string;
  date: string;
  completed: boolean;
  progress: number;
  notes?: string;
  created_at: string;
}

type GoalCategory = "personal" | "professional" | "fitness";

export const useGoals = () => {
  const { user } = useAuth();
  const [yearlyGoals, setYearlyGoals] = useState<YearlyGoal[]>([]);
  const [monthlyGoals, setMonthlyGoals] = useState<MonthlyGoal[]>([]);
  const [weeklyGoals, setWeeklyGoals] = useState<WeeklyGoal[]>([]);
  const [dailyGoals, setDailyGoals] = useState<DailyGoal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAllGoals = useCallback(async () => {
    if (!user) return;

    try {
      const [yearlyRes, monthlyRes, weeklyRes, dailyRes] = await Promise.all([
        supabase.from("yearly_goals").select("*").eq("user_id", user.id).order("position"),
        supabase.from("monthly_goals").select("*").eq("user_id", user.id),
        supabase.from("weekly_goals").select("*").eq("user_id", user.id),
        supabase.from("daily_goals").select("*").eq("user_id", user.id),
      ]);

      if (yearlyRes.data) setYearlyGoals(yearlyRes.data as YearlyGoal[]);
      if (monthlyRes.data) setMonthlyGoals(monthlyRes.data as MonthlyGoal[]);
      if (weeklyRes.data) setWeeklyGoals(weeklyRes.data as WeeklyGoal[]);
      if (dailyRes.data) setDailyGoals(dailyRes.data as DailyGoal[]);
    } catch (error) {
      console.error("Error fetching goals:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAllGoals();
  }, [fetchAllGoals]);

  // Yearly goals
  const addYearlyGoal = async (category: GoalCategory, title: string, description?: string) => {
    if (!user) return null;

    const maxPosition = yearlyGoals.filter(g => g.category === category).length;
    
    const { data, error } = await supabase
      .from("yearly_goals")
      .insert({ user_id: user.id, category, title, description, position: maxPosition })
      .select()
      .single();

    if (error) {
      toast.error("Couldn't save goal");
      return null;
    }

    setYearlyGoals(prev => [...prev, data as YearlyGoal]);
    return data;
  };

  const updateYearlyGoal = async (id: string, updates: Partial<YearlyGoal>) => {
    const { error } = await supabase.from("yearly_goals").update(updates).eq("id", id);
    
    if (error) {
      toast.error("Couldn't update goal");
      return false;
    }

    setYearlyGoals(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));
    return true;
  };

  const deleteYearlyGoal = async (id: string) => {
    const { error } = await supabase.from("yearly_goals").delete().eq("id", id);
    
    if (error) {
      toast.error("Couldn't remove goal");
      return false;
    }

    setYearlyGoals(prev => prev.filter(g => g.id !== id));
    return true;
  };

  // Monthly goals
  const addMonthlyGoal = async (yearlyGoalId: string | null, title: string, month: number, year: number) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from("monthly_goals")
      .insert({ user_id: user.id, yearly_goal_id: yearlyGoalId, title, month, year })
      .select()
      .single();

    if (error) {
      toast.error("Couldn't save monthly goal");
      return null;
    }

    setMonthlyGoals(prev => [...prev, data]);
    return data;
  };

  const updateMonthlyGoal = async (id: string, updates: Partial<MonthlyGoal>) => {
    const { error } = await supabase.from("monthly_goals").update(updates).eq("id", id);
    
    if (!error) {
      setMonthlyGoals(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));
    }
    return !error;
  };

  const deleteMonthlyGoal = async (id: string) => {
    const { error } = await supabase.from("monthly_goals").delete().eq("id", id);
    if (!error) setMonthlyGoals(prev => prev.filter(g => g.id !== id));
    return !error;
  };

  // Weekly goals
  const addWeeklyGoal = async (monthlyGoalId: string | null, title: string, weekStart: string) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from("weekly_goals")
      .insert({ user_id: user.id, monthly_goal_id: monthlyGoalId, title, week_start: weekStart })
      .select()
      .single();

    if (error) {
      toast.error("Couldn't save weekly goal");
      return null;
    }

    setWeeklyGoals(prev => [...prev, data]);
    return data;
  };

  const updateWeeklyGoal = async (id: string, updates: Partial<WeeklyGoal>) => {
    const { error } = await supabase.from("weekly_goals").update(updates).eq("id", id);
    if (!error) setWeeklyGoals(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));
    return !error;
  };

  const deleteWeeklyGoal = async (id: string) => {
    const { error } = await supabase.from("weekly_goals").delete().eq("id", id);
    if (!error) setWeeklyGoals(prev => prev.filter(g => g.id !== id));
    return !error;
  };

  // Daily goals
  const addDailyGoal = async (weeklyGoalId: string | null, category: GoalCategory, title: string, date: string) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from("daily_goals")
      .insert({ user_id: user.id, weekly_goal_id: weeklyGoalId, category, title, date })
      .select()
      .single();

    if (error) {
      toast.error("Couldn't save daily goal");
      return null;
    }

    setDailyGoals(prev => [...prev, data as DailyGoal]);
    return data;
  };

  const updateDailyGoal = async (id: string, updates: Partial<DailyGoal>) => {
    const { error } = await supabase.from("daily_goals").update(updates).eq("id", id);
    if (!error) setDailyGoals(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));
    return !error;
  };

  const deleteDailyGoal = async (id: string) => {
    const { error } = await supabase.from("daily_goals").delete().eq("id", id);
    if (!error) setDailyGoals(prev => prev.filter(g => g.id !== id));
    return !error;
  };

  // Helper functions
  const getYearlyGoalsByCategory = (category: GoalCategory) => 
    yearlyGoals.filter(g => g.category === category);

  const getMonthlyGoalsForYearly = (yearlyGoalId: string) =>
    monthlyGoals.filter(g => g.yearly_goal_id === yearlyGoalId);

  const getWeeklyGoalsForMonthly = (monthlyGoalId: string) =>
    weeklyGoals.filter(g => g.monthly_goal_id === monthlyGoalId);

  const getDailyGoalsForDate = (date: string) =>
    dailyGoals.filter(g => g.date === date);

  const getDailyGoalsByCategory = (category: GoalCategory, date: string) =>
    dailyGoals.filter(g => g.category === category && g.date === date);

  const hasCompletedSetup = (category: GoalCategory) =>
    yearlyGoals.some(g => g.category === category);

  return {
    yearlyGoals,
    monthlyGoals,
    weeklyGoals,
    dailyGoals,
    loading,
    refetch: fetchAllGoals,
    // Yearly
    addYearlyGoal,
    updateYearlyGoal,
    deleteYearlyGoal,
    getYearlyGoalsByCategory,
    // Monthly
    addMonthlyGoal,
    updateMonthlyGoal,
    deleteMonthlyGoal,
    getMonthlyGoalsForYearly,
    // Weekly
    addWeeklyGoal,
    updateWeeklyGoal,
    deleteWeeklyGoal,
    getWeeklyGoalsForMonthly,
    // Daily
    addDailyGoal,
    updateDailyGoal,
    deleteDailyGoal,
    getDailyGoalsForDate,
    getDailyGoalsByCategory,
    // Helpers
    hasCompletedSetup,
  };
};
