import { motion } from "framer-motion";
import { X, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface GoalDetailDialogProps {
  open: boolean;
  onClose: () => void;
  goal: {
    id: string;
    title: string;
    type: "weekly" | "monthly";
    status?: "todo" | "in_progress" | "done";
    effort?: "S" | "M" | "L";
    priority?: "low" | "medium" | "high";
    progress?: number;
  };
  onStatusChange?: (goalId: string, status: "todo" | "in_progress" | "done") => void;
}

const GoalDetailDialog = ({
  open,
  onClose,
  goal,
  onStatusChange,
}: GoalDetailDialogProps) => {
  const statusConfig = {
    todo: {
      label: "To Do",
      bgColor: "bg-slate-50 dark:bg-slate-900/50",
      borderColor: "border-slate-200 dark:border-slate-800",
      textColor: "text-slate-700 dark:text-slate-300",
    },
    in_progress: {
      label: "In Progress",
      bgColor: "bg-blue-50 dark:bg-blue-900/30",
      borderColor: "border-blue-200 dark:border-blue-800",
      textColor: "text-blue-700 dark:text-blue-300",
    },
    done: {
      label: "Done",
      bgColor: "bg-emerald-50 dark:bg-emerald-900/30",
      borderColor: "border-emerald-200 dark:border-emerald-800",
      textColor: "text-emerald-700 dark:text-emerald-300",
    },
  };

  const currentStatus = (goal.status || "todo") as keyof typeof statusConfig;
  const status = statusConfig[currentStatus];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center justify-between">
            <span>Goal Details</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full"
            >
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Goal Title */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {goal.title}
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={cn(
                  "px-3 py-1 rounded-lg text-sm font-medium border-2",
                  status.bgColor,
                  status.borderColor,
                  status.textColor
                )}
              >
                {status.label}
              </span>
              {goal.effort && (
                <span className="px-3 py-1 rounded-lg text-sm font-medium bg-muted text-muted-foreground">
                  Effort: {goal.effort}
                </span>
              )}
              {goal.priority && (
                <span className="px-3 py-1 rounded-lg text-sm font-medium bg-muted text-muted-foreground">
                  Priority: {goal.priority}
                </span>
              )}
              {goal.progress !== undefined && (
                <span className="px-3 py-1 rounded-lg text-sm font-medium bg-muted text-muted-foreground">
                  Progress: {goal.progress}%
                </span>
              )}
            </div>
          </div>

          {/* Status Change */}
          {onStatusChange && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Change Status
              </label>
              <div className="flex gap-2">
                {Object.entries(statusConfig).map(([key, config]) => (
                  <Button
                    key={key}
                    variant={currentStatus === key ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      onStatusChange(goal.id, key as "todo" | "in_progress" | "done");
                      onClose();
                    }}
                    className={cn(
                      "rounded-lg",
                      currentStatus === key && config.bgColor
                    )}
                  >
                    {config.label}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GoalDetailDialog;
