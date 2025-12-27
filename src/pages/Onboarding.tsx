import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ArrowRight, ArrowLeft, Check, Sparkles, Target, Briefcase, Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useOnboarding } from "@/hooks/useOnboarding";
import { toast } from "sonner";

const personalGoalOptions = [
  "Build better habits",
  "Improve mental health",
  "Learn a new skill",
  "Read more books",
  "Practice mindfulness",
  "Improve relationships",
  "Better work-life balance",
  "Travel more",
];

const professionalGoalOptions = [
  "Get a promotion",
  "Learn new technologies",
  "Build a side project",
  "Improve leadership skills",
  "Expand professional network",
  "Start a business",
  "Complete certifications",
  "Improve productivity",
];

const fitnessGoalOptions = [
  "Lose weight",
  "Build muscle",
  "Run a marathon",
  "Improve flexibility",
  "Exercise regularly",
  "Eat healthier",
  "Better sleep habits",
  "Increase energy levels",
];

const Onboarding = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { progress, loading: onboardingLoading, updateProgress, completeOnboarding, isCompleted } = useOnboarding();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [personalGoals, setPersonalGoals] = useState<string[]>([]);
  const [professionalGoals, setProfessionalGoals] = useState<string[]>([]);
  const [fitnessGoals, setFitnessGoals] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (isCompleted) {
      navigate("/dashboard");
    }
  }, [isCompleted, navigate]);

  useEffect(() => {
    if (progress) {
      setCurrentStep(progress.current_step);
      setPersonalGoals(progress.personal_goals || []);
      setProfessionalGoals(progress.professional_goals || []);
      setFitnessGoals(progress.fitness_goals || []);
    }
  }, [progress]);

  const toggleGoal = (goal: string, category: "personal" | "professional" | "fitness") => {
    switch (category) {
      case "personal":
        setPersonalGoals((prev) =>
          prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
        );
        break;
      case "professional":
        setProfessionalGoals((prev) =>
          prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
        );
        break;
      case "fitness":
        setFitnessGoals((prev) =>
          prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
        );
        break;
    }
  };

  const handleNext = async () => {
    try {
      if (currentStep === 1) {
        await updateProgress({ current_step: 2, personal_goals: personalGoals });
      } else if (currentStep === 2) {
        await updateProgress({ current_step: 3, professional_goals: professionalGoals });
      }
      setCurrentStep((prev) => prev + 1);
    } catch (error) {
      toast.error("Failed to save progress. Please try again.");
    }
  };

  const handleBack = async () => {
    const newStep = currentStep - 1;
    try {
      await updateProgress({ current_step: newStep });
      setCurrentStep(newStep);
    } catch (error) {
      toast.error("Failed to save progress. Please try again.");
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      await updateProgress({ fitness_goals: fitnessGoals });
      await completeOnboarding();
      toast.success("Welcome to GoalSync! Let's achieve your goals together.");
      navigate("/dashboard");
    } catch (error) {
      toast.error("Failed to complete onboarding. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || onboardingLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const steps = [
    { number: 1, title: "Personal", icon: Target, goals: personalGoalOptions, selected: personalGoals, category: "personal" as const },
    { number: 2, title: "Professional", icon: Briefcase, goals: professionalGoalOptions, selected: professionalGoals, category: "professional" as const },
    { number: 3, title: "Fitness", icon: Dumbbell, goals: fitnessGoalOptions, selected: fitnessGoals, category: "fitness" as const },
  ];

  const currentStepData = steps[currentStep - 1];

  return (
    <>
      <Helmet>
        <title>Goal Discovery - GoalSync</title>
        <meta name="description" content="Set your personal, professional, and fitness goals with GoalSync." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex flex-col">
        {/* Header */}
        <header className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary-foreground fill-primary-foreground" />
            </div>
            <span className="text-xl font-display font-bold">
              Goal<span className="text-primary">Sync</span>
            </span>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center gap-2">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    currentStep > step.number
                      ? "bg-primary text-primary-foreground"
                      : currentStep === step.number
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {currentStep > step.number ? <Check className="w-4 h-4" /> : step.number}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-8 h-0.5 mx-1 transition-colors ${
                      currentStep > step.number ? "bg-primary" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-2xl"
            >
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
                  <currentStepData.icon className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-3xl font-display font-bold mb-2">
                  {currentStep === 1 && "What personal goals matter to you?"}
                  {currentStep === 2 && "What are your career aspirations?"}
                  {currentStep === 3 && "What fitness goals inspire you?"}
                </h1>
                <p className="text-muted-foreground">
                  Select the goals that resonate with you. You can always update these later.
                </p>
              </div>

              {/* Goal Selection Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                {currentStepData.goals.map((goal) => {
                  const isSelected = currentStepData.selected.includes(goal);
                  return (
                    <button
                      key={goal}
                      onClick={() => toggleGoal(goal, currentStepData.category)}
                      className={`p-4 rounded-xl border-2 text-sm font-medium transition-all duration-200 ${
                        isSelected
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-card hover:border-primary/50 hover:bg-primary/5"
                      }`}
                    >
                      <span className="flex items-center justify-center gap-2">
                        {isSelected && <Check className="w-4 h-4" />}
                        {goal}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between gap-4">
                {currentStep > 1 ? (
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    className="rounded-xl h-12 px-6 gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </Button>
                ) : (
                  <div />
                )}

                {currentStep < 3 ? (
                  <Button
                    onClick={handleNext}
                    className="rounded-xl h-12 px-8 gap-2"
                  >
                    Continue
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleComplete}
                    disabled={isSubmitting}
                    className="rounded-xl h-12 px-8 gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground" />
                        Finishing...
                      </>
                    ) : (
                      <>
                        Start My Journey
                        <Sparkles className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Footer */}
        <footer className="p-6 text-center">
          <p className="text-sm text-muted-foreground">
            You can update your goals anytime from your dashboard.
          </p>
        </footer>
      </div>
    </>
  );
};

export default Onboarding;
