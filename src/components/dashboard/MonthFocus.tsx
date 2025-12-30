import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, BookOpen, Calendar, Flame } from "lucide-react";
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
import { getMonth, getYear, format } from "date-fns";
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

const statusConfig: Record<Status, { label: string; bgColor: string; borderColor: string; textColor: string; iconBg: string }> = {
  todo: { 
    label: "To Do", 
    bgColor: "bg-slate-50 dark:bg-slate-900/50",
    borderColor: "border-slate-200 dark:border-slate-800",
    textColor: "text-slate-700 dark:text-slate-300",
    iconBg: "bg-slate-200 dark:bg-slate-700"
  },
  in_progress: { 
    label: "In Progress", 
    bgColor: "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30",
    borderColor: "border-blue-300 dark:border-blue-700",
    textColor: "text-blue-700 dark:text-blue-300",
    iconBg: "bg-blue-500"
  },
  done: { 
    label: "Done", 
    bgColor: "bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30",
    borderColor: "border-emerald-300 dark:border-emerald-700",
    textColor: "text-emerald-700 dark:text-emerald-300",
    iconBg: "bg-emerald-500"
  },
};

const priorityConfig = {
  low: { label: "Light Focus", color: "text-slate-500", bg: "bg-slate-100 dark:bg-slate-800", icon: "○" },
  medium: { label: "Medium Focus", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-900/50", icon: "◐" },
  high: { label: "High Focus", color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-100 dark:bg-orange-900/50", icon: "●" },
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
    console.log("Saving monthly reflection:", reflection);
  };

  const currentMonth = format(new Date(), "MMMM");

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-gradient-to-br from-card via-card to-professional/5 rounded-3xl p-5 shadow-card border border-border/50 overflow-hidden relative"
    >
      {/* Decorative element */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-professional/20 to-primary/10 rounded-full blur-2xl" />
      
      <div className="flex items-center justify-between mb-4 relative">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-professional to-primary flex items-center justify-center">
            <Calendar className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">{currentMonth}</h2>
            <p className="text-xs text-muted-foreground">Monthly Focus</p>
          </div>
        </div>
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
          className="rounded-xl gap-2 border-professional/30 hover:bg-professional/10"
        >
          <BookOpen className="w-4 h-4 text-professional" />
          Reflect
        </Button>
      </div>

      <div className="space-y-2 relative">
        {goals.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No monthly goals set yet
          </p>
        ) : (
          <AnimatePresence>
            {goals.map((goal, index) => {
              const currentStatus = (goal.status || "todo") as Status;
              const config = statusConfig[currentStatus];
              const priority = priorityConfig[goal.priority];
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
                    "p-4 rounded-2xl border-2 transition-all cursor-pointer hover:shadow-lg hover:scale-[1.01]",
                    config.bgColor,
                    config.borderColor
                  )}
                  onClick={(e) => {
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
                      <div className="flex items-center gap-2 mt-2">
                        <span className={cn(
                          "text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1",
                          priority.bg,
                          priority.color
                        )}>
                          <Flame className="w-3 h-3" />
                          {priority.label}
                        </span>
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                          {progressPercent}%
                        </span>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={cn("rounded-xl", config.textColor)}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {config.label}
                          <ChevronDown className="w-4 h-4 ml-1" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40 bg-popover">
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
