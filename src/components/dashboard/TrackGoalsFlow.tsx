import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Target, Briefcase, Dumbbell, Calendar, CalendarDays, CalendarRange, Check, Sparkles, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { toast } from "sonner";

type Category = "personal" | "professional" | "fitness";
type Timeframe = "daily" | "weekly" | "monthly";

interface TrackGoalsFlowProps {
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
    progressColor: "bg-pink-500",
  },
  professional: {
    label: "Professional",
    icon: Briefcase,
    gradient: "bg-gradient-to-br from-emerald-500 to-green-500",
    bgLight: "bg-emerald-50 dark:bg-emerald-950/30",
    borderColor: "border-emerald-200 dark:border-emerald-800",
    progressColor: "bg-emerald-500",
  },
  fitness: {
    label: "Fitness",
    icon: Dumbbell,
    gradient: "bg-gradient-to-br from-amber-500 to-orange-500",
    bgLight: "bg-amber-50 dark:bg-amber-950/30",
    borderColor: "border-amber-200 dark:border-amber-800",
    progressColor: "bg-amber-500",
  },
};

const timeframeConfig = {
  daily: { label: "Daily", icon: Calendar },
  weekly: { label: "Weekly", icon: CalendarDays },
  monthly: { label: "Monthly", icon: CalendarRange },
};

const progressLabels = [
  { value: 1, emoji: "😶", label: "Just started" },
  { value: 2, emoji: "🙂", label: "Making progress" },
  { value: 3, emoji: "😊", label: "Halfway there" },
  { value: 4, emoji: "😄", label: "Almost done" },
  { value: 5, emoji: "🎉", label: "Completed!" },
];

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

const TimeframeButton = ({
  timeframe,
  selected,
  onClick,
}: {
  timeframe: Timeframe;
  selected: boolean;
  onClick: () => void;
}) => {
  const config = timeframeConfig[timeframe];
  const Icon = config.icon;

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "flex-1 py-3 px-4 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2",
        selected
          ? "bg-primary text-primary-foreground shadow-lg"
          : "bg-muted/50 text-muted-foreground hover:bg-muted"
      )}
    >
      <Icon className="w-4 h-4" />
      {config.label}
    </motion.button>
  );
};

const GoalTrackCard = ({
  goal,
  category,
  onUpdateProgress,
  delay = 0,
}: {
  goal: Goal;
  category: Category;
  onUpdateProgress: (id: string, progress: number) => void;
  delay?: number;
}) => {
  const config = categoryConfig[category];
  const [localProgress, setLocalProgress] = useState(goal.progress || 1);
  const [showFeedback, setShowFeedback] = useState(false);

  const currentLabel = progressLabels.find((p) => p.value === localProgress) || progressLabels[0];

  const handleProgressChange = (value: number[]) => {
    setLocalProgress(value[0]);
  };

  const handleProgressCommit = () => {
    onUpdateProgress(goal.id, localProgress);
    setShowFeedback(true);
    setTimeout(() => setShowFeedback(false), 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className={cn(
        "p-4 rounded-2xl border-2 space-y-4",
        config.bgLight,
        config.borderColor
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            animate={goal.completed ? { scale: [1, 1.2, 1] } : {}}
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center",
              goal.completed ? config.gradient : "bg-muted"
            )}
          >
            {goal.completed ? (
              <Check className="w-4 h-4 text-white" />
            ) : (
              <div className="w-3 h-3 rounded-full bg-muted-foreground/30" />
            )}
          </motion.div>
          <span className={cn(
            "font-medium",
            goal.completed && "line-through text-muted-foreground"
          )}>
            {goal.title}
          </span>
        </div>
        
        <AnimatePresence>
          {showFeedback && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium"
            >
              Saved!
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <motion.span
            key={localProgress}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="text-2xl"
          >
            {currentLabel.emoji}
          </motion.span>
          <span className="text-sm text-muted-foreground">{currentLabel.label}</span>
        </div>
        
        <Slider
          value={[localProgress]}
          min={1}
          max={5}
          step={1}
          onValueChange={handleProgressChange}
          onValueCommit={handleProgressCommit}
          className="w-full"
        />
        
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Just started</span>
          <span>Completed</span>
        </div>
      </div>
    </motion.div>
  );
};

const TrackGoalsFlow = ({ onClose }: TrackGoalsFlowProps) => {
  const { user } = useAuth();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [category, setCategory] = useState<Category | null>(null);
  const [timeframe, setTimeframe] = useState<Timeframe>("daily");
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchGoals = async () => {
    if (!user || !category) return;
    
    setLoading(true);
    const today = new Date();
    let startDate: string;
    let endDate: string;

    if (timeframe === "daily") {
      startDate = format(today, "yyyy-MM-dd");
      endDate = startDate;
    } else if (timeframe === "weekly") {
      startDate = format(startOfWeek(today, { weekStartsOn: 1 }), "yyyy-MM-dd");
      endDate = format(endOfWeek(today, { weekStartsOn: 1 }), "yyyy-MM-dd");
    } else {
      startDate = format(startOfMonth(today), "yyyy-MM-dd");
      endDate = format(endOfMonth(today), "yyyy-MM-dd");
    }

    const { data, error } = await supabase
      .from("daily_goals")
      .select("*")
      .eq("user_id", user.id)
      .eq("category", category)
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date", { ascending: false });

    if (!error && data) {
      setGoals(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (step === 3 && category) {
      fetchGoals();
    }
  }, [step, category, timeframe]);

  const handleCategorySelect = (cat: Category) => {
    setCategory(cat);
    setTimeout(() => setStep(2), 200);
  };

  const handleTimeframeSelect = (tf: Timeframe) => {
    setTimeframe(tf);
  };

  const handleContinueToGoals = () => {
    setStep(3);
  };

  const handleUpdateProgress = async (id: string, progress: number) => {
    const completed = progress === 5;
    
    await supabase
      .from("daily_goals")
      .update({ progress, completed })
      .eq("id", id);

    setGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, progress, completed } : g))
    );

    if (completed) {
      toast.success("Goal completed! Keep up the great work! 🎉");
    }
  };

  const goBack = () => {
    if (step === 2) setStep(1);
    else if (step === 3) setStep(2);
    else onClose();
  };

  const completedCount = goals.filter((g) => g.completed).length;
  const totalCount = goals.length;

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
            <h1 className="font-display font-bold">Track Goals</h1>
            <p className="text-xs text-muted-foreground">
              {step === 1 && "Select a category"}
              {step === 2 && "Select timeframe"}
              {step === 3 && `${completedCount}/${totalCount} completed`}
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
                  className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto"
                >
                  <TrendingUp className="w-8 h-8 text-amber-500" />
                </motion.div>
                <h2 className="text-xl font-display font-bold">Reflect & Progress</h2>
                <p className="text-muted-foreground text-sm">
                  Which goals would you like to track?
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

          {/* Step 2: Timeframe Selection */}
          {step === 2 && category && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2 py-6">
                <div className={cn(
                  "w-16 h-16 rounded-full flex items-center justify-center mx-auto",
                  categoryConfig[category].gradient
                )}>
                  {(() => {
                    const Icon = categoryConfig[category].icon;
                    return <Icon className="w-8 h-8 text-white" />;
                  })()}
                </div>
                <h2 className="text-xl font-display font-bold">
                  {categoryConfig[category].label} Goals
                </h2>
                <p className="text-muted-foreground text-sm">
                  Select a timeframe to view your goals
                </p>
              </div>

              <div className="flex gap-2">
                <TimeframeButton
                  timeframe="daily"
                  selected={timeframe === "daily"}
                  onClick={() => handleTimeframeSelect("daily")}
                />
                <TimeframeButton
                  timeframe="weekly"
                  selected={timeframe === "weekly"}
                  onClick={() => handleTimeframeSelect("weekly")}
                />
                <TimeframeButton
                  timeframe="monthly"
                  selected={timeframe === "monthly"}
                  onClick={() => handleTimeframeSelect("monthly")}
                />
              </div>

              <Button
                onClick={handleContinueToGoals}
                className="w-full h-12 rounded-xl font-semibold"
              >
                View Goals
              </Button>
            </motion.div>
          )}

          {/* Step 3: Goals List */}
          {step === 3 && category && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              {/* Summary Card */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between"
              >
                <div>
                  <p className="text-sm text-muted-foreground">
                    {timeframeConfig[timeframe].label} Progress
                  </p>
                  <p className="text-2xl font-bold">
                    {totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}%
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl">
                    {completedCount === totalCount && totalCount > 0 ? "🎉" : "💪"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {completedCount}/{totalCount} done
                  </p>
                </div>
              </motion.div>

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
                    <Target className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">No goals yet</p>
                    <p className="text-sm text-muted-foreground">
                      Set some {categoryConfig[category].label.toLowerCase()} goals first
                    </p>
                  </div>
                  <Button onClick={onClose} variant="outline" className="rounded-xl">
                    Go to Dashboard
                  </Button>
                </motion.div>
              ) : (
                <div className="space-y-3">
                  {goals.map((goal, i) => (
                    <GoalTrackCard
                      key={goal.id}
                      goal={goal}
                      category={category}
                      onUpdateProgress={handleUpdateProgress}
                      delay={i * 0.1}
                    />
                  ))}
                </div>
              )}

              {/* Motivational footer */}
              {goals.length > 0 && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-center text-sm text-muted-foreground italic pt-4"
                >
                  "Progress, not perfection."
                </motion.p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </motion.div>
  );
};

export default TrackGoalsFlow;
