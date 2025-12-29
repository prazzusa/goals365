import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth } from "date-fns";
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
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState(startOfMonth(new Date()));
  const [quarterlyGoals, setQuarterlyGoals] = useState<QuarterlyGoal[]>([]);
  const [goalStatuses, setGoalStatuses] = useState<MonthlyGoalStatus[]>([]);
  const [objectives, setObjectives] = useState<MonthlyObjective[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const handleNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  const handleBack = () => {
    if (currentStep === 0) {
      navigate("/planning");
    } else {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleGoToWeekly = () => {
    navigate("/weekly");
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
            onNext={handleGoToWeekly}
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

export default MonthlyPlanning;
