import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Target, Briefcase, Dumbbell, Edit2, Trash2, Check, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { toast } from "sonner";

type Category = "personal" | "professional" | "fitness";

interface UpdateGoalsFlowProps {
  onClose: () => void;
}

interface Goal {
  id: string;
  title: string;
  progress: number;
  completed: boolean;
  category: string;
  date: string;
}

const categoryConfig = {
  personal: {
    label: "Personal",
    icon: Target,
    gradient: "bg-gradient-to-br from-pink-500 to-rose-500",
    bgLight: "bg-pink-50 dark:bg-pink-950/30",
    borderColor: "border-pink-200 dark:border-pink-800",
  },
  professional: {
    label: "Professional",
    icon: Briefcase,
    gradient: "bg-gradient-to-br from-emerald-500 to-green-500",
    bgLight: "bg-emerald-50 dark:bg-emerald-950/30",
    borderColor: "border-emerald-200 dark:border-emerald-800",
  },
  fitness: {
    label: "Fitness",
    icon: Dumbbell,
    gradient: "bg-gradient-to-br from-amber-500 to-orange-500",
    bgLight: "bg-amber-50 dark:bg-amber-950/30",
    borderColor: "border-amber-200 dark:border-amber-800",
  },
};

const CategoryButton = ({
  category,
  selected,
  onClick,
  delay = 0,
}: {
  category: Category;
  selected: boolean;
  onClick: () => void;
  delay?: number;
}) => {
  const config = categoryConfig[category];
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
        "flex-1 p-4 rounded-2xl flex flex-col items-center gap-2 transition-all border-2",
        selected
          ? cn(config.gradient, "border-transparent text-white shadow-lg")
          : cn("bg-card border-border hover:border-primary/30")
      )}
    >
      <div className={cn(
        "w-12 h-12 rounded-xl flex items-center justify-center",
        selected ? "bg-white/20" : config.gradient
      )}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <span className={cn("font-semibold text-sm", !selected && "text-foreground")}>
        {config.label}
      </span>
    </motion.button>
  );
};

const GoalEditCard = ({
  goal,
  category,
  onUpdate,
  onDelete,
  delay = 0,
}: {
  goal: Goal;
  category: Category;
  onUpdate: (id: string, title: string) => void;
  onDelete: (id: string) => void;
  delay?: number;
}) => {
  const config = categoryConfig[category];
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ delay, duration: 0.3 }}
      className={cn(
        "p-4 rounded-2xl border-2",
        config.bgLight,
        config.borderColor
      )}
    >
      <AnimatePresence mode="wait">
        {isEditing ? (
          <motion.div
            key="editing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2"
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
            className="flex items-center gap-3"
          >
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
              goal.completed ? config.gradient : "bg-muted"
            )}>
              {goal.completed ? (
                <Check className="w-4 h-4 text-white" />
              ) : (
                <div className="w-3 h-3 rounded-full bg-muted-foreground/30" />
              )}
            </div>
            
            <span className={cn(
              "flex-1 font-medium truncate",
              goal.completed && "line-through text-muted-foreground"
            )}>
              {goal.title}
            </span>
            
            <div className="flex items-center gap-1">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setIsEditing(true)}
                className="h-8 w-8 rounded-lg"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onDelete(goal.id)}
                className="h-8 w-8 rounded-lg text-destructive hover:text-destructive"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const UpdateGoalsFlow = ({ onClose }: UpdateGoalsFlowProps) => {
  const { user } = useAuth();
  const [step, setStep] = useState<1 | 2>(1);
  const [category, setCategory] = useState<Category | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchGoals = async () => {
    if (!user || !category) return;
    
    setLoading(true);
    const today = format(new Date(), "yyyy-MM-dd");

    const { data, error } = await supabase
      .from("daily_goals")
      .select("*")
      .eq("user_id", user.id)
      .eq("category", category)
      .eq("date", today)
      .order("created_at", { ascending: true });

    if (!error && data) {
      setGoals(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (step === 2 && category) {
      fetchGoals();
    }
  }, [step, category]);

  const handleCategorySelect = (cat: Category) => {
    setCategory(cat);
    setTimeout(() => setStep(2), 200);
  };

  const handleUpdateGoal = async (id: string, title: string) => {
    await supabase
      .from("daily_goals")
      .update({ title })
      .eq("id", id);

    setGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, title } : g))
    );
    
    toast.success("Goal updated!");
  };

  const handleDeleteGoal = async (id: string) => {
    await supabase
      .from("daily_goals")
      .delete()
      .eq("id", id);

    setGoals((prev) => prev.filter((g) => g.id !== id));
    toast.success("Goal removed");
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
              {step === 1 ? "Select a category" : `${goals.length} goals today`}
            </p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="p-4 max-w-lg mx-auto pb-24">
        <AnimatePresence mode="wait">
          {/* Step 1: Category Selection */}
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
                <h2 className="text-xl font-display font-bold">Refine Your Goals</h2>
                <p className="text-muted-foreground text-sm">
                  Adjust your goals as you grow and learn
                </p>
              </div>

              <div className="flex gap-3">
                <CategoryButton
                  category="personal"
                  selected={category === "personal"}
                  onClick={() => handleCategorySelect("personal")}
                  delay={0.1}
                />
                <CategoryButton
                  category="professional"
                  selected={category === "professional"}
                  onClick={() => handleCategorySelect("professional")}
                  delay={0.2}
                />
                <CategoryButton
                  category="fitness"
                  selected={category === "fitness"}
                  onClick={() => handleCategorySelect("fitness")}
                  delay={0.3}
                />
              </div>
            </motion.div>
          )}

          {/* Step 2: Goals List */}
          {step === 2 && category && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="text-center py-4">
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2",
                  categoryConfig[category].gradient
                )}>
                  {(() => {
                    const Icon = categoryConfig[category].icon;
                    return <Icon className="w-6 h-6 text-white" />;
                  })()}
                </div>
                <h2 className="text-lg font-display font-bold">
                  Today's {categoryConfig[category].label} Goals
                </h2>
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
                    <p className="font-medium text-foreground">No goals to update</p>
                    <p className="text-sm text-muted-foreground">
                      Set some goals first, then come back to refine them
                    </p>
                  </div>
                  <Button onClick={onClose} variant="outline" className="rounded-xl">
                    Go to Dashboard
                  </Button>
                </motion.div>
              ) : (
                <div className="space-y-3">
                  <AnimatePresence>
                    {goals.map((goal, i) => (
                      <GoalEditCard
                        key={goal.id}
                        goal={goal}
                        category={category}
                        onUpdate={handleUpdateGoal}
                        onDelete={handleDeleteGoal}
                        delay={i * 0.1}
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
