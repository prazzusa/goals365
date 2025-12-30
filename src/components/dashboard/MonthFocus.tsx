import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ReflectionDialog from "./ReflectionDialog";
import GoalDetailDialog from "./GoalDetailDialog";
import { getMonth, getYear } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";

type Status = "todo" | "in_progress" | "done";

interface MonthGoal {
  id: string;
  title: string;
  priority: "low" | "medium" | "high";
  progress: number;
  status?: Status;
  target?: number;
  current?: number;
}

interface MonthFocusProps {
  goals: MonthGoal[];
  onViewDetails?: () => void;
  onStatusChange?: (goalId: string, status: Status) => void;
  onReflectionClick?: () => void;
}

const statusConfig: Record<Status, { label: string; bgColor: string; borderColor: string; textColor: string }> = {
  todo: { 
    label: "To Do", 
    bgColor: "bg-slate-50 dark:bg-slate-900/50",
    borderColor: "border-slate-200 dark:border-slate-800",
    textColor: "text-slate-700 dark:text-slate-300"
  },
  in_progress: { 
    label: "In Progress", 
    bgColor: "bg-blue-50 dark:bg-blue-900/30",
    borderColor: "border-blue-200 dark:border-blue-800",
    textColor: "text-blue-700 dark:text-blue-300"
  },
  done: { 
    label: "Done", 
    bgColor: "bg-emerald-50 dark:bg-emerald-900/30",
    borderColor: "border-emerald-200 dark:border-emerald-800",
    textColor: "text-emerald-700 dark:text-emerald-300"
  },
};

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

const MonthFocus = ({ goals, onViewDetails, onStatusChange, onReflectionClick }: MonthFocusProps) => {
  const [showReflection, setShowReflection] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<MonthGoal | null>(null);
  const { user } = useAuth();

  const handleStatusChange = (goalId: string, newStatus: Status) => {
    if (onStatusChange) {
      onStatusChange(goalId, newStatus);
    }
  };

  const handleSaveReflection = (reflection: any) => {
    // Save reflection to database
    console.log("Saving monthly reflection:", reflection);
    // TODO: Implement save to database
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-card rounded-2xl p-5 shadow-sm border border-border/50"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">This Month</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (onReflectionClick) {
              onReflectionClick();
            } else {
              setShowReflection(true);
            }
          }}
          className="rounded-xl gap-2"
        >
          <BookOpen className="w-4 h-4" />
          Reflection
        </Button>
      </div>

      <div className="space-y-2">
        {goals.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No monthly goals set yet
          </p>
        ) : (
          <AnimatePresence>
            {goals.map((goal, index) => {
              const currentStatus = (goal.status || "todo") as Status;
              const config = statusConfig[currentStatus];
              const progressPercent = goal.target 
                ? Math.round((goal.current || 0) / goal.target * 100)
                : goal.progress;

              return (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    "p-4 rounded-xl border-2 transition-all cursor-pointer hover:shadow-md",
                    config.bgColor,
                    config.borderColor
                  )}
                  onClick={(e) => {
                    // Don't open dialog if clicking on dropdown
                    if ((e.target as HTMLElement).closest('[role="menu"]') || 
                        (e.target as HTMLElement).closest('button')) {
                      return;
                    }
                    setSelectedGoal(goal);
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1">
                      <p className={cn("font-medium text-sm", config.textColor)}>
                        {goal.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={cn("text-xs", priorityColors[goal.priority])}>
                          {priorityLabels[goal.priority]}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {progressPercent}%
                        </span>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={cn("rounded-lg", config.textColor)}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {config.label}
                          <ChevronDown className="w-4 h-4 ml-1" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChange(goal.id, "todo");
                          }}
                          className={currentStatus === "todo" ? "bg-muted" : ""}
                        >
                          To Do
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChange(goal.id, "in_progress");
                          }}
                          className={currentStatus === "in_progress" ? "bg-muted" : ""}
                        >
                          In Progress
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChange(goal.id, "done");
                          }}
                          className={currentStatus === "done" ? "bg-muted" : ""}
                        >
                          Done
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      <ReflectionDialog
        open={showReflection}
        onClose={() => setShowReflection(false)}
        onSave={handleSaveReflection}
        type="monthly"
        userId={user?.id}
        month={getMonth(new Date()) + 1}
        year={getYear(new Date())}
      />

      {selectedGoal && (
        <GoalDetailDialog
          open={!!selectedGoal}
          onClose={() => setSelectedGoal(null)}
          goal={{
            id: selectedGoal.id,
            title: selectedGoal.title,
            type: "monthly",
            status: selectedGoal.status,
            priority: selectedGoal.priority,
            progress: selectedGoal.progress,
          }}
          onStatusChange={(goalId, status) => {
            handleStatusChange(goalId, status);
            setSelectedGoal(null);
          }}
        />
      )}
    </motion.div>
  );
};

export default MonthFocus;
