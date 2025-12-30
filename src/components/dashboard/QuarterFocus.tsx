import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Heart, Zap, Briefcase, Check, Pencil, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface QuarterGoal {
  id: string;
  title: string;
  category: "personal" | "professional" | "fitness";
  progress: number;
}

interface QuarterFocusProps {
  goals: QuarterGoal[];
  onViewDetails?: () => void;
  onGoalsChange?: () => void;
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

const QuarterFocus = ({ goals, onViewDetails, onGoalsChange }: QuarterFocusProps) => {
  const [editingGoal, setEditingGoal] = useState<QuarterGoal | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [deletingGoal, setDeletingGoal] = useState<QuarterGoal | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleEditClick = (goal: QuarterGoal) => {
    setEditingGoal(goal);
    setEditTitle(goal.title);
  };

  const handleSaveEdit = async () => {
    if (!editingGoal || !editTitle.trim()) return;
    setIsUpdating(true);

    const { error } = await supabase
      .from("yearly_goals")
      .update({ title: editTitle.trim() })
      .eq("id", editingGoal.id);

    setIsUpdating(false);

    if (error) {
      toast.error("Failed to update goal");
      return;
    }

    toast.success("Goal updated");
    setEditingGoal(null);
    onGoalsChange?.();
  };

  const handleDeleteConfirm = async () => {
    if (!deletingGoal) return;
    setIsUpdating(true);

    const { error } = await supabase
      .from("yearly_goals")
      .delete()
      .eq("id", deletingGoal.id);

    setIsUpdating(false);

    if (error) {
      toast.error("Failed to delete goal");
      return;
    }

    toast.success("Goal deleted");
    setDeletingGoal(null);
    onGoalsChange?.();
  };

  return (
    <>
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
          <AnimatePresence mode="popLayout">
            {goals.map((goal, index) => {
              const config = categoryConfig[goal.category];
              const Icon = config.icon;
              const isComplete = goal.progress >= 100;

              return (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10, height: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  className="flex items-center gap-3 group"
                >
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", config.bgColor)}>
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
                  {isComplete ? (
                    <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                  ) : (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-lg"
                        onClick={() => handleEditClick(goal)}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-lg text-destructive hover:text-destructive"
                        onClick={() => setDeletingGoal(goal)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>

          {goals.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No quarterly goals set yet
            </p>
          )}
        </div>
      </motion.div>

      {/* Edit Dialog */}
      <Dialog open={!!editingGoal} onOpenChange={() => setEditingGoal(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Goal</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Goal title"
              className="w-full"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingGoal(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={isUpdating || !editTitle.trim()}>
              {isUpdating ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingGoal} onOpenChange={() => setDeletingGoal(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this goal?</AlertDialogTitle>
            <AlertDialogDescription>
              "{deletingGoal?.title}" will be permanently removed. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isUpdating ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default QuarterFocus;
