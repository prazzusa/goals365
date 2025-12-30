import { useState } from "react";
import { motion } from "framer-motion";
import { CheckSquare, Square } from "lucide-react";
import { cn } from "@/lib/utils";

interface WeekTask {
  id: string;
  title: string;
  effort: "S" | "M" | "L";
  status: "todo" | "in_progress" | "done";
}

interface WeekFocusProps {
  tasks: WeekTask[];
  onTaskToggle?: (taskId: string) => void;
}

const effortColors = {
  S: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  M: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  L: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
};

const statusTabs = [
  { key: "todo", label: "To Do" },
  { key: "in_progress", label: "In Progress" },
  { key: "done", label: "Done" },
] as const;

const WeekFocus = ({ tasks, onTaskToggle }: WeekFocusProps) => {
  const [activeTab, setActiveTab] = useState<"todo" | "in_progress" | "done">("todo");

  const filteredTasks = tasks.filter((t) => t.status === activeTab);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-card rounded-2xl p-5 shadow-sm border border-border/50"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">This Week</h2>
        <div className="flex gap-2 text-xs">
          {statusTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "px-2 py-1 rounded-md transition-colors",
                activeTab === tab.key
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {filteredTasks.map((task, index) => {
          const isDone = task.status === "done";

          return (
            <motion.button
              key={task.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.03 }}
              onClick={() => onTaskToggle?.(task.id)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-xl border transition-all",
                isDone
                  ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800"
                  : "bg-muted/50 border-border hover:border-primary/50"
              )}
            >
              {isDone ? (
                <CheckSquare className="w-4 h-4 text-emerald-500" />
              ) : (
                <Square className="w-4 h-4 text-muted-foreground" />
              )}
              <span className={cn(
                "text-sm",
                isDone && "line-through text-muted-foreground"
              )}>
                {task.title}
              </span>
              <span className={cn(
                "text-xs font-bold px-1.5 py-0.5 rounded",
                effortColors[task.effort]
              )}>
                {task.effort}
              </span>
            </motion.button>
          );
        })}

        {filteredTasks.length === 0 && (
          <p className="text-sm text-muted-foreground w-full text-center py-4">
            {activeTab === "todo" && "No tasks to do"}
            {activeTab === "in_progress" && "No tasks in progress"}
            {activeTab === "done" && "No completed tasks"}
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default WeekFocus;
