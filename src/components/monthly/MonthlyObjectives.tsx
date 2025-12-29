import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Plus, X, Heart, Briefcase, Dumbbell, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { MonthlyGoalStatus } from "./MonthlyGoalRefinement";

export interface MonthlyObjective {
  id: string;
  goalId: string;
  title: string;
  successIndicator: string;
  effort: "small" | "medium" | "large";
}

interface QuarterlyGoal {
  id: string;
  category: string;
  title: string;
}

interface MonthlyObjectivesProps {
  selectedMonth: Date;
  quarterlyGoals: QuarterlyGoal[];
  activeGoalIds: string[];
  objectives: MonthlyObjective[];
  onObjectivesChange: (objectives: MonthlyObjective[]) => void;
  onNext: () => void;
  onBack: () => void;
}

const categoryIcons: Record<string, React.ElementType> = {
  personal: Heart,
  professional: Briefcase,
  fitness: Dumbbell,
};

const categoryColors: Record<string, { bg: string; text: string }> = {
  personal: { bg: "bg-rose-100 dark:bg-rose-900/30", text: "text-rose-600" },
  professional: { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-600" },
  fitness: { bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-600" },
};

const effortConfig = {
  small: { label: "S", color: "bg-green-100 text-green-700 dark:bg-green-900/30" },
  medium: { label: "M", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30" },
  large: { label: "L", color: "bg-red-100 text-red-700 dark:bg-red-900/30" },
};

const MonthlyObjectives = ({
  selectedMonth,
  quarterlyGoals,
  activeGoalIds,
  objectives,
  onObjectivesChange,
  onNext,
  onBack,
}: MonthlyObjectivesProps) => {
  const [expandedGoals, setExpandedGoals] = useState<string[]>(activeGoalIds);
  const [newObjective, setNewObjective] = useState<Record<string, { title: string; indicator: string }>>({});

  const activeGoals = quarterlyGoals.filter((g) => activeGoalIds.includes(g.id));

  const toggleExpanded = (goalId: string) => {
    setExpandedGoals((prev) =>
      prev.includes(goalId) ? prev.filter((id) => id !== goalId) : [...prev, goalId]
    );
  };

  const addObjective = (goalId: string) => {
    const input = newObjective[goalId];
    if (!input?.title.trim()) return;

    const newObj: MonthlyObjective = {
      id: crypto.randomUUID(),
      goalId,
      title: input.title,
      successIndicator: input.indicator || "",
      effort: "medium",
    };

    onObjectivesChange([...objectives, newObj]);
    setNewObjective((prev) => ({ ...prev, [goalId]: { title: "", indicator: "" } }));
  };

  const removeObjective = (id: string) => {
    onObjectivesChange(objectives.filter((o) => o.id !== id));
  };

  const setEffort = (id: string, effort: "small" | "medium" | "large") => {
    onObjectivesChange(
      objectives.map((o) => (o.id === id ? { ...o, effort } : o))
    );
  };

  const getObjectivesForGoal = (goalId: string) =>
    objectives.filter((o) => o.goalId === goalId);

  return (
    <div className="min-h-screen flex flex-col px-6 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Monthly Objectives</h1>
          <p className="text-muted-foreground text-sm">
            {format(selectedMonth, "MMMM")} • Step 3 of 4
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col max-w-lg mx-auto w-full">
        <p className="text-muted-foreground mb-6">
          Break each active goal into 1–3 deliverables
        </p>

        <div className="space-y-4 flex-1">
          {activeGoals.map((goal, index) => {
            const Icon = categoryIcons[goal.category] || Heart;
            const colors = categoryColors[goal.category] || categoryColors.personal;
            const isExpanded = expandedGoals.includes(goal.id);
            const goalObjectives = getObjectivesForGoal(goal.id);
            const input = newObjective[goal.id] || { title: "", indicator: "" };

            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="rounded-xl border bg-card overflow-hidden"
              >
                <button
                  onClick={() => toggleExpanded(goal.id)}
                  className="w-full p-4 flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", colors.bg)}>
                      <Icon className={cn("w-4 h-4", colors.text)} />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{goal.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {goalObjectives.length} objective{goalObjectives.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t"
                    >
                      <div className="p-4 space-y-3">
                        {/* Existing Objectives */}
                        {goalObjectives.map((obj) => (
                          <div
                            key={obj.id}
                            className="flex items-center gap-2 bg-muted/50 rounded-lg p-3"
                          >
                            <div className="flex-1">
                              <p className="text-sm font-medium text-foreground">
                                {obj.title}
                              </p>
                              {obj.successIndicator && (
                                <p className="text-xs text-muted-foreground">
                                  ✓ {obj.successIndicator}
                                </p>
                              )}
                            </div>
                            <div className="flex gap-1">
                              {(["small", "medium", "large"] as const).map((e) => (
                                <button
                                  key={e}
                                  onClick={() => setEffort(obj.id, e)}
                                  className={cn(
                                    "w-6 h-6 rounded text-xs font-bold transition-all",
                                    obj.effort === e
                                      ? effortConfig[e].color
                                      : "bg-muted text-muted-foreground"
                                  )}
                                >
                                  {effortConfig[e].label}
                                </button>
                              ))}
                            </div>
                            <button
                              onClick={() => removeObjective(obj.id)}
                              className="text-muted-foreground hover:text-destructive"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}

                        {/* Add New Objective */}
                        {goalObjectives.length < 3 && (
                          <div className="space-y-2">
                            <Input
                              placeholder="Add objective..."
                              value={input.title}
                              onChange={(e) =>
                                setNewObjective((prev) => ({
                                  ...prev,
                                  [goal.id]: { ...input, title: e.target.value },
                                }))
                              }
                              className="bg-background"
                            />
                            <div className="flex gap-2">
                              <Input
                                placeholder="Success indicator (optional)"
                                value={input.indicator}
                                onChange={(e) =>
                                  setNewObjective((prev) => ({
                                    ...prev,
                                    [goal.id]: { ...input, indicator: e.target.value },
                                  }))
                                }
                                className="bg-background text-sm"
                              />
                              <Button
                                size="icon"
                                onClick={() => addObjective(goal.id)}
                                disabled={!input.title.trim()}
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-8 pt-4">
          <Button
            onClick={onNext}
            size="lg"
            className="w-full h-14 text-lg font-semibold rounded-xl"
            disabled={objectives.length === 0}
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MonthlyObjectives;
