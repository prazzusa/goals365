import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, getMonth, getYear } from "date-fns";
import { usePlanningProgress } from "@/hooks/usePlanningProgress";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import MonthlyWelcome from "@/components/monthly/MonthlyWelcome";
import MonthSelector from "@/components/monthly/MonthSelector";
import MonthlyGoalRefinement, { MonthlyGoalStatus } from "@/components/monthly/MonthlyGoalRefinement";
import MonthlyObjectives, { MonthlyObjective } from "@/components/monthly/MonthlyObjectives";
import MonthlySequencing from "@/components/monthly/MonthlySequencing";

interface QuarterlyGoal {
  id: string;
  category: string;
  title: string;
}

const MonthlyPlanning = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { progress, loading: progressLoading, updateMonthlyStep, moveToMonthly, moveToWeekly } = usePlanningProgress();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState(startOfMonth(new Date()));
  const [quarterlyGoals, setQuarterlyGoals] = useState<QuarterlyGoal[]>([]);
  const [goalStatuses, setGoalStatuses] = useState<MonthlyGoalStatus[]>([]);
  const [objectives, setObjectives] = useState<MonthlyObjective[]>([]);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  // Initialize from progress
  useEffect(() => {
    if (!progressLoading && progress && !initialized) {
      if (progress.current_phase === "quarterly") {
        moveToMonthly();
      }
      setCurrentStep(progress.monthly_step || 0);
      setInitialized(true);
    }
  }, [progress, progressLoading, initialized, moveToMonthly]);

  // Fetch quarterly/yearly goals
  useEffect(() => {
    const fetchGoals = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("yearly_goals")
        .select("id, category, title")
        .eq("user_id", user.id);

      if (!error && data) {
        setQuarterlyGoals(data);
        // Initialize goal statuses
        setGoalStatuses(
          data.map((g) => ({
            goalId: g.id,
            isActive: true,
            priority: "medium" as const,
          }))
        );
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
    const nextStep = Math.min(currentStep + 1, 4);
    setCurrentStep(nextStep);
    await updateMonthlyStep(nextStep);
  };

  const handleBack = () => {
    if (currentStep === 0) {
      navigate("/planning");
    } else {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSaveAndGoToWeekly = async () => {
    if (!user) return;

    try {
      // Save monthly goals from objectives
      const monthNum = getMonth(selectedMonth) + 1;
      const year = getYear(selectedMonth);

      for (const objective of objectives) {
        const quarterlyGoal = quarterlyGoals.find((g) => g.id === objective.goalId);
        
        await supabase.from("monthly_goals").insert({
          user_id: user.id,
          title: objective.title,
          month: monthNum,
          year,
          yearly_goal_id: objective.goalId,
          progress: 0,
          priority: goalStatuses.find((gs) => gs.goalId === objective.goalId)?.priority || "medium",
          category: quarterlyGoal?.category || "personal",
        });
      }

      toast.success("Monthly plan saved!");
      await moveToWeekly();
      navigate("/weekly");
    } catch (error) {
      console.error("Error saving monthly plan:", error);
      toast.error("Failed to save monthly plan");
    }
  };

  const activeGoalIds = goalStatuses.filter((gs) => gs.isActive).map((gs) => gs.goalId);

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <MonthlyWelcome onStartPlanning={handleNext} />;
      case 1:
        return (
          <MonthSelector
            selectedMonth={selectedMonth}
            onMonthSelect={setSelectedMonth}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 2:
        return (
          <MonthlyGoalRefinement
            selectedMonth={selectedMonth}
            quarterlyGoals={quarterlyGoals}
            goalStatuses={goalStatuses}
            onStatusChange={setGoalStatuses}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 3:
        return (
          <MonthlyObjectives
            selectedMonth={selectedMonth}
            quarterlyGoals={quarterlyGoals}
            activeGoalIds={activeGoalIds}
            objectives={objectives}
            onObjectivesChange={setObjectives}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 4:
        return (
          <MonthlySequencing
            selectedMonth={selectedMonth}
            objectives={objectives}
            onNext={handleSaveAndGoToWeekly}
            onBack={handleBack}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Return to Dashboard Button */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-3">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="rounded-xl gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Dashboard
          </Button>
        </div>
      </div>
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

export default MonthlyPlanning;
