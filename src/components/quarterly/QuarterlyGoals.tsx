import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Lightbulb, Check, Sparkles, Calendar, Wand2, Loader2 } from "lucide-react";
import { AnnualGoal } from "./QuarterlyVision";
import { QuarterlyGoalAssignment } from "./QuarterlyCategories";
import { QuarterlyGoal } from "@/pages/QuarterlyPlanning";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface MonthlySuggestion {
  month: string;
  focus: string;
  milestones: string[];
}

interface QuarterlyGoalsProps {
  annualGoals: AnnualGoal[];
  goalAssignments: QuarterlyGoalAssignment[];
  goals: QuarterlyGoal[];
  onGoalsChange: (goals: QuarterlyGoal[]) => void;
  onNext: () => void;
  onBack: () => void;
}

const monthNames = ["January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"];

const quarterMonths: Record<"Q1" | "Q2" | "Q3" | "Q4", string[]> = {
  Q1: ["January", "February", "March"],
  Q2: ["April", "May", "June"],
  Q3: ["July", "August", "September"],
  Q4: ["October", "November", "December"],
};

const generateMonthlySuggestions = (
  annualGoal: AnnualGoal,
  quarter: "Q1" | "Q2" | "Q3" | "Q4"
): MonthlySuggestion[] => {
  const months = quarterMonths[quarter];
  const title = annualGoal.title.toLowerCase();
  
  // Generate creative suggestions based on goal type
  const suggestions: MonthlySuggestion[] = months.map((month, index) => {
    const phase = index === 0 ? "Foundation" : index === 1 ? "Build" : "Complete";
    
    // Smart suggestions based on common goal patterns
    let focus = "";
    let milestones: string[] = [];
    
    if (title.includes("learn") || title.includes("skill") || title.includes("study")) {
      focus = `${phase} your learning journey`;
      milestones = [
        index === 0 ? "Set up learning resources and schedule" : "",
        index === 1 ? "Complete first milestone or module" : "",
        index === 2 ? "Apply knowledge in a project" : "",
      ].filter(Boolean);
    } else if (title.includes("fitness") || title.includes("exercise") || title.includes("health")) {
      focus = `${phase} your fitness routine`;
      milestones = [
        index === 0 ? "Establish baseline and create workout plan" : "",
        index === 1 ? "Increase intensity or frequency" : "",
        index === 2 ? "Achieve target milestone or maintain consistency" : "",
      ].filter(Boolean);
    } else if (title.includes("career") || title.includes("job") || title.includes("work")) {
      focus = `${phase} your professional growth`;
      milestones = [
        index === 0 ? "Identify opportunities and set targets" : "",
        index === 1 ? "Take action steps or complete projects" : "",
        index === 2 ? "Review progress and plan next steps" : "",
      ].filter(Boolean);
    } else {
      // Generic suggestions
      focus = `${phase} your progress`;
      milestones = [
        index === 0 ? "Break down goal into actionable steps" : "",
        index === 1 ? "Make significant progress on key milestones" : "",
        index === 2 ? "Complete major milestone or prepare for next quarter" : "",
      ].filter(Boolean);
    }
    
    return {
      month,
      focus,
      milestones,
    };
  });
  
  return suggestions;
};

const QuarterlyGoals = ({
  annualGoals,
  goalAssignments,
  goals,
  onGoalsChange,
  onNext,
  onBack,
}: QuarterlyGoalsProps) => {
  const [selectedQuarter, setSelectedQuarter] = useState<"Q1" | "Q2" | "Q3" | "Q4" | null>(null);
  const [acceptedSuggestions, setAcceptedSuggestions] = useState<Set<string>>(new Set());
  const [aiGenerating, setAiGenerating] = useState<string | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<Record<string, MonthlySuggestion[]>>({});

  const quarters = ["Q1", "Q2", "Q3", "Q4"] as const;
  
  const getGoalsForQuarter = (quarter: "Q1" | "Q2" | "Q3" | "Q4") => {
    return annualGoals.filter(goal => {
      const assignment = goalAssignments.find(a => a.annualGoalId === goal.id);
      return assignment?.quarter === quarter;
    });
  };

  const handleAcceptSuggestion = (goalId: string, quarter: "Q1" | "Q2" | "Q3" | "Q4", suggestions: MonthlySuggestion[]) => {
    // Create quarterly goals from suggestions
    const newGoals: QuarterlyGoal[] = suggestions.map((suggestion, index) => ({
      id: crypto.randomUUID(),
      category: "personal" as const, // Could be determined from goal
      title: `${suggestion.month}: ${suggestion.focus}`,
      whyItMatters: suggestion.milestones.join(", "),
      difficulty: index === 0 ? "light" as const : index === 1 ? "balanced" as const : "stretch" as const,
      quarter,
      annualGoalId: goalId,
    }));
    
    onGoalsChange([...goals, ...newGoals]);
    setAcceptedSuggestions(prev => new Set([...prev, `${goalId}-${quarter}`]));
  };

  const generateAIBreakdown = async (goal: AnnualGoal, quarter: "Q1" | "Q2" | "Q3" | "Q4") => {
    const key = `${goal.id}-${quarter}`;
    setAiGenerating(key);
    
    try {
      const { data, error } = await supabase.functions.invoke('breakdown-goal', {
        body: {
          goalTitle: goal.title,
          goalDescription: goal.description,
          breakdownType: 'monthly'
        }
      });

      if (error) throw error;

      // Extract monthly suggestions for the specific quarter
      const monthlyData = data.monthly?.[quarter];
      if (monthlyData) {
        const suggestions: MonthlySuggestion[] = Object.entries(monthlyData).map(([month, data]: [string, any]) => ({
          month,
          focus: data.focus || `${month} focus`,
          milestones: data.milestones || []
        }));
        
        setAiSuggestions(prev => ({ ...prev, [key]: suggestions }));
        toast.success("AI breakdown generated successfully!");
      } else {
        toast.error("Could not generate breakdown for this quarter");
      }
    } catch (error) {
      console.error("Failed to generate AI breakdown:", error);
      toast.error("Failed to generate AI breakdown. Please try again.");
    } finally {
      setAiGenerating(null);
    }
  };

  const currentQuarterGoals = selectedQuarter ? getGoalsForQuarter(selectedQuarter) : [];

  return (
    <div className="min-h-screen flex flex-col px-6 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Monthly Breakdown Suggestions</h1>
          <p className="text-muted-foreground text-sm">Step 3 of 4</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-muted-foreground mb-6"
        >
          We'll help you break down your annual goals into monthly milestones
        </motion.p>

        {/* Quarter Selector */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {quarters.map((quarter) => {
            const quarterGoals = getGoalsForQuarter(quarter);
            return (
              <button
                key={quarter}
                onClick={() => setSelectedQuarter(quarter)}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors",
                  selectedQuarter === quarter
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                {quarter} ({quarterGoals.length})
              </button>
            );
          })}
        </div>

        {/* Suggestions for Selected Quarter */}
        {selectedQuarter && (
          <div className="flex-1 space-y-6 overflow-y-auto">
            <AnimatePresence mode="popLayout">
              {currentQuarterGoals.map((goal, index) => {
                const suggestionKey = `${goal.id}-${selectedQuarter}`;
                const isAccepted = acceptedSuggestions.has(suggestionKey);
                const hasAISuggestions = aiSuggestions[suggestionKey];
                const suggestions = hasAISuggestions 
                  ? aiSuggestions[suggestionKey]
                  : generateMonthlySuggestions(goal, selectedQuarter);
                const isGenerating = aiGenerating === suggestionKey;
                
                return (
                  <motion.div
                    key={goal.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-card rounded-xl p-6 border border-border shadow-sm"
                  >
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-foreground mb-1">
                        {goal.title}
                      </h3>
                      {goal.description && (
                        <p className="text-sm text-muted-foreground">{goal.description}</p>
                      )}
                    </div>

                    {!isAccepted ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Lightbulb className="w-4 h-4 text-amber-500" />
                            <span>
                              {hasAISuggestions ? "AI-generated" : "Suggested"} monthly breakdown for {selectedQuarter}
                            </span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => generateAIBreakdown(goal, selectedQuarter!)}
                            disabled={isGenerating}
                            className="text-xs"
                          >
                            {isGenerating ? (
                              <>
                                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                Generating...
                              </>
                            ) : (
                              <>
                                <Wand2 className="w-3 h-3 mr-1" />
                                AI Breakdown
                              </>
                            )}
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {suggestions.map((suggestion, idx) => (
                            <div
                              key={idx}
                              className="bg-muted/50 rounded-lg p-4 border border-border/50"
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <Calendar className="w-4 h-4 text-primary" />
                                <span className="font-semibold text-sm text-foreground">
                                  {suggestion.month}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {suggestion.focus}
                              </p>
                              <ul className="text-xs text-muted-foreground space-y-1">
                                {suggestion.milestones.map((milestone, mIdx) => (
                                  <li key={mIdx} className="flex items-start gap-2">
                                    <Check className="w-3 h-3 mt-0.5 text-emerald-500 flex-shrink-0" />
                                    <span>{milestone}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>

                        <Button
                          onClick={() => handleAcceptSuggestion(goal.id, selectedQuarter, suggestions)}
                          className="w-full rounded-xl"
                        >
                          <Sparkles className="w-4 h-4 mr-2" />
                          Accept This Plan
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3">
                        <Check className="w-4 h-4" />
                        <span>Monthly breakdown accepted and added to your goals</span>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {currentQuarterGoals.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                No goals assigned to {selectedQuarter}
              </div>
            )}
          </div>
        )}

        {!selectedQuarter && (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Select a quarter to see monthly suggestions
          </div>
        )}

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 pb-8"
        >
          <Button
            onClick={onNext}
            disabled={goals.length === 0}
            size="lg"
            className="w-full h-14 text-lg font-semibold rounded-xl disabled:opacity-50"
          >
            Continue
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          {goals.length === 0 && (
            <p className="text-center text-sm text-muted-foreground mt-3">
              Accept at least one monthly breakdown to continue
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default QuarterlyGoals;
