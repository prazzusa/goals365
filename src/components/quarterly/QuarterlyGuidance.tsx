import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Calendar,
  Check,
  Target,
  Wand2,
  Loader2,
} from "lucide-react";
import { QuarterlyGoal } from "./QuarterlyGoals";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface WeeklySuggestion {
  week: number;
  focus: string;
  actions: string[];
  theme: string;
}

interface QuarterlyGuidanceProps {
  goals: QuarterlyGoal[];
  onNext: () => void;
  onBack: () => void;
}

const generateWeeklySuggestions = (goal: QuarterlyGoal): WeeklySuggestion[] => {
  const title = goal.title.toLowerCase();
  const suggestions: WeeklySuggestion[] = [];
  
  for (let week = 1; week <= 12; week++) {
    let focus = "";
    let actions: string[] = [];
    let theme = "";
    
    if (week <= 3) {
      theme = "Foundation";
      focus = "Break down goal into actionable steps";
      actions = ["Research and gather information", "Create a detailed plan", "Set up tracking system"];
    } else if (week <= 6) {
      theme = "Build";
      focus = "Make significant progress";
      actions = ["Complete first major milestone", "Overcome initial challenges", "Build momentum"];
    } else if (week <= 9) {
      theme = "Accelerate";
      focus = "Achieve breakthrough progress";
      actions = ["Complete major milestones", "Solve complex challenges", "Build sustainable systems"];
    } else {
      theme = "Complete";
      focus = "Finish strong and prepare for next phase";
      actions = ["Complete remaining milestones", "Review progress and learnings", "Plan continuation strategy"];
    }
    
    suggestions.push({ week, focus, actions, theme });
  }
  
  return suggestions;
};

const QuarterlyGuidance = ({ goals, onNext, onBack }: QuarterlyGuidanceProps) => {
  const [selectedGoal, setSelectedGoal] = useState<QuarterlyGoal | null>(goals[0] || null);
  const [acceptedSuggestions, setAcceptedSuggestions] = useState<Set<string>>(new Set());
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<Record<string, WeeklySuggestion[]>>({});

  const handleAcceptSuggestions = (goalId: string) => {
    setAcceptedSuggestions(prev => new Set([...prev, goalId]));
  };

  const generateAIWeeklySuggestions = async (goal: QuarterlyGoal) => {
    setAiGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('breakdown-goal', {
        body: {
          goalTitle: goal.title,
          goalDescription: goal.whyItMatters,
          breakdownType: 'weekly'
        }
      });

      if (error) throw error;

      const weeklyData = data.weekly?.[goal.quarter || 'Q1'];
      if (weeklyData) {
        const allWeeks: WeeklySuggestion[] = [];
        Object.values(weeklyData).forEach((monthData: any) => {
          Object.entries(monthData).forEach(([week, weekData]: [string, any]) => {
            allWeeks.push({
              week: parseInt(week.replace('Week ', '')) || 1,
              focus: weekData.focus || '',
              actions: weekData.actions || [],
              theme: ''
            });
          });
        });

        allWeeks.forEach((suggestion) => {
          if (suggestion.week <= 3) suggestion.theme = "Foundation";
          else if (suggestion.week <= 6) suggestion.theme = "Build";
          else if (suggestion.week <= 9) suggestion.theme = "Accelerate";
          else suggestion.theme = "Complete";
        });

        setAiSuggestions(prev => ({ ...prev, [goal.id]: allWeeks }));
        toast.success("AI weekly suggestions generated!");
      } else {
        toast.error("Could not generate weekly breakdown");
      }
    } catch (error) {
      console.error("Failed to generate AI weekly suggestions:", error);
      toast.error("Failed to generate AI suggestions. Using default suggestions.");
    } finally {
      setAiGenerating(false);
    }
  };

  const selectedSuggestions = selectedGoal 
    ? (aiSuggestions[selectedGoal.id] || generateWeeklySuggestions(selectedGoal))
    : [];
  const groupedSuggestions = selectedSuggestions.reduce((acc, suggestion) => {
    if (!acc[suggestion.theme]) {
      acc[suggestion.theme] = [];
    }
    acc[suggestion.theme].push(suggestion);
    return acc;
  }, {} as Record<string, WeeklySuggestion[]>);

  return (
    <div className="min-h-screen flex flex-col px-6 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Weekly Action Suggestions</h1>
          <p className="text-muted-foreground text-sm">Step 4 of 4</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-muted-foreground mb-6"
        >
          Get creative weekly action plans to keep your momentum going
        </motion.p>

        {goals.length > 1 && (
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {goals.map((goal) => (
              <button
                key={goal.id}
                onClick={() => setSelectedGoal(goal)}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors",
                  selectedGoal?.id === goal.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                {goal.title.split(":")[0]}
              </button>
            ))}
          </div>
        )}

        {selectedGoal && !aiSuggestions[selectedGoal.id] && (
          <div className="mb-6 flex justify-center">
            <Button
              variant="outline"
              onClick={() => generateAIWeeklySuggestions(selectedGoal)}
              disabled={aiGenerating}
              className="gap-2"
            >
              {aiGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating AI Suggestions...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  Generate AI Weekly Plan
                </>
              )}
            </Button>
          </div>
        )}

        {selectedGoal && (
          <div className="flex-1 space-y-6 overflow-y-auto">
            {Object.entries(groupedSuggestions).map(([theme, suggestions], themeIndex) => (
              <motion.div
                key={theme}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: themeIndex * 0.1 }}
                className="bg-card rounded-xl p-6 border border-border shadow-sm"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Target className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{theme} Phase</h3>
                    <p className="text-xs text-muted-foreground">
                      Weeks {suggestions[0].week} - {suggestions[suggestions.length - 1].week}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {suggestions.map((suggestion) => (
                    <div key={suggestion.week} className="bg-muted/50 rounded-lg p-4 border border-border/50">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span className="font-semibold text-sm text-foreground">Week {suggestion.week}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{suggestion.focus}</p>
                      <ul className="text-xs text-muted-foreground space-y-1.5">
                        {suggestion.actions.map((action, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <Check className="w-3 h-3 mt-0.5 text-emerald-500 flex-shrink-0" />
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}

            {!acceptedSuggestions.has(selectedGoal.id) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t border-border pt-4"
              >
                <Button
                  onClick={() => handleAcceptSuggestions(selectedGoal.id)}
                  size="lg"
                  className="w-full rounded-xl"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Use These Weekly Suggestions
                </Button>
              </motion.div>
            )}
          </div>
        )}

        {goals.length === 0 && (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            No goals available. Please go back and complete previous steps.
          </div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 pb-8"
        >
          <Button onClick={onNext} size="lg" className="w-full h-14 text-lg font-semibold rounded-xl">
            Complete & Go to Dashboard
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default QuarterlyGuidance;
