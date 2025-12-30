import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { startOfWeek, format } from "date-fns";
import { usePlanningProgress } from "@/hooks/usePlanningProgress";
import { toast } from "sonner";
import WeeklyFocus from "@/components/weekly/WeeklyFocus";
import WeeklyTasks, { WeeklyTask } from "@/components/weekly/WeeklyTasks";
import TaskStatusTracker from "@/components/weekly/TaskStatusTracker";
import MidWeekRefinement from "@/components/weekly/MidWeekRefinement";

interface ActiveGoal {
  id: string;
  title: string;
  category: string;
}

const WeeklyPlanning = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { progress, loading: progressLoading, updateWeeklyStep, completeAllPlanning } = usePlanningProgress();
  const [currentStep, setCurrentStep] = useState(0);
  const [currentWeek] = useState(startOfWeek(new Date()));
  const [activeGoals, setActiveGoals] = useState<ActiveGoal[]>([]);
  const [tasks, setTasks] = useState<WeeklyTask[]>([]);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  // Initialize from progress
  useEffect(() => {
    if (!progressLoading && progress && !initialized) {
      setCurrentStep(progress.weekly_step || 0);
      setInitialized(true);
    }
  }, [progress, progressLoading, initialized]);

  // Fetch yearly goals as active goals
  useEffect(() => {
    const fetchGoals = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("yearly_goals")
        .select("id, title, category")
        .eq("user_id", user.id);

      if (!error && data) {
        setActiveGoals(data);
      }
    };

    fetchGoals();
  }, [user]);

  if (loading || progressLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const handleNext = async () => {
    const nextStep = Math.min(currentStep + 1, 3);
    setCurrentStep(nextStep);
    await updateWeeklyStep(nextStep);
  };

  const handleBack = () => {
    if (currentStep === 0) {
      navigate("/monthly");
    } else {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleTaskStatusChange = (
    taskId: string,
    status: "todo" | "in_progress" | "done"
  ) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status } : t))
    );
  };

  const handleComplete = async () => {
    if (!user) return;

    try {
      const weekStart = format(currentWeek, "yyyy-MM-dd");

      // Save weekly goals/tasks
      for (const task of tasks) {
        const goal = activeGoals.find((g) => g.id === task.goalId);
        
        await supabase.from("weekly_goals").insert({
          user_id: user.id,
          title: task.title,
          week_start: weekStart,
          monthly_goal_id: null,
          effort: task.effort,
          status: task.status,
          category: goal?.category || "personal",
        });
      }

      toast.success("Weekly plan saved! Planning complete.");
      await completeAllPlanning();
      navigate("/dashboard");
    } catch (error) {
      console.error("Error saving weekly plan:", error);
      toast.error("Failed to save weekly plan");
    }
  };

  const suggestedFocus = activeGoals.length > 0
    ? ["Focus on high-priority tasks first", "Maintain momentum on started tasks"]
    : [];

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <WeeklyFocus
            currentWeek={currentWeek}
            activeGoals={activeGoals}
            suggestedFocus={suggestedFocus}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 1:
        return (
          <WeeklyTasks
            currentWeek={currentWeek}
            activeGoals={activeGoals}
            tasks={tasks}
            onTasksChange={setTasks}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 2:
        return (
          <TaskStatusTracker
            currentWeek={currentWeek}
            tasks={tasks}
            onTaskStatusChange={handleTaskStatusChange}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 3:
        return (
          <MidWeekRefinement onComplete={handleComplete} onBack={handleBack} />
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

export default WeeklyPlanning;
