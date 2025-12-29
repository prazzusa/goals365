import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Heart, Briefcase, Dumbbell } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export interface MonthlyGoalStatus {
  goalId: string;
  isActive: boolean;
  priority: "low" | "medium" | "high";
}

interface QuarterlyGoal {
  id: string;
  category: string;
  title: string;
}

interface MonthlyGoalRefinementProps {
  selectedMonth: Date;
  quarterlyGoals: QuarterlyGoal[];
  goalStatuses: MonthlyGoalStatus[];
  onStatusChange: (statuses: MonthlyGoalStatus[]) => void;
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

const priorityConfig = {
  low: { label: "Low", bg: "bg-slate-100 dark:bg-slate-800", text: "text-slate-600 dark:text-slate-400" },
  medium: { label: "Medium", bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-600" },
  high: { label: "High", bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-600" },
};

const MonthlyGoalRefinement = ({
  selectedMonth,
  quarterlyGoals,
  goalStatuses,
  onStatusChange,
  onNext,
  onBack,
}: MonthlyGoalRefinementProps) => {
  const toggleActive = (goalId: string) => {
    const updated = goalStatuses.map((gs) =>
      gs.goalId === goalId ? { ...gs, isActive: !gs.isActive } : gs
    );
    onStatusChange(updated);
  };

  const setPriority = (goalId: string, priority: "low" | "medium" | "high") => {
    const updated = goalStatuses.map((gs) =>
      gs.goalId === goalId ? { ...gs, priority } : gs
    );
    onStatusChange(updated);
  };

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
          <h1 className="text-2xl font-bold text-foreground">Refine Goals</h1>
          <p className="text-muted-foreground text-sm">
            {format(selectedMonth, "MMMM")} • Step 2 of 4
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col max-w-lg mx-auto w-full">
        <p className="text-muted-foreground mb-6">
          "What progress would feel meaningful this month?"
        </p>

        <div className="space-y-4 flex-1">
          {quarterlyGoals.map((goal, index) => {
            const status = goalStatuses.find((gs) => gs.goalId === goal.id);
            const Icon = categoryIcons[goal.category] || Heart;
            const colors = categoryColors[goal.category] || categoryColors.personal;

            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "p-4 rounded-xl border transition-all",
                  status?.isActive ? "border-primary bg-primary/5" : "border-border opacity-60"
                )}
              >
                <div className="flex items-start gap-3 mb-3">
                  <button
                    onClick={() => toggleActive(goal.id)}
                    className={cn(
                      "w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors",
                      status?.isActive
                        ? "bg-primary border-primary"
                        : "border-muted-foreground"
                    )}
                  >
                    {status?.isActive && (
                      <svg
                        className="w-3 h-3 text-primary-foreground"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </button>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className={cn("w-6 h-6 rounded-lg flex items-center justify-center", colors.bg)}>
                        <Icon className={cn("w-3 h-3", colors.text)} />
                      </div>
                      <span className="text-sm text-muted-foreground capitalize">
                        {goal.category}
                      </span>
                    </div>
                    <p className="font-medium text-foreground">{goal.title}</p>
                  </div>
                </div>

                {status?.isActive && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="flex gap-2 mt-3 pt-3 border-t"
                  >
                    {(["low", "medium", "high"] as const).map((p) => (
                      <button
                        key={p}
                        onClick={() => setPriority(goal.id, p)}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                          status.priority === p
                            ? priorityConfig[p].bg + " " + priorityConfig[p].text
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        )}
                      >
                        {priorityConfig[p].label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>

        <div className="mt-8 pt-4">
          <Button
            onClick={onNext}
            size="lg"
            className="w-full h-14 text-lg font-semibold rounded-xl"
            disabled={!goalStatuses.some((gs) => gs.isActive)}
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MonthlyGoalRefinement;
