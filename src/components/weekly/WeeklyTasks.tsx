import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Plus, X, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, startOfWeek, endOfWeek } from "date-fns";

export interface WeeklyTask {
  id: string;
  goalId: string;
  title: string;
  effort: "S" | "M" | "L";
  status: "todo" | "in_progress" | "done";
}

interface WeeklyTasksProps {
  currentWeek: Date;
  activeGoals: { id: string; title: string; category: string }[];
  tasks: WeeklyTask[];
  onTasksChange: (tasks: WeeklyTask[]) => void;
  onNext: () => void;
  onBack: () => void;
}

const effortColors = {
  S: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  M: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  L: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const WeeklyTasks = ({
  currentWeek,
  activeGoals,
  tasks,
  onTasksChange,
  onNext,
  onBack,
}: WeeklyTasksProps) => {
  const [expandedGoals, setExpandedGoals] = useState<string[]>(
    activeGoals.map((g) => g.id)
  );
  const [newTask, setNewTask] = useState<Record<string, string>>({});

  const weekStart = startOfWeek(currentWeek);
  const weekEnd = endOfWeek(currentWeek);

  const toggleExpanded = (goalId: string) => {
    setExpandedGoals((prev) =>
      prev.includes(goalId)
        ? prev.filter((id) => id !== goalId)
        : [...prev, goalId]
    );
  };

  const addTask = (goalId: string) => {
    const title = newTask[goalId]?.trim();
    if (!title) return;

    const task: WeeklyTask = {
      id: crypto.randomUUID(),
      goalId,
      title,
      effort: "M",
      status: "todo",
    };

    onTasksChange([...tasks, task]);
    setNewTask((prev) => ({ ...prev, [goalId]: "" }));
  };

  const removeTask = (taskId: string) => {
    onTasksChange(tasks.filter((t) => t.id !== taskId));
  };

  const setEffort = (taskId: string, effort: "S" | "M" | "L") => {
    onTasksChange(
      tasks.map((t) => (t.id === taskId ? { ...t, effort } : t))
    );
  };

  const getTasksForGoal = (goalId: string) =>
    tasks.filter((t) => t.goalId === goalId);

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
          <h1 className="text-2xl font-bold text-foreground">Break into Tasks</h1>
          <p className="text-muted-foreground text-sm">
            {format(weekStart, "MMM d")} - {format(weekEnd, "d")} • Step 2 of 4
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col max-w-lg mx-auto w-full">
        <p className="text-muted-foreground mb-6">
          Add 1-3 small tasks for each goal
        </p>

        <div className="space-y-4 flex-1">
          {activeGoals.map((goal, index) => {
            const isExpanded = expandedGoals.includes(goal.id);
            const goalTasks = getTasksForGoal(goal.id);

            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="rounded-xl border bg-card overflow-hidden"
              >
                <button
                  onClick={() => toggleExpanded(goal.id)}
                  className="w-full p-4 flex items-center justify-between text-left"
                >
                  <div>
                    <p className="font-medium text-foreground">{goal.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {goalTasks.length} task{goalTasks.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t"
                    >
                      <div className="p-4 space-y-3">
                        {/* Existing Tasks */}
                        {goalTasks.map((task) => (
                          <div
                            key={task.id}
                            className="flex items-center gap-2 bg-muted/50 rounded-lg p-3"
                          >
                            <span className="flex-1 text-sm text-foreground">
                              {task.title}
                            </span>
                            <div className="flex gap-1">
                              {(["S", "M", "L"] as const).map((e) => (
                                <button
                                  key={e}
                                  onClick={() => setEffort(task.id, e)}
                                  className={cn(
                                    "w-6 h-6 rounded text-xs font-bold transition-all",
                                    task.effort === e
                                      ? effortColors[e]
                                      : "bg-muted text-muted-foreground"
                                  )}
                                >
                                  {e}
                                </button>
                              ))}
                            </div>
                            <button
                              onClick={() => removeTask(task.id)}
                              className="text-muted-foreground hover:text-destructive"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}

                        {/* Add New Task */}
                        {goalTasks.length < 3 && (
                          <div className="flex gap-2">
                            <Input
                              placeholder="Add task..."
                              value={newTask[goal.id] || ""}
                              onChange={(e) =>
                                setNewTask((prev) => ({
                                  ...prev,
                                  [goal.id]: e.target.value,
                                }))
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter") addTask(goal.id);
                              }}
                              className="bg-background"
                            />
                            <Button
                              size="icon"
                              onClick={() => addTask(goal.id)}
                              disabled={!newTask[goal.id]?.trim()}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
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
            disabled={tasks.length === 0}
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WeeklyTasks;
