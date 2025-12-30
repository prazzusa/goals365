import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { usePlanningProgress } from "@/hooks/usePlanningProgress";
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
  const { 
    progress, 
    loading: progressLoading, 
    isCompleted,
    initializeProgress, 
    updateQuarterlyStep 
  } = usePlanningProgress();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [planningState, setPlanningState] = useState<QuarterlyPlanningState>({
    vision: "",
    selectedCategories: [],
    goals: [],
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
          selectedCategories: (progress.selected_categories || []) as QuarterlyCategory[],
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
    const nextStep = Math.min(currentStep + 1, 5);
    setCurrentStep(nextStep);
    
    // Save progress to database
    await updateQuarterlyStep(nextStep, {
      vision: planningState.vision,
      categories: planningState.selectedCategories,
    });
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
            onComplete={() => navigate("/monthly")}
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
