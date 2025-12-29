import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Circle, Clock, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, startOfWeek, endOfWeek } from "date-fns";
import { WeeklyTask } from "./WeeklyTasks";

interface TaskStatusTrackerProps {
  currentWeek: Date;
  tasks: WeeklyTask[];
  onTaskStatusChange: (taskId: string, status: "todo" | "in_progress" | "done") => void;
  onNext: () => void;
  onBack: () => void;
}

const statusConfig = {
  todo: {
    icon: Circle,
    label: "To Do",
    color: "text-amber-500",
    bg: "bg-amber-100 dark:bg-amber-900/30",
  },
  in_progress: {
    icon: Clock,
    label: "In Progress",
    color: "text-blue-500",
    bg: "bg-blue-100 dark:bg-blue-900/30",
  },
  done: {
    icon: CheckCircle2,
    label: "Done",
    color: "text-green-500",
    bg: "bg-green-100 dark:bg-green-900/30",
  },
};

const TaskStatusTracker = ({
  currentWeek,
  tasks,
  onTaskStatusChange,
  onNext,
  onBack,
}: TaskStatusTrackerProps) => {
  const weekStart = startOfWeek(currentWeek);
  const weekEnd = endOfWeek(currentWeek);

  const tasksByStatus = {
    todo: tasks.filter((t) => t.status === "todo"),
    in_progress: tasks.filter((t) => t.status === "in_progress"),
    done: tasks.filter((t) => t.status === "done"),
  };

  const completionPercentage = Math.round(
    (tasksByStatus.done.length / tasks.length) * 100
  ) || 0;

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
          <h1 className="text-2xl font-bold text-foreground">Task Status</h1>
          <p className="text-muted-foreground text-sm">
            {format(weekStart, "MMM d")} - {format(weekEnd, "d")} • Step 3 of 4
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col max-w-lg mx-auto w-full">
        {/* Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Progress</span>
            <span className="text-sm font-medium text-foreground">
              {completionPercentage}%
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${completionPercentage}%` }}
              className="h-full bg-primary rounded-full"
            />
          </div>
        </motion.div>

        {/* Status Columns */}
        <div className="flex-1 space-y-6">
          {(["todo", "in_progress", "done"] as const).map((status, sIndex) => {
            const config = statusConfig[status];
            const Icon = config.icon;
            const statusTasks = tasksByStatus[status];

            return (
              <motion.div
                key={status}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: sIndex * 0.1 }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Icon className={cn("w-4 h-4", config.color)} />
                  <span className="text-sm font-medium text-foreground">
                    {config.label}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({statusTasks.length})
                  </span>
                </div>

                <div className="space-y-2">
                  {statusTasks.length === 0 ? (
                    <div className="p-3 rounded-lg border border-dashed text-center text-sm text-muted-foreground">
                      No tasks
                    </div>
                  ) : (
                    statusTasks.map((task) => (
                      <motion.div
                        key={task.id}
                        layout
                        className={cn(
                          "p-3 rounded-lg border flex items-center justify-between",
                          config.bg
                        )}
                      >
                        <span className="text-sm font-medium text-foreground">
                          {task.title}
                        </span>
                        <div className="flex gap-1">
                          {(["todo", "in_progress", "done"] as const).map((s) => {
                            const sConfig = statusConfig[s];
                            const SIcon = sConfig.icon;
                            return (
                              <button
                                key={s}
                                onClick={() => onTaskStatusChange(task.id, s)}
                                className={cn(
                                  "w-7 h-7 rounded-full flex items-center justify-center transition-all",
                                  task.status === s
                                    ? sConfig.bg
                                    : "hover:bg-muted"
                                )}
                              >
                                <SIcon
                                  className={cn(
                                    "w-4 h-4",
                                    task.status === s
                                      ? sConfig.color
                                      : "text-muted-foreground"
                                  )}
                                />
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-8 pt-4">
          <Button
            onClick={onNext}
            size="lg"
            className="w-full h-14 text-lg font-semibold rounded-xl"
          >
            Mid-Week Check
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TaskStatusTracker;
