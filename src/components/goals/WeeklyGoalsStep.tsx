import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, CalendarDays, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import VoiceInput from "@/components/VoiceInput";
import { format, startOfWeek } from "date-fns";

interface MonthlyGoal {
  id: string;
  title: string;
}

interface WeeklyGoal {
  id: string;
  monthly_goal_id: string | null;
  title: string;
  week_start: string;
}

interface WeeklyGoalsStepProps {
  monthlyGoals: MonthlyGoal[];
  weeklyGoals: WeeklyGoal[];
  currentWeekStart: string;
  onAddGoal: (monthlyGoalId: string | null, title: string) => void;
  onRemoveGoal: (id: string) => void;
}

const WeeklyGoalsStep = ({
  monthlyGoals,
  weeklyGoals,
  currentWeekStart,
  onAddGoal,
  onRemoveGoal,
}: WeeklyGoalsStepProps) => {
  const [expandedGoal, setExpandedGoal] = useState<string | null>(monthlyGoals[0]?.id || null);
  const [newGoals, setNewGoals] = useState<Record<string, string>>({});

  const weekStartDate = new Date(currentWeekStart);
  const weekEndDate = new Date(weekStartDate);
  weekEndDate.setDate(weekEndDate.getDate() + 6);
  const weekRange = `${format(weekStartDate, "MMM d")} - ${format(weekEndDate, "MMM d")}`;

  const getWeeklyGoalsForMonthly = (monthlyGoalId: string) =>
    weeklyGoals.filter(g => g.monthly_goal_id === monthlyGoalId && g.week_start === currentWeekStart);

  const handleAdd = (monthlyGoalId: string, text: string) => {
    const trimmed = text.trim();
    if (trimmed) {
      onAddGoal(monthlyGoalId, trimmed);
      setNewGoals(prev => ({ ...prev, [monthlyGoalId]: "" }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/10 mb-2">
          <CalendarDays className="w-8 h-8 text-emerald-500" />
        </div>
        <h2 className="text-2xl font-display font-bold">
          What can you do this week?
        </h2>
        <p className="text-muted-foreground">
          Week of {weekRange} — create simple, actionable tasks
        </p>
      </div>

      {/* Monthly Goals Accordion */}
      <div className="max-w-lg mx-auto space-y-3">
        {monthlyGoals.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No monthly goals yet. Go back and add some first!</p>
          </div>
        ) : (
          monthlyGoals.map((monthlyGoal) => {
            const isExpanded = expandedGoal === monthlyGoal.id;
            const weeklyForThis = getWeeklyGoalsForMonthly(monthlyGoal.id);

            return (
              <motion.div
                key={monthlyGoal.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-border bg-card overflow-hidden"
              >
                {/* Monthly Goal Header */}
                <button
                  onClick={() => setExpandedGoal(isExpanded ? null : monthlyGoal.id)}
                  className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <span className="text-sm font-semibold text-emerald-500">
                        {weeklyForThis.length}
                      </span>
                    </div>
                    <span className="font-medium text-left">{monthlyGoal.title}</span>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </button>

                {/* Weekly Goals List */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-border"
                    >
                      <div className="p-4 space-y-3">
                        {/* Existing weekly goals */}
                        {weeklyForThis.map((goal, index) => (
                          <motion.div
                            key={goal.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 group"
                          >
                            <div className="w-2 h-2 rounded-full bg-emerald-500/60" />
                            <span className="flex-1 text-sm">{goal.title}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => onRemoveGoal(goal.id)}
                            >
                              <X className="w-4 h-4 text-destructive" />
                            </Button>
                          </motion.div>
                        ))
                        }

                        {/* Add new weekly goal */}
                        <div className="space-y-2">
                          <VoiceInput
                            onTranscript={(text) => handleAdd(monthlyGoal.id, text)}
                            placeholder="Speak your weekly action..."
                          />
                          <div className="flex gap-2">
                            <Input
                              value={newGoals[monthlyGoal.id] || ""}
                              onChange={(e) => setNewGoals(prev => ({ ...prev, [monthlyGoal.id]: e.target.value }))}
                              onKeyDown={(e) => e.key === "Enter" && handleAdd(monthlyGoal.id, newGoals[monthlyGoal.id] || "")}
                              placeholder="e.g., Exercise 3 times this week"
                              className="rounded-xl h-10 text-sm"
                            />
                            <Button
                              onClick={() => handleAdd(monthlyGoal.id, newGoals[monthlyGoal.id] || "")}
                              disabled={!newGoals[monthlyGoal.id]?.trim()}
                              size="sm"
                              className="rounded-xl h-10"
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Tips */}
      <div className="max-w-lg mx-auto text-center">
        <p className="text-sm text-muted-foreground">
          💡 Keep actions specific: "Walk 20 minutes daily" instead of "Exercise more"
        </p>
      </div>
    </div>
  );
};

export default WeeklyGoalsStep;
