import { motion } from "framer-motion";
import { ChevronRight, Heart, Zap, Briefcase, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface QuarterGoal {
  id: string;
  title: string;
  category: "personal" | "professional" | "fitness";
  progress: number;
}

interface QuarterFocusProps {
  goals: QuarterGoal[];
  onViewDetails?: () => void;
}

const categoryConfig = {
  personal: {
    icon: Heart,
    color: "text-rose-500",
    bgColor: "bg-rose-100 dark:bg-rose-900/30",
    progressColor: "bg-rose-500",
  },
  professional: {
    icon: Briefcase,
    color: "text-blue-500",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    progressColor: "bg-blue-500",
  },
  fitness: {
    icon: Zap,
    color: "text-amber-500",
    bgColor: "bg-amber-100 dark:bg-amber-900/30",
    progressColor: "bg-amber-500",
  },
};

const QuarterFocus = ({ goals, onViewDetails }: QuarterFocusProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-card rounded-2xl p-5 shadow-sm border border-border/50"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">This Quarter's Focus</h2>
        {onViewDetails && (
          <button onClick={onViewDetails} className="text-muted-foreground hover:text-foreground">
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="space-y-3">
        {goals.map((goal, index) => {
          const config = categoryConfig[goal.category];
          const Icon = config.icon;
          const isComplete = goal.progress >= 100;

          return (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              className="flex items-center gap-3"
            >
              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", config.bgColor)}>
                <Icon className={cn("w-4 h-4", config.color)} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{goal.title}</p>
                {goal.progress > 0 && goal.progress < 100 && (
                  <Progress 
                    value={goal.progress} 
                    className="h-1.5 mt-1"
                  />
                )}
              </div>
              {isComplete && (
                <Check className="w-5 h-5 text-emerald-500" />
              )}
            </motion.div>
          );
        })}

        {goals.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No quarterly goals set yet
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default QuarterFocus;
