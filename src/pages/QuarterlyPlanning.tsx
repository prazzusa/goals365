import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { usePlanningProgress } from "@/hooks/usePlanningProgress";
import QuarterlyWelcome from "@/components/quarterly/QuarterlyWelcome";
import VisionFlow, { MonthlyGoal, WeeklyPriority } from "@/components/quarterly/VisionFlow";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, startOfWeek, getMonth, getYear } from "date-fns";

export interface QuarterlyPlanningState {
  vision: string;
  monthlyGoals: MonthlyGoal[];
  weeklyPriorities: WeeklyPriority[];
}

const QuarterlyPlanning = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { 
    progress, 
    loading: progressLoading, 
    isCompleted,
    initializeProgress, 
    updateQuarterlyStep,
    completeAllPlanning
  } = usePlanningProgress();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [planningState, setPlanningState] = useState<QuarterlyPlanningState>({
    vision: "",
    monthlyGoals: [],
    weeklyPriorities: [],
  });
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  // Redirect if planning is completed
  useEffect(() => {
    if (!progressLoading && isCompleted) {
      navigate("/dashboard");
    }
  }, [progressLoading, isCompleted, navigate]);

  // Initialize or restore progress
  useEffect(() => {
    if (!progressLoading && user && !initialized) {
      if (progress) {
        setCurrentStep(progress.quarterly_step || 0);
        setPlanningState((prev) => ({
          ...prev,
          vision: progress.quarterly_vision || "",
        }));
      }
      setInitialized(true);
    }
  }, [progress, progressLoading, user, initialized]);

  if (loading || progressLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const handleNext = async () => {
    if (currentStep === 1) {
      // Save monthly goals and weekly priorities to database
      await saveGoalsToDatabase();
    }
    const nextStep = Math.min(currentStep + 1, 1);
    setCurrentStep(nextStep);
    
    // Save progress to database
    await updateQuarterlyStep(nextStep, {
      vision: planningState.vision,
      categories: [],
    });
  };

  const saveGoalsToDatabase = async () => {
    if (!user) return;

    try {
      const currentMonth = getMonth(new Date()) + 1;
      const currentYear = getYear(new Date());
      const weekStart = format(startOfWeek(new Date()), "yyyy-MM-dd");

      // Save monthly goals
      if (planningState.monthlyGoals.length > 0) {
        const monthlyGoalsToInsert = planningState.monthlyGoals
          .filter(g => g.title.trim())
          .map(goal => ({
            user_id: user.id,
            title: goal.title,
            month: currentMonth,
            year: currentYear,
            progress: 0,
            priority: "medium" as const,
            status: "todo" as const,
            completed: false,
          }));

        if (monthlyGoalsToInsert.length > 0) {
          await supabase.from("monthly_goals").insert(monthlyGoalsToInsert);
        }
      }

      // Save weekly priorities
      if (planningState.weeklyPriorities.length > 0) {
        const weeklyGoalsToInsert = planningState.weeklyPriorities
          .filter(p => p.title.trim())
          .map(priority => ({
            user_id: user.id,
            title: priority.title,
            week_start: weekStart,
            effort: "M" as const,
            status: "todo" as const,
          }));

        if (weeklyGoalsToInsert.length > 0) {
          await supabase.from("weekly_goals").upsert(weeklyGoalsToInsert, {
            onConflict: "id",
          });
        }
      }

      await completeAllPlanning();
      toast.success("Goals saved successfully!");
    } catch (error) {
      console.error("Error saving goals:", error);
      toast.error("Failed to save goals");
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleStartPlanning = async () => {
    if (!progress) {
      await initializeProgress();
    }
    handleNext();
  };

  const handleResumeProgress = () => {
    // Already restored from progress state, just ensure we're at the right step
    if (progress && progress.quarterly_step > 0) {
      setCurrentStep(progress.quarterly_step);
    } else {
      handleNext();
    }
  };

  const updatePlanningState = (updates: Partial<QuarterlyPlanningState>) => {
    setPlanningState((prev) => ({ ...prev, ...updates }));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <QuarterlyWelcome
            onStartPlanning={handleStartPlanning}
            onResume={handleResumeProgress}
            hasExistingProgress={!!progress && progress.quarterly_step > 0}
          />
        );
      case 1:
        return (
          <VisionFlow
            vision={planningState.vision}
            monthlyGoals={planningState.monthlyGoals}
            weeklyPriorities={planningState.weeklyPriorities}
            onVisionChange={(vision) => updatePlanningState({ vision })}
            onMonthlyGoalsChange={(monthlyGoals) => updatePlanningState({ monthlyGoals })}
            onWeeklyPrioritiesChange={(weeklyPriorities) => updatePlanningState({ weeklyPriorities })}
            onNext={async () => {
              await saveGoalsToDatabase();
              navigate("/dashboard");
            }}
            onBack={handleBack}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="min-h-screen"
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default QuarterlyPlanning;
