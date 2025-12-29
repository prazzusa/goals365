import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  Check,
  Heart,
  Briefcase,
  Dumbbell,
  X,
} from "lucide-react";
import { QuarterlyCategory, QuarterlyGoal } from "@/pages/QuarterlyPlanning";
import { cn } from "@/lib/utils";

interface QuarterlyGoalsProps {
  selectedCategories: QuarterlyCategory[];
  goals: QuarterlyGoal[];
  onGoalsChange: (goals: QuarterlyGoal[]) => void;
  onNext: () => void;
  onBack: () => void;
}

const categoryConfig: Record<
  QuarterlyCategory,
  { title: string; icon: React.ElementType; color: string }
> = {
  personal: { title: "Personal", icon: Heart, color: "text-rose-500" },
  professional: { title: "Professional", icon: Briefcase, color: "text-blue-500" },
  fitness: { title: "Fitness", icon: Dumbbell, color: "text-emerald-500" },
};

const difficultyOptions: { value: "light" | "balanced" | "stretch"; label: string; color: string }[] = [
  { value: "light", label: "Light", color: "bg-green-100 text-green-700 border-green-200" },
  { value: "balanced", label: "Balance", color: "bg-amber-100 text-amber-700 border-amber-200" },
  { value: "stretch", label: "Stretch", color: "bg-red-100 text-red-700 border-red-200" },
];

const QuarterlyGoals = ({
  selectedCategories,
  goals,
  onGoalsChange,
  onNext,
  onBack,
}: QuarterlyGoalsProps) => {
  const [activeCategory, setActiveCategory] = useState<QuarterlyCategory>(
    selectedCategories[0]
  );
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [newGoal, setNewGoal] = useState<{
    title: string;
    whyItMatters: string;
    difficulty: "light" | "balanced" | "stretch";
  }>({
    title: "",
    whyItMatters: "",
    difficulty: "balanced",
  });

  const currentQuarter = `Q${Math.ceil((new Date().getMonth() + 1) / 3)} ${new Date().getFullYear()}`;

  const categoryGoals = goals.filter((g) => g.category === activeCategory);

  const addGoal = () => {
    if (!newGoal.title.trim()) return;

    const goal: QuarterlyGoal = {
      id: crypto.randomUUID(),
      category: activeCategory,
      title: newGoal.title,
      whyItMatters: newGoal.whyItMatters || undefined,
      difficulty: newGoal.difficulty,
    };

    onGoalsChange([...goals, goal]);
    setNewGoal({ title: "", whyItMatters: "", difficulty: "balanced" });
    setIsAddingGoal(false);
  };

  const removeGoal = (goalId: string) => {
    onGoalsChange(goals.filter((g) => g.id !== goalId));
  };

  const canContinue = goals.length >= 1;

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
          <h1 className="text-2xl font-bold text-foreground">Plan Your Quarter</h1>
          <p className="text-muted-foreground text-sm">Step 3 of 5</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col max-w-lg mx-auto w-full">
        {/* Category Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <div className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap">
            {currentQuarter}
          </div>
          {selectedCategories.map((category) => {
            const config = categoryConfig[category];
            return (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                  activeCategory === category
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted/50"
                )}
              >
                {config.title}
              </button>
            );
          })}
        </div>

        {/* Goals List */}
        <div className="flex-1 space-y-3">
          <AnimatePresence mode="popLayout">
            {categoryGoals.map((goal) => {
              const difficultyConfig = difficultyOptions.find(
                (d) => d.value === goal.difficulty
              );
              return (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-4 border border-primary/20"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-4 h-4 text-primary-foreground" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">{goal.title}</p>
                        {goal.whyItMatters && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {goal.whyItMatters}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "px-2 py-1 rounded-md text-xs font-medium border",
                          difficultyConfig?.color
                        )}
                      >
                        {difficultyConfig?.label}
                      </span>
                      <button
                        onClick={() => removeGoal(goal.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Add Goal Form */}
          <AnimatePresence>
            {isAddingGoal ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-card rounded-xl p-4 border shadow-sm space-y-4"
              >
                <Input
                  placeholder="Goal title (required)"
                  value={newGoal.title}
                  onChange={(e) =>
                    setNewGoal({ ...newGoal, title: e.target.value })
                  }
                  className="rounded-lg"
                  autoFocus
                />
                <Textarea
                  placeholder="Why it matters (optional)"
                  value={newGoal.whyItMatters}
                  onChange={(e) =>
                    setNewGoal({ ...newGoal, whyItMatters: e.target.value })
                  }
                  className="rounded-lg resize-none min-h-[80px]"
                />
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">
                    Difficulty Level
                  </label>
                  <div className="flex gap-2">
                    {difficultyOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() =>
                          setNewGoal({ ...newGoal, difficulty: option.value })
                        }
                        className={cn(
                          "flex-1 py-2 rounded-lg text-sm font-medium border transition-all",
                          newGoal.difficulty === option.value
                            ? option.color
                            : "bg-muted/50 text-muted-foreground border-transparent"
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsAddingGoal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={addGoal}
                    disabled={!newGoal.title.trim()}
                    className="flex-1"
                  >
                    Add Goal
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => setIsAddingGoal(true)}
                className="w-full py-4 rounded-xl border-2 border-dashed border-muted-foreground/30 text-muted-foreground hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add a Quarterly Goal
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 pb-8"
        >
          <Button
            onClick={onNext}
            disabled={!canContinue}
            size="lg"
            className="w-full h-14 text-lg font-semibold rounded-xl disabled:opacity-50"
          >
            Continue
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          {!canContinue && (
            <p className="text-center text-sm text-muted-foreground mt-3">
              Add at least one goal to continue
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default QuarterlyGoals;
