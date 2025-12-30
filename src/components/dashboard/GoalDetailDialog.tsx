import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, MessageSquare, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  const [comment, setComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingComment, setIsSavingComment] = useState(false);

  useEffect(() => {
    if (open && goal.id) {
      loadComment();
    }
  }, [open, goal.id]);

  const loadComment = async () => {
    setIsLoading(true);
    try {
      const table = goal.type === "weekly" ? "weekly_goals" : "monthly_goals";
      const { data, error } = await supabase
        .from(table)
        .select("comments")
        .eq("id", goal.id)
        .single();

      if (error) throw error;
      setComment((data?.comments as string) || "");
    } catch (error) {
      console.error("Error loading comment:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveComment = async () => {
    setIsSavingComment(true);
    try {
      const table = goal.type === "weekly" ? "weekly_goals" : "monthly_goals";
      const { error } = await supabase
        .from(table)
        .update({ comments: comment.trim() || null } as any)
        .eq("id", goal.id);

      if (error) throw error;
      toast.success("Comment saved");
    } catch (error) {
      console.error("Error saving comment:", error);
      toast.error("Failed to save comment");
    } finally {
      setIsSavingComment(false);
    }
  };

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

          {/* Comments Section */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
              <MessageSquare className="w-4 h-4" />
              Comments & Notes
            </label>
            {isLoading ? (
              <div className="min-h-[150px] flex items-center justify-center text-muted-foreground">
                Loading...
              </div>
            ) : (
              <>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add your thoughts, notes, or reflections about this goal..."
                  className="min-h-[150px] resize-none rounded-xl"
                />
                <Button
                  onClick={handleSaveComment}
                  disabled={isSavingComment}
                  className="mt-3 rounded-xl"
                  size="sm"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSavingComment ? "Saving..." : "Save Comment"}
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GoalDetailDialog;

