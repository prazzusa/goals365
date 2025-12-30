import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ArrowRight, Plus, X, Mic } from "lucide-react";
import VoiceInput from "@/components/VoiceInput";
import { useState, useMemo } from "react";

export interface MonthlyGoal {
  id: string;
  title: string;
  description: string;
}

export interface WeeklyPriority {
  id: string;
  title: string;
}

interface VisionFlowProps {
  vision: string;
  monthlyGoals: MonthlyGoal[];
  weeklyPriorities: WeeklyPriority[];
  onVisionChange: (vision: string) => void;
  onMonthlyGoalsChange: (goals: MonthlyGoal[]) => void;
  onWeeklyPrioritiesChange: (priorities: WeeklyPriority[]) => void;
  onNext: () => void;
  onBack: () => void;
}

const VisionFlow = ({
  vision,
  monthlyGoals,
  weeklyPriorities,
  onVisionChange,
  onMonthlyGoalsChange,
  onWeeklyPrioritiesChange,
  onNext,
  onBack,
}: VisionFlowProps) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [showVoiceInput, setShowVoiceInput] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [editingPriorityId, setEditingPriorityId] = useState<string | null>(null);
  const [monthlyPlaceholderIds] = useState(() => 
    Array.from({ length: 1 }, () => crypto.randomUUID())
  );
  const [weeklyPlaceholderIds] = useState(() => 
    Array.from({ length: 2 }, () => crypto.randomUUID())
  );

  // Ensure at least 1 monthly goal with stable IDs
  const displayMonthlyGoals = useMemo(() => {
    if (monthlyGoals.length >= 1) {
      return monthlyGoals;
    }
    return [
      ...monthlyGoals,
      ...Array.from({ length: 1 - monthlyGoals.length }, (_, i) => ({
        id: monthlyPlaceholderIds[i] || crypto.randomUUID(),
        title: "",
        description: "",
      }))
    ];
  }, [monthlyGoals, monthlyPlaceholderIds]);

  // Ensure at least 2 weekly priorities with stable IDs
  const displayWeeklyPriorities = useMemo(() => {
    if (weeklyPriorities.length >= 2) {
      return weeklyPriorities;
    }
    const needed = 2 - weeklyPriorities.length;
    return [
      ...weeklyPriorities,
      ...Array.from({ length: needed }, (_, i) => ({
        id: weeklyPlaceholderIds[weeklyPriorities.length + i] || crypto.randomUUID(),
        title: "",
      }))
    ];
  }, [weeklyPriorities, weeklyPlaceholderIds]);

  const handleVoiceTranscript = (transcript: string) => {
    onVisionChange(vision ? `${vision} ${transcript}` : transcript);
    setShowVoiceInput(false);
  };

  const handleUpdateMonthlyGoal = (id: string, updates: Partial<MonthlyGoal>) => {
    const existingGoal = monthlyGoals.find((goal) => goal.id === id);
    if (existingGoal) {
      onMonthlyGoalsChange(
        monthlyGoals.map((goal) => (goal.id === id ? { ...goal, ...updates } : goal))
      );
    } else {
      const newGoal: MonthlyGoal = {
        id,
        title: "",
        description: "",
        ...updates,
      };
      onMonthlyGoalsChange([...monthlyGoals, newGoal]);
    }
  };

  const handleAddMonthlyGoal = () => {
    const newGoal: MonthlyGoal = {
      id: crypto.randomUUID(),
      title: "",
      description: "",
    };
    onMonthlyGoalsChange([...monthlyGoals, newGoal]);
    setEditingGoalId(newGoal.id);
  };

  const handleRemoveMonthlyGoal = (id: string) => {
    if (monthlyGoals.length > 1) {
      onMonthlyGoalsChange(monthlyGoals.filter((goal) => goal.id !== id));
    }
  };

  const handleUpdateWeeklyPriority = (id: string, title: string) => {
    const existingPriority = weeklyPriorities.find((p) => p.id === id);
    if (existingPriority) {
      onWeeklyPrioritiesChange(
        weeklyPriorities.map((p) => (p.id === id ? { ...p, title } : p))
      );
    } else {
      const newPriority: WeeklyPriority = {
        id,
        title,
      };
      onWeeklyPrioritiesChange([...weeklyPriorities, newPriority]);
    }
  };

  const handleAddWeeklyPriority = () => {
    const newPriority: WeeklyPriority = {
      id: crypto.randomUUID(),
      title: "",
    };
    onWeeklyPrioritiesChange([...weeklyPriorities, newPriority]);
    setEditingPriorityId(newPriority.id);
  };

  const handleRemoveWeeklyPriority = (id: string) => {
    if (weeklyPriorities.length > 2) {
      onWeeklyPrioritiesChange(weeklyPriorities.filter((p) => p.id !== id));
    }
  };

  const canContinueStep1 = true; // Vision is optional
  const canContinueStep2 = monthlyGoals.length >= 1 && 
    monthlyGoals.every((goal) => goal.title.trim().length > 0);
  const canContinueStep3 = weeklyPriorities.length >= 2 && 
    weeklyPriorities.every((p) => p.title.trim().length > 0);

  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep((prev) => (prev + 1) as 1 | 2 | 3);
    } else {
      onNext();
    }
  };

  const handleBackStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3);
    } else {
      onBack();
    }
  };

  return (
    <div className="min-h-screen flex flex-col px-6 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBackStep}
          className="rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {currentStep === 1 && "Define Your Annual Vision"}
            {currentStep === 2 && "What Do You Want to Achieve This Month?"}
            {currentStep === 3 && "Set Your Weekly Priorities"}
          </h1>
          <p className="text-muted-foreground text-sm">Step {currentStep} of 3</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full">
        <AnimatePresence mode="wait">
          {/* Step 1: Annual Vision */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
              >
                <label className="block text-sm font-medium text-foreground mb-2">
                  Your Annual Vision (optional)
                </label>
                
                {showVoiceInput ? (
                  <VoiceInput
                    onTranscript={handleVoiceTranscript}
                    placeholder="Speak your vision..."
                    className="mb-4"
                  />
                ) : (
                  <div className="relative">
                    <Textarea
                      value={vision}
                      onChange={(e) => onVisionChange(e.target.value)}
                      placeholder="What does this year mean to you? What would make it meaningful?"
                      className="min-h-[120px] text-base rounded-xl resize-none pr-12"
                    />
                    <div className="absolute right-2 bottom-2 z-10">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowVoiceInput(true)}
                        className="rounded-full hover:bg-primary/10"
                      >
                        <Mic className="w-5 h-5 text-primary" />
                      </Button>
                    </div>
                  </div>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mt-auto pb-8"
              >
                <Button
                  onClick={handleNextStep}
                  disabled={!canContinueStep1}
                  size="lg"
                  className="w-full h-14 text-lg font-semibold rounded-xl disabled:opacity-50"
                >
                  Continue
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>
            </motion.div>
          )}

          {/* Step 2: Monthly Goals */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col space-y-4"
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-4"
              >
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-foreground">
                    Monthly Goals (at least 1 required)
                  </label>
                  <span className="text-xs text-muted-foreground">
                    {monthlyGoals.filter(g => g.title.trim()).length}/1+
                  </span>
                </div>

                <div className="space-y-4">
                  <AnimatePresence mode="popLayout">
                    {displayMonthlyGoals.map((goal, index) => {
                      const isEditing = editingGoalId === goal.id || !goal.title;
                      const isRequired = index < 1;
                      
                      return (
                        <motion.div
                          key={goal.id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -100 }}
                          transition={{ delay: index * 0.05 }}
                          className="bg-card rounded-xl p-4 border border-border shadow-sm"
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-1 space-y-3">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-muted-foreground">
                                  Goal {index + 1}
                                  {isRequired && <span className="text-destructive ml-1">*</span>}
                                </span>
                                {!isRequired && (
                                  <button
                                    onClick={() => handleRemoveMonthlyGoal(goal.id)}
                                    className="ml-auto text-muted-foreground hover:text-destructive transition-colors"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                              
                              <Input
                                placeholder="What do you want to achieve this month? (required)"
                                value={goal.title}
                                onChange={(e) => handleUpdateMonthlyGoal(goal.id, { title: e.target.value })}
                                onFocus={() => setEditingGoalId(goal.id)}
                                className="rounded-lg"
                              />
                              
                              <Textarea
                                placeholder="Description (optional)"
                                value={goal.description}
                                onChange={(e) => handleUpdateMonthlyGoal(goal.id, { description: e.target.value })}
                                onFocus={() => setEditingGoalId(goal.id)}
                                className="rounded-lg resize-none min-h-[80px]"
                              />
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>

                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={handleAddMonthlyGoal}
                    className="w-full py-4 rounded-xl border-2 border-dashed border-muted-foreground/30 text-muted-foreground hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Add Another Goal
                  </motion.button>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-auto pb-8"
              >
                <Button
                  onClick={handleNextStep}
                  disabled={!canContinueStep2}
                  size="lg"
                  className="w-full h-14 text-lg font-semibold rounded-xl disabled:opacity-50"
                >
                  Continue
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                {!canContinueStep2 && (
                  <p className="text-center text-sm text-muted-foreground mt-3">
                    Please complete at least 1 monthly goal to continue
                  </p>
                )}
              </motion.div>
            </motion.div>
          )}

          {/* Step 3: Weekly Priorities */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col space-y-4"
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-4"
              >
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-foreground">
                    Weekly Priorities (at least 2 required)
                  </label>
                  <span className="text-xs text-muted-foreground">
                    {weeklyPriorities.filter(p => p.title.trim()).length}/2+
                  </span>
                </div>

                <div className="space-y-4">
                  <AnimatePresence mode="popLayout">
                    {displayWeeklyPriorities.map((priority, index) => {
                      const isEditing = editingPriorityId === priority.id || !priority.title;
                      const isRequired = index < 2;
                      
                      return (
                        <motion.div
                          key={priority.id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -100 }}
                          transition={{ delay: index * 0.05 }}
                          className="bg-card rounded-xl p-4 border border-border shadow-sm"
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-1 space-y-3">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-muted-foreground">
                                  Priority {index + 1}
                                  {isRequired && <span className="text-destructive ml-1">*</span>}
                                </span>
                                {!isRequired && (
                                  <button
                                    onClick={() => handleRemoveWeeklyPriority(priority.id)}
                                    className="ml-auto text-muted-foreground hover:text-destructive transition-colors"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                              
                              <Input
                                placeholder="What's your priority for this week? (required)"
                                value={priority.title}
                                onChange={(e) => handleUpdateWeeklyPriority(priority.id, e.target.value)}
                                onFocus={() => setEditingPriorityId(priority.id)}
                                className="rounded-lg"
                              />
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>

                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={handleAddWeeklyPriority}
                    className="w-full py-4 rounded-xl border-2 border-dashed border-muted-foreground/30 text-muted-foreground hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Add Another Priority
                  </motion.button>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-auto pb-8"
              >
                <Button
                  onClick={handleNextStep}
                  disabled={!canContinueStep3}
                  size="lg"
                  className="w-full h-14 text-lg font-semibold rounded-xl disabled:opacity-50"
                >
                  Complete & Go to Dashboard
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                {!canContinueStep3 && (
                  <p className="text-center text-sm text-muted-foreground mt-3">
                    Please complete at least 2 weekly priorities to continue
                  </p>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default VisionFlow;

