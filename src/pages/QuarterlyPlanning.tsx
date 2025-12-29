import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import QuarterlyWelcome from "@/components/quarterly/QuarterlyWelcome";
import QuarterlyVision from "@/components/quarterly/QuarterlyVision";
import QuarterlyCategories from "@/components/quarterly/QuarterlyCategories";
import QuarterlyGoals from "@/components/quarterly/QuarterlyGoals";
import QuarterlyGuidance from "@/components/quarterly/QuarterlyGuidance";
import QuarterlySummary from "@/components/quarterly/QuarterlySummary";

export type QuarterlyCategory = "personal" | "professional" | "fitness";

export interface QuarterlyGoal {
  id: string;
  category: QuarterlyCategory;
  title: string;
  whyItMatters?: string;
  difficulty: "light" | "balanced" | "stretch";
}

export interface QuarterlyPlanningState {
  vision: string;
  selectedCategories: QuarterlyCategory[];
  goals: QuarterlyGoal[];
}

const QuarterlyPlanning = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [planningState, setPlanningState] = useState<QuarterlyPlanningState>({
    vision: "",
    selectedCategories: [],
    goals: [],
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const handleNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, 5));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleResumeProgress = () => {
    // For now, just start fresh - can implement resume logic later
    handleNext();
  };

  const updatePlanningState = (updates: Partial<QuarterlyPlanningState>) => {
    setPlanningState((prev) => ({ ...prev, ...updates }));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <QuarterlyWelcome
            onStartPlanning={handleNext}
            onResume={handleResumeProgress}
          />
        );
      case 1:
        return (
          <QuarterlyVision
            vision={planningState.vision}
            onVisionChange={(vision) => updatePlanningState({ vision })}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 2:
        return (
          <QuarterlyCategories
            selectedCategories={planningState.selectedCategories}
            onCategoriesChange={(selectedCategories) =>
              updatePlanningState({ selectedCategories })
            }
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 3:
        return (
          <QuarterlyGoals
            selectedCategories={planningState.selectedCategories}
            goals={planningState.goals}
            onGoalsChange={(goals) => updatePlanningState({ goals })}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 4:
        return (
          <QuarterlyGuidance
            goals={planningState.goals}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 5:
        return (
          <QuarterlySummary
            planningState={planningState}
            onBack={handleBack}
            onComplete={() => navigate("/dashboard")}
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
