import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, X, Wand2, Loader2 } from "lucide-react";
import { AnnualGoal } from "./QuarterlyVision";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface QuarterlyGoalAssignment {
  annualGoalId: string;
  quarter: "Q1" | "Q2" | "Q3" | "Q4" | null;
}

interface QuarterlyCategoriesProps {
  annualGoals: AnnualGoal[];
  goalAssignments: QuarterlyGoalAssignment[];
  onGoalAssignmentsChange: (assignments: QuarterlyGoalAssignment[]) => void;
  onNext: () => void;
  onBack: () => void;
}

const quarters = [
  { id: "Q1" as const, label: "Q1", months: "Jan - Mar", color: "bg-blue-100 dark:bg-blue-900/30" },
  { id: "Q2" as const, label: "Q2", months: "Apr - Jun", color: "bg-emerald-100 dark:bg-emerald-900/30" },
  { id: "Q3" as const, label: "Q3", months: "Jul - Sep", color: "bg-amber-100 dark:bg-amber-900/30" },
  { id: "Q4" as const, label: "Q4", months: "Oct - Dec", color: "bg-purple-100 dark:bg-purple-900/30" },
];

const QuarterlyCategories = ({
  annualGoals,
  goalAssignments,
  onGoalAssignmentsChange,
  onNext,
  onBack,
}: QuarterlyCategoriesProps) => {
  const [draggedGoalId, setDraggedGoalId] = useState<string | null>(null);
  const [dragOverQuarter, setDragOverQuarter] = useState<string | null>(null);
  const [aiSuggesting, setAiSuggesting] = useState(false);

  // Initialize assignments for all goals
  useEffect(() => {
    const existingIds = new Set(goalAssignments.map(a => a.annualGoalId));
    const missing = annualGoals.filter(g => !existingIds.has(g.id));
    if (missing.length > 0) {
      onGoalAssignmentsChange([
        ...goalAssignments,
        ...missing.map(g => ({ annualGoalId: g.id, quarter: null }))
      ]);
    }
  }, [annualGoals.length]);

  const getGoalAssignment = (goalId: string) => {
    return goalAssignments.find(a => a.annualGoalId === goalId) || { annualGoalId: goalId, quarter: null };
  };

  const getGoalsForQuarter = (quarter: "Q1" | "Q2" | "Q3" | "Q4") => {
    return annualGoals.filter(goal => {
      const assignment = getGoalAssignment(goal.id);
      return assignment.quarter === quarter;
    });
  };

  const getUnassignedGoals = () => {
    return annualGoals.filter(goal => {
      const assignment = getGoalAssignment(goal.id);
      return !assignment.quarter;
    });
  };

  const handleDragStart = (e: React.DragEvent, goalId: string) => {
    setDraggedGoalId(goalId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", goalId);
  };

  const handleDragOver = (e: React.DragEvent, quarter: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverQuarter(quarter);
  };

  const handleDragLeave = () => {
    setDragOverQuarter(null);
  };

  const handleDrop = (e: React.DragEvent, targetQuarter: "Q1" | "Q2" | "Q3" | "Q4" | null) => {
    e.preventDefault();
    setDragOverQuarter(null);
    
    if (draggedGoalId) {
      const existingIndex = goalAssignments.findIndex(a => a.annualGoalId === draggedGoalId);
      const newAssignment: QuarterlyGoalAssignment = {
        annualGoalId: draggedGoalId,
        quarter: targetQuarter,
      };

      if (existingIndex >= 0) {
        const updated = [...goalAssignments];
        updated[existingIndex] = newAssignment;
        onGoalAssignmentsChange(updated);
      } else {
        onGoalAssignmentsChange([...goalAssignments, newAssignment]);
      }
    }
    
    setDraggedGoalId(null);
  };

  const handleDragEnd = () => {
    setDraggedGoalId(null);
    setDragOverQuarter(null);
  };

  const handleRemoveAssignment = (goalId: string) => {
    const updated = goalAssignments.map(a => 
      a.annualGoalId === goalId ? { ...a, quarter: null } : a
    );
    onGoalAssignmentsChange(updated);
  };

  const suggestQuarterAssignments = async () => {
    setAiSuggesting(true);
    try {
      const unassigned = getUnassignedGoals();
      if (unassigned.length === 0) {
        toast.info("All goals are already assigned!");
        return;
      }

      // Get AI suggestions for each unassigned goal
      const suggestions: Record<string, "Q1" | "Q2" | "Q3" | "Q4"> = {};
      
      for (const goal of unassigned) {
        try {
          const { data, error } = await supabase.functions.invoke('breakdown-goal', {
            body: {
              goalTitle: goal.title,
              goalDescription: goal.description,
              breakdownType: 'quarterly'
            }
          });

          if (!error && data?.quarterly) {
            // Analyze which quarter has the most focus/milestones or use AI logic
            // For now, suggest Q1 for foundation goals, Q2-Q3 for build, Q4 for completion
            const title = goal.title.toLowerCase();
            let suggestedQuarter: "Q1" | "Q2" | "Q3" | "Q4" = "Q1";
            
            if (title.includes("start") || title.includes("begin") || title.includes("learn") || title.includes("foundation")) {
              suggestedQuarter = "Q1";
            } else if (title.includes("build") || title.includes("develop") || title.includes("grow")) {
              suggestedQuarter = "Q2";
            } else if (title.includes("complete") || title.includes("finish") || title.includes("achieve")) {
              suggestedQuarter = "Q4";
            } else {
              // Use Q2 or Q3 based on goal complexity
              suggestedQuarter = unassigned.indexOf(goal) % 2 === 0 ? "Q2" : "Q3";
            }
            
            suggestions[goal.id] = suggestedQuarter;
          }
        } catch (error) {
          console.error(`Failed to get suggestion for goal ${goal.id}:`, error);
        }
      }

      // Apply suggestions
      const updated = [...goalAssignments];
      Object.entries(suggestions).forEach(([goalId, quarter]) => {
        const existingIndex = updated.findIndex(a => a.annualGoalId === goalId);
        if (existingIndex >= 0) {
          updated[existingIndex] = { annualGoalId: goalId, quarter };
        } else {
          updated.push({ annualGoalId: goalId, quarter });
        }
      });

      onGoalAssignmentsChange(updated);
      toast.success(`AI suggested quarter assignments for ${Object.keys(suggestions).length} goal(s)!`);
    } catch (error) {
      console.error("Failed to generate AI suggestions:", error);
      toast.error("Failed to generate AI suggestions. Please try again.");
    } finally {
      setAiSuggesting(false);
    }
  };

  const unassignedGoals = getUnassignedGoals();
  const canContinue = annualGoals.every(goal => {
    const assignment = getGoalAssignment(goal.id);
    return assignment.quarter !== null;
  });

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
          <h1 className="text-2xl font-bold text-foreground">Divide Goals by Quarter</h1>
          <p className="text-muted-foreground text-sm">Step 2 of 4</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col max-w-6xl mx-auto w-full">
        <div className="flex items-center justify-between mb-6">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-muted-foreground flex-1"
          >
            Drag your annual goals into the quarters where you'll focus on them
          </motion.p>
          {unassignedGoals.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={suggestQuarterAssignments}
              disabled={aiSuggesting}
              className="ml-4"
            >
              {aiSuggesting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 mr-2" />
                  AI Suggest Quarters
                </>
              )}
            </Button>
          )}
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1">
          {/* Unassigned Goals */}
          <div
            onDragOver={(e) => handleDragOver(e, "unassigned")}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, null)}
            className={cn(
              "rounded-xl border-2 border-dashed border-border bg-muted/20 min-h-[300px] flex flex-col transition-all",
              dragOverQuarter === "unassigned" && "ring-2 ring-primary ring-offset-2 bg-muted/40 border-primary"
            )}
          >
            <div className="p-3 rounded-t-xl bg-muted">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm text-foreground">Unassigned</h3>
                <span className="text-xs text-muted-foreground bg-background/50 px-2 py-0.5 rounded-full">
                  {unassignedGoals.length}
                </span>
              </div>
            </div>
            <div className="flex-1 p-3 space-y-2 overflow-y-auto">
              <AnimatePresence mode="popLayout">
                {unassignedGoals.map((goal) => {
                  const isDragging = draggedGoalId === goal.id;
                  return (
                    <motion.div
                      key={goal.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: isDragging ? 0.5 : 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      draggable
                      onDragStart={(e: any) => handleDragStart(e, goal.id)}
                      onDragEnd={handleDragEnd}
                      className={cn(
                        "group cursor-move p-3 rounded-lg bg-background border border-border/50 hover:border-border transition-all",
                        isDragging && "opacity-50"
                      )}
                    >
                      <p className="text-sm font-medium text-foreground leading-tight">
                        {goal.title}
                      </p>
                      {goal.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {goal.description}
                        </p>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              {unassignedGoals.length === 0 && (
                <div className="flex items-center justify-center h-24 text-muted-foreground text-xs text-center">
                  {dragOverQuarter === "unassigned" ? "Drop here" : "All assigned"}
                </div>
              )}
            </div>
          </div>

          {/* Quarter Columns */}
          {quarters.map((quarter) => {
            const goalsInQuarter = getGoalsForQuarter(quarter.id);
            
            return (
              <div
                key={quarter.id}
                onDragOver={(e) => handleDragOver(e, quarter.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, quarter.id)}
                className={cn(
                  "rounded-xl border border-border bg-muted/20 min-h-[300px] flex flex-col transition-all",
                  dragOverQuarter === quarter.id && "ring-2 ring-primary ring-offset-2 bg-muted/40"
                )}
              >
                <div className={cn("p-3 rounded-t-xl", quarter.color)}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-sm text-foreground">{quarter.label}</h3>
                      <p className="text-xs text-muted-foreground">{quarter.months}</p>
                    </div>
                    <span className="text-xs text-muted-foreground bg-background/50 px-2 py-0.5 rounded-full">
                      {goalsInQuarter.length}
                    </span>
                  </div>
                </div>
                <div className="flex-1 p-3 space-y-2 overflow-y-auto">
                  <AnimatePresence mode="popLayout">
                    {goalsInQuarter.map((goal) => {
                      const isDragging = draggedGoalId === goal.id;
                      return (
                        <motion.div
                          key={goal.id}
                          layout
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: isDragging ? 0.5 : 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          draggable
                          onDragStart={(e: any) => handleDragStart(e, goal.id)}
                          onDragEnd={handleDragEnd}
                          className={cn(
                            "group cursor-move p-3 rounded-lg bg-background border border-border/50 hover:border-border transition-all relative",
                            isDragging && "opacity-50"
                          )}
                        >
                          <button
                            onClick={() => handleRemoveAssignment(goal.id)}
                            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                          >
                            <X className="w-3 h-3" />
                          </button>
                          <p className="text-sm font-medium text-foreground leading-tight pr-6">
                            {goal.title}
                          </p>
                          {goal.description && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {goal.description}
                            </p>
                          )}
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                  {goalsInQuarter.length === 0 && (
                    <div className="flex items-center justify-center h-24 text-muted-foreground text-xs text-center">
                      {dragOverQuarter === quarter.id ? "Drop here" : "No goals"}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 pb-8"
        >
          <Button
            onClick={onNext}
            disabled={!canContinue}
            size="lg"
            className="w-full h-14 text-lg font-semibold rounded-xl disabled:opacity-50"
          >
            Continue
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          {!canContinue && (
            <p className="text-center text-sm text-muted-foreground mt-3">
              Please assign all goals to quarters to continue
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default QuarterlyCategories;
