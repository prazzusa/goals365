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
import { startOfWeek, differenceInDays, format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";

interface WeekTask {
  id: string;
  title: string;
  effort: "S" | "M" | "L";
  status: "todo" | "in_progress" | "done";
}

interface WeekFocusProps {
  tasks: WeekTask[];
  onTaskToggle?: (taskId: string) => void;
  onTaskStatusChange?: (taskId: string, status: "todo" | "in_progress" | "done") => void;
  onReflectionClick?: () => void;
}

const effortColors = {
  S: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  M: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  L: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
};

type Status = "todo" | "in_progress" | "done";

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

const WeekFocus = ({ tasks, onTaskToggle, onTaskStatusChange, onReflectionClick }: WeekFocusProps) => {
  const [showReflection, setShowReflection] = useState(false);
  const [selectedTask, setSelectedTask] = useState<WeekTask | null>(null);
  const { user } = useAuth();

  const handleStatusChange = (taskId: string, newStatus: Status) => {
    if (onTaskStatusChange) {
      onTaskStatusChange(taskId, newStatus);
    }
  };

  const handleSaveReflection = (reflection: any) => {
    // Save reflection to database
    console.log("Saving weekly reflection:", reflection);
    // TODO: Implement save to database
  };

  // Calculate day-based color for weekly goals
  const getTaskColor = (task: WeekTask) => {
    if (task.status === "done") {
      return {
        bgColor: "bg-emerald-50 dark:bg-emerald-900/30",
        borderColor: "border-emerald-200 dark:border-emerald-800",
        textColor: "text-emerald-700 dark:text-emerald-300",
      };
    }

    if (task.status === "todo") {
      const today = new Date();
      const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday as week start
      const daysSinceWeekStart = differenceInDays(today, weekStart);

      // If it's Friday (day 4) or later and still TODO, show red
      if (daysSinceWeekStart >= 4) {
        return {
          bgColor: "bg-red-50 dark:bg-red-900/30",
          borderColor: "border-red-200 dark:border-red-800",
          textColor: "text-red-700 dark:text-red-300",
        };
      } 
      // If it's Wednesday (day 2) or later and still TODO, show yellow
      else if (daysSinceWeekStart >= 2) {
        return {
          bgColor: "bg-yellow-50 dark:bg-yellow-900/30",
          borderColor: "border-yellow-200 dark:border-yellow-800",
          textColor: "text-yellow-700 dark:text-yellow-300",
        };
      }
    }

    // Default TODO color (Monday-Tuesday)
    return statusConfig.todo;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-card rounded-2xl p-5 shadow-sm border border-border/50"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">This Week</h2>
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

      {/* Tasks List */}
      <div className="space-y-2">
        {tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No weekly goals set yet
          </p>
        ) : (
          <AnimatePresence>
            {tasks.map((task, index) => {
              const currentStatus = (task.status || "todo") as Status;
              const colorConfig = getTaskColor(task);
              
              return (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    "p-4 rounded-xl border-2 transition-all cursor-pointer hover:shadow-md",
                    colorConfig.bgColor,
                    colorConfig.borderColor
                  )}
                  onClick={(e) => {
                    // Don't open dialog if clicking on dropdown
                    if ((e.target as HTMLElement).closest('[role="menu"]') || 
                        (e.target as HTMLElement).closest('button')) {
                      return;
                    }
                    setSelectedTask(task);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className={cn("font-medium text-sm mb-1", colorConfig.textColor)}>
                        {task.title}
                      </p>
                      <span className={cn(
                        "text-xs font-bold px-2 py-0.5 rounded",
                        effortColors[task.effort]
                      )}>
                        {task.effort}
                      </span>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={cn("rounded-lg", colorConfig.textColor)}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {statusConfig[currentStatus].label}
                          <ChevronDown className="w-4 h-4 ml-1" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChange(task.id, "todo");
                          }}
                          className={currentStatus === "todo" ? "bg-muted" : ""}
                        >
                          To Do
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChange(task.id, "in_progress");
                          }}
                          className={currentStatus === "in_progress" ? "bg-muted" : ""}
                        >
                          In Progress
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChange(task.id, "done");
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
        type="weekly"
        userId={user?.id}
        weekStart={format(startOfWeek(new Date()), "yyyy-MM-dd")}
      />

      {selectedTask && (
        <GoalDetailDialog
          open={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          goal={{
            id: selectedTask.id,
            title: selectedTask.title,
            type: "weekly",
            status: selectedTask.status,
            effort: selectedTask.effort,
          }}
          onStatusChange={(goalId, status) => {
            handleStatusChange(goalId, status);
            setSelectedTask(null);
          }}
        />
      )}
    </motion.div>
  );
};

export default WeekFocus;
