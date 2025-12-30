import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Calendar, CalendarDays, Edit2, Check, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format, startOfWeek, getMonth, getYear } from "date-fns";
import { toast } from "sonner";

type GoalType = "weekly" | "monthly";

interface UpdateGoalsFlowProps {
  onClose: () => void;
}

interface Goal {
  id: string;
  title: string;
  progress?: number;
  priority?: string;
  effort?: string;
  status?: string;
  completed?: boolean;
}

const GoalTypeButton = ({
  goalType,
  selected,
  onClick,
  delay = 0,
}: {
  goalType: GoalType;
  selected: boolean;
  onClick: () => void;
  delay?: number;
}) => {
  const config = goalType === "weekly" 
    ? { label: "Weekly Goals", icon: CalendarDays, gradient: "bg-gradient-to-br from-blue-500 to-cyan-500" }
    : { label: "Monthly Goals", icon: Calendar, gradient: "bg-gradient-to-br from-purple-500 to-pink-500" };
  const Icon = config.icon;

  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.2 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "flex-1 p-6 rounded-2xl flex flex-col items-center gap-3 transition-all border-2",
        selected
          ? cn(config.gradient, "border-transparent text-white shadow-lg")
          : cn("bg-card border-border hover:border-primary/30")
      )}
    >
      <div className={cn(
        "w-16 h-16 rounded-xl flex items-center justify-center",
        selected ? "bg-white/20" : config.gradient
      )}>
        <Icon className="w-8 h-8 text-white" />
      </div>
      <span className={cn("font-semibold text-base", !selected && "text-foreground")}>
        {config.label}
      </span>
    </motion.button>
  );
};

const GoalListItem = ({
  goal,
  goalType,
  onUpdate,
  delay = 0,
}: {
  goal: Goal;
  goalType: GoalType;
  onUpdate: (id: string, title: string) => void;
  delay?: number;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(goal.title);

  const handleSave = () => {
    if (editValue.trim()) {
      onUpdate(goal.id, editValue.trim());
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditValue(goal.title);
    setIsEditing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ delay, duration: 0.2 }}
      className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors"
    >
      <AnimatePresence mode="wait">
        {isEditing ? (
          <motion.div
            key="editing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 flex-1"
          >
            <Input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="flex-1 h-10 rounded-xl"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
                if (e.key === "Escape") handleCancel();
              }}
            />
            <Button
              size="icon"
              variant="ghost"
              onClick={handleSave}
              className="h-10 w-10 rounded-xl text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50"
            >
              <Check className="w-4 h-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={handleCancel}
              className="h-10 w-10 rounded-xl text-muted-foreground"
            >
              <X className="w-4 h-4" />
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="display"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 flex-1"
          >
            <span className="flex-1 font-medium text-foreground">
              {goal.title}
            </span>
            
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setIsEditing(true)}
              className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
            >
              <Edit2 className="w-4 h-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const UpdateGoalsFlow = ({ onClose }: UpdateGoalsFlowProps) => {
  const { user } = useAuth();
  const [step, setStep] = useState<1 | 2>(1);
  const [goalType, setGoalType] = useState<GoalType | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchGoals = async () => {
    if (!user || !goalType) return;
    
    setLoading(true);

    if (goalType === "weekly") {
      const weekStart = format(startOfWeek(new Date()), "yyyy-MM-dd");
      const { data, error } = await supabase
        .from("weekly_goals")
        .select("id, title, effort, status")
        .eq("user_id", user.id)
        .eq("week_start", weekStart)
        .order("created_at", { ascending: true });

      if (!error && data) {
        setGoals(data);
      }
    } else {
      const currentMonth = getMonth(new Date()) + 1;
      const currentYear = getYear(new Date());
      const { data, error } = await supabase
        .from("monthly_goals")
        .select("id, title, progress, priority")
        .eq("user_id", user.id)
        .eq("month", currentMonth)
        .eq("year", currentYear)
        .order("created_at", { ascending: true });

      if (!error && data) {
        setGoals(data);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    if (step === 2 && goalType) {
      fetchGoals();
    }
  }, [step, goalType]);

  const handleGoalTypeSelect = (type: GoalType) => {
    setGoalType(type);
    setTimeout(() => setStep(2), 200);
  };

  const handleUpdateGoal = async (id: string, title: string) => {
    const table = goalType === "weekly" ? "weekly_goals" : "monthly_goals";
    await supabase
      .from(table)
      .update({ title })
      .eq("id", id);

    setGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, title } : g))
    );
    
    toast.success("Goal updated!");
  };

  const goBack = () => {
    if (step === 2) setStep(1);
    else onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background overflow-y-auto"
    >
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="flex items-center gap-3 p-4 max-w-lg mx-auto">
          <Button variant="ghost" size="icon" onClick={goBack} className="rounded-xl">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="font-display font-bold">Update Goals</h1>
            <p className="text-xs text-muted-foreground">
              {step === 1 ? "Select goal type" : `${goals.length} ${goalType} goals`}
            </p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="p-4 max-w-lg mx-auto pb-24">
        <AnimatePresence mode="wait">
          {/* Step 1: Goal Type Selection */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2 py-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto"
                >
                  <Edit2 className="w-8 h-8 text-emerald-500" />
                </motion.div>
                <h2 className="text-xl font-display font-bold">Update Your Goals</h2>
                <p className="text-muted-foreground text-sm">
                  Choose which goals you'd like to update
                </p>
              </div>

              <div className="flex gap-4">
                <GoalTypeButton
                  goalType="weekly"
                  selected={goalType === "weekly"}
                  onClick={() => handleGoalTypeSelect("weekly")}
                  delay={0.1}
                />
                <GoalTypeButton
                  goalType="monthly"
                  selected={goalType === "monthly"}
                  onClick={() => handleGoalTypeSelect("monthly")}
                  delay={0.2}
                />
              </div>
            </motion.div>
          )}

          {/* Step 2: Goals List */}
          {step === 2 && goalType && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="text-center py-4">
                <h2 className="text-lg font-display font-bold">
                  {goalType === "weekly" ? "Weekly Goals" : "Monthly Goals"}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Tap the edit icon to update a goal
                </p>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : goals.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12 space-y-4"
                >
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
                    <Sparkles className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">No {goalType} goals found</p>
                    <p className="text-sm text-muted-foreground">
                      Set some {goalType} goals first, then come back to update them
                    </p>
                  </div>
                  <Button onClick={onClose} variant="outline" className="rounded-xl">
                    Go to Dashboard
                  </Button>
                </motion.div>
              ) : (
                <div className="space-y-2">
                  <AnimatePresence>
                    {goals.map((goal, i) => (
                      <GoalListItem
                        key={goal.id}
                        goal={goal}
                        goalType={goalType}
                        onUpdate={handleUpdateGoal}
                        delay={i * 0.05}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}

              {goals.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="pt-4"
                >
                  <Button
                    onClick={onClose}
                    className="w-full h-12 rounded-xl font-semibold"
                  >
                    Done Editing
                  </Button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </motion.div>
  );
};

export default UpdateGoalsFlow;
