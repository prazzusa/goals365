import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Calendar, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import VoiceInput from "@/components/VoiceInput";

interface YearlyGoal {
  id: string;
  title: string;
}

interface MonthlyGoal {
  id: string;
  yearly_goal_id: string | null;
  title: string;
  month: number;
  year: number;
}

interface MonthlyGoalsStepProps {
  yearlyGoals: YearlyGoal[];
  monthlyGoals: MonthlyGoal[];
  currentMonth: number;
  currentYear: number;
  onAddGoal: (yearlyGoalId: string | null, title: string) => void;
  onRemoveGoal: (id: string) => void;
}

const MonthlyGoalsStep = ({
  yearlyGoals,
  monthlyGoals,
  currentMonth,
  currentYear,
  onAddGoal,
  onRemoveGoal,
}: MonthlyGoalsStepProps) => {
  const [expandedGoal, setExpandedGoal] = useState<string | null>(yearlyGoals[0]?.id || null);
  const [newGoals, setNewGoals] = useState<Record<string, string>>({});

  const monthName = new Date(currentYear, currentMonth - 1).toLocaleString("default", { month: "long" });

  const getMonthlyGoalsForYearly = (yearlyGoalId: string) =>
    monthlyGoals.filter(
      g => g.yearly_goal_id === yearlyGoalId && g.month === currentMonth && g.year === currentYear
    );

  const handleAdd = (yearlyGoalId: string, text: string) => {
    const trimmed = text.trim();
    if (trimmed) {
      onAddGoal(yearlyGoalId, trimmed);
      setNewGoals(prev => ({ ...prev, [yearlyGoalId]: "" }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-2">
          <Calendar className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-display font-bold">
          What would progress look like this month?
        </h2>
        <p className="text-muted-foreground">
          Break your yearly goals into achievable steps for {monthName}
        </p>
      </div>

      {/* Yearly Goals Accordion */}
      <div className="max-w-lg mx-auto space-y-3">
        {yearlyGoals.map((yearlyGoal) => {
          const isExpanded = expandedGoal === yearlyGoal.id;
          const monthlyForThis = getMonthlyGoalsForYearly(yearlyGoal.id);

          return (
            <motion.div
              key={yearlyGoal.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-border bg-card overflow-hidden"
            >
              {/* Yearly Goal Header */}
              <button
                onClick={() => setExpandedGoal(isExpanded ? null : yearlyGoal.id)}
                className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-semibold text-primary">
                      {monthlyForThis.length}
                    </span>
                  </div>
                  <span className="font-medium text-left">{yearlyGoal.title}</span>
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                )}
              </button>

              {/* Monthly Goals List */}
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
                      {/* Existing monthly goals */}
                      {monthlyForThis.map((goal, index) => (
                        <motion.div
                          key={goal.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 group"
                        >
                          <div className="w-2 h-2 rounded-full bg-primary/60" />
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
                      ))}

                      {/* Add new monthly goal */}
                      <div className="space-y-2">
                        <VoiceInput
                          onTranscript={(text) => handleAdd(yearlyGoal.id, text)}
                          placeholder="Speak your monthly goal..."
                        />
                        <div className="flex gap-2">
                          <Input
                            value={newGoals[yearlyGoal.id] || ""}
                            onChange={(e) => setNewGoals(prev => ({ ...prev, [yearlyGoal.id]: e.target.value }))}
                            onKeyDown={(e) => e.key === "Enter" && handleAdd(yearlyGoal.id, newGoals[yearlyGoal.id] || "")}
                            placeholder="What small step can you take this month?"
                            className="rounded-xl h-10 text-sm"
                          />
                          <Button
                            onClick={() => handleAdd(yearlyGoal.id, newGoals[yearlyGoal.id] || "")}
                            disabled={!newGoals[yearlyGoal.id]?.trim()}
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
        })}
      </div>

      {/* Encouragement */}
      <p className="text-center text-sm text-muted-foreground">
        Focus on 1-3 monthly steps per goal to stay manageable
      </p>
    </div>
  );
};

export default MonthlyGoalsStep;
