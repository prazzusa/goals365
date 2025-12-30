import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, BookOpen, Target, Zap } from "lucide-react";
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

const effortConfig = {
  S: { 
    label: "Small", 
    color: "text-emerald-600 dark:text-emerald-400", 
    bg: "bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/40 dark:to-teal-900/40",
    border: "border-emerald-300 dark:border-emerald-700"
  },
  M: { 
    label: "Medium", 
    color: "text-blue-600 dark:text-blue-400", 
    bg: "bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40",
    border: "border-blue-300 dark:border-blue-700"
  },
  L: { 
    label: "Large", 
    color: "text-amber-600 dark:text-amber-400", 
    bg: "bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/40",
    border: "border-amber-300 dark:border-amber-700"
  },
};

type Status = "todo" | "in_progress" | "done";

const statusConfig: Record<Status, { label: string; textColor: string }> = {
  todo: { label: "To Do", textColor: "text-slate-600 dark:text-slate-400" },
  in_progress: { label: "In Progress", textColor: "text-blue-600 dark:text-blue-400" },
  done: { label: "Done", textColor: "text-emerald-600 dark:text-emerald-400" },
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
    console.log("Saving weekly reflection:", reflection);
  };

  // Calculate day-based urgency color
  const getUrgencyIndicator = (task: WeekTask) => {
    if (task.status === "done") return null;
    if (task.status === "in_progress") return null;
    
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    const daysSinceWeekStart = differenceInDays(today, weekStart);

    if (daysSinceWeekStart >= 4) {
      return <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" title="End of week - needs attention" />;
    } else if (daysSinceWeekStart >= 2) {
      return <span className="w-2 h-2 rounded-full bg-amber-500" title="Mid-week" />;
    }
    return null;
  };

  const getTaskBgStyle = (task: WeekTask) => {
    if (task.status === "done") {
      return "bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-emerald-200 dark:border-emerald-800";
    }
    if (task.status === "in_progress") {
      return "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800";
    }
    
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    const daysSinceWeekStart = differenceInDays(today, weekStart);

    if (daysSinceWeekStart >= 4) {
      return "bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-red-200 dark:border-red-800";
    } else if (daysSinceWeekStart >= 2) {
      return "bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border-amber-200 dark:border-amber-800";
    }
    
    return "bg-card border-border";
  };

  const weekRange = `${format(startOfWeek(new Date(), { weekStartsOn: 1 }), "MMM d")} - ${format(new Date(startOfWeek(new Date(), { weekStartsOn: 1 }).getTime() + 6 * 24 * 60 * 60 * 1000), "MMM d")}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-gradient-to-br from-card via-card to-fitness/5 rounded-3xl p-5 shadow-card border border-border/50 overflow-hidden relative"
    >
      {/* Decorative element */}
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-gradient-to-tr from-fitness/20 to-primary/10 rounded-full blur-2xl" />
      
      <div className="flex items-center justify-between mb-4 relative">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-fitness to-emerald-400 flex items-center justify-center">
            <Target className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">This Week</h2>
            <p className="text-xs text-muted-foreground">{weekRange}</p>
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
          className="rounded-xl gap-2 border-fitness/30 hover:bg-fitness/10"
        >
          <BookOpen className="w-4 h-4 text-fitness" />
          Reflect
        </Button>
      </div>

      {/* Tasks List */}
      <div className="space-y-2 relative">
        {tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No weekly tasks set yet
          </p>
        ) : (
          <AnimatePresence>
            {tasks.map((task, index) => {
              const currentStatus = (task.status || "todo") as Status;
              const effort = effortConfig[task.effort];
              const urgency = getUrgencyIndicator(task);
              
              return (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    "p-4 rounded-2xl border-2 transition-all cursor-pointer hover:shadow-lg hover:scale-[1.01]",
                    getTaskBgStyle(task)
                  )}
                  onClick={(e) => {
                    if ((e.target as HTMLElement).closest('[role="menu"]') || 
                        (e.target as HTMLElement).closest('button')) {
                      return;
                    }
                    setSelectedTask(task);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {urgency}
                        <p className={cn(
                          "font-medium text-sm",
                          task.status === "done" && "line-through opacity-60"
                        )}>
                          {task.title}
                        </p>
                      </div>
                      <span className={cn(
                        "text-xs font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1",
                        effort.bg,
                        effort.color
                      )}>
                        <Zap className="w-3 h-3" />
                        {task.effort} - {effort.label}
                      </span>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={cn("rounded-xl", statusConfig[currentStatus].textColor)}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {statusConfig[currentStatus].label}
                          <ChevronDown className="w-4 h-4 ml-1" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40 bg-popover">
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
