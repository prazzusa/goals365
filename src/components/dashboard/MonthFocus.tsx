import { motion } from "framer-motion";
import { ChevronRight, Circle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface MonthGoal {
  id: string;
  title: string;
  priority: "low" | "medium" | "high";
  progress: number;
  target?: number;
  current?: number;
}

interface MonthFocusProps {
  goals: MonthGoal[];
  onViewDetails?: () => void;
}

const priorityLabels = {
  low: "Light Focus",
  medium: "Medium Focus",
  high: "High Focus",
};

const priorityColors = {
  low: "text-muted-foreground",
  medium: "text-blue-500",
  high: "text-emerald-500",
};

const MonthFocus = ({ goals, onViewDetails }: MonthFocusProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-card rounded-2xl p-5 shadow-sm border border-border/50"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">This Month</h2>
        {onViewDetails && (
          <button onClick={onViewDetails} className="text-muted-foreground hover:text-foreground">
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="space-y-4">
        {goals.map((goal, index) => {
          const isComplete = goal.progress >= 100;
          const progressPercent = goal.target 
            ? Math.round((goal.current || 0) / goal.target * 100)
            : goal.progress;

          return (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.05 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isComplete ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Circle className="w-4 h-4 text-primary" />
                  )}
                  <span className="text-sm font-medium text-foreground">{goal.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  {goal.target ? (
                    <span className="text-xs text-muted-foreground">
                      {goal.current} of / {goal.target}
                    </span>
                  ) : (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                      {progressPercent}%
                    </span>
                  )}
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
              <div className="pl-6 space-y-1">
                <span className={cn("text-xs", priorityColors[goal.priority])}>
                  {priorityLabels[goal.priority]}
                </span>
                <Progress 
                  value={progressPercent} 
                  className={cn(
                    "h-1.5",
                    goal.priority === "high" && "[&>div]:bg-emerald-500",
                    goal.priority === "medium" && "[&>div]:bg-blue-500",
                    goal.priority === "low" && "[&>div]:bg-muted-foreground"
                  )}
                />
              </div>
            </motion.div>
          );
        })}

        {goals.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No monthly goals set yet
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default MonthFocus;
