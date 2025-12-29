import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface TierLimits {
  maxCategories: number;
  historyDays: number;
  hasAI: boolean;
  hasAdvancedFitness: boolean;
  hasFullAnalytics: boolean;
  hasSmartReminders: boolean;
  hasPredictiveInsights: boolean;
  hasFullMomentumScore: boolean;
}

const FREE_LIMITS: TierLimits = {
  maxCategories: 1,
  historyDays: 14,
  hasAI: false,
  hasAdvancedFitness: false,
  hasFullAnalytics: false,
  hasSmartReminders: false,
  hasPredictiveInsights: false,
  hasFullMomentumScore: false,
};

const PREMIUM_LIMITS: TierLimits = {
  maxCategories: 3,
  historyDays: 365,
  hasAI: true,
  hasAdvancedFitness: true,
  hasFullAnalytics: true,
  hasSmartReminders: true,
  hasPredictiveInsights: true,
  hasFullMomentumScore: true,
};

export const usePremium = () => {
  const { user } = useAuth();
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchPremiumStatus();
    } else {
      setIsPremium(false);
      setLoading(false);
    }
  }, [user]);

  const fetchPremiumStatus = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("user_preferences")
        .select("is_premium")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      setIsPremium(data?.is_premium || false);
    } catch (error) {
      console.error("Error fetching premium status:", error);
      setIsPremium(false);
    } finally {
      setLoading(false);
    }
  };

  const limits = isPremium ? PREMIUM_LIMITS : FREE_LIMITS;

  const canAccessFeature = (feature: keyof TierLimits): boolean => {
    const value = limits[feature];
    return typeof value === "boolean" ? value : true;
  };

  const canAddCategory = (currentCount: number): boolean => {
    return currentCount < limits.maxCategories;
  };

  return {
    isPremium,
    loading,
    limits,
    canAccessFeature,
    canAddCategory,
    tierName: isPremium ? "Momentum+" : "Momentum",
    refetch: fetchPremiumStatus,
  };
};
