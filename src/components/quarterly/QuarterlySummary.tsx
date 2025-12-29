import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Check,
  Heart,
  Briefcase,
  Dumbbell,
  Sparkles,
} from "lucide-react";
import { QuarterlyCategory, QuarterlyPlanningState } from "@/pages/QuarterlyPlanning";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface QuarterlySummaryProps {
  planningState: QuarterlyPlanningState;
  onBack: () => void;
  onComplete: () => void;
}

const categoryConfig: Record<
  QuarterlyCategory,
  { title: string; icon: React.ElementType; color: string; bgColor: string }
> = {
  personal: {
    title: "Personal",
    icon: Heart,
    color: "text-rose-600",
    bgColor: "bg-rose-100 dark:bg-rose-900/30",
  },
  professional: {
    title: "Professional",
    icon: Briefcase,
    color: "text-blue-600",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
  },
  fitness: {
    title: "Fitness",
    icon: Dumbbell,
    color: "text-emerald-600",
    bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
  },
};

const months = ["April", "May", "June"]; // Current quarter months - can be dynamic

const QuarterlySummary = ({
  planningState,
  onBack,
  onComplete,
}: QuarterlySummaryProps) => {
  const { user } = useAuth();
  const [activeMonth, setActiveMonth] = useState(months[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Group goals by category
  const goalsByCategory = planningState.selectedCategories.reduce(
    (acc, category) => {
      acc[category] = planningState.goals.filter((g) => g.category === category);
      return acc;
    },
    {} as Record<QuarterlyCategory, typeof planningState.goals>
  );

  // Calculate energy distribution
  const energyDistribution = {
    light: planningState.goals.filter((g) => g.difficulty === "light").length,
    balanced: planningState.goals.filter((g) => g.difficulty === "balanced").length,
    stretch: planningState.goals.filter((g) => g.difficulty === "stretch").length,
  };

  const handleAutoSplit = async () => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      // Save yearly goals for each goal
      const yearlyGoalPromises = planningState.goals.map(async (goal) => {
        const { data, error } = await supabase
          .from("yearly_goals")
          .insert({
            user_id: user.id,
            category: goal.category,
            title: goal.title,
            description: goal.whyItMatters || null,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      });

      await Promise.all(yearlyGoalPromises);

      toast.success("Quarterly plan saved successfully!");
      onComplete();
    } catch (error) {
      console.error("Error saving quarterly plan:", error);
      toast.error("Failed to save quarterly plan");
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <h1 className="text-2xl font-bold text-foreground">Quarter Overview</h1>
          <p className="text-muted-foreground text-sm">Step 5 of 5</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col max-w-lg mx-auto w-full">
        {/* Month Tabs */}
        <div className="flex gap-2 mb-6">
          {months.map((month) => (
            <button
              key={month}
              onClick={() => setActiveMonth(month)}
              className={cn(
                "flex-1 py-2 rounded-full text-sm font-medium transition-colors",
                activeMonth === month
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted/50"
              )}
            >
              {month}
            </button>
          ))}
        </div>

        {/* Energy Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-2 mb-6"
        >
          {[
            { key: "light", label: "Light", color: "bg-green-500" },
            { key: "balanced", label: "May", color: "bg-amber-500" },
            { key: "stretch", label: "June", color: "bg-red-500" },
          ].map((item) => (
            <div
              key={item.key}
              className={cn(
                "px-4 py-2 rounded-full text-xs font-medium text-white",
                item.color
              )}
            >
              {item.label}
            </div>
          ))}
        </motion.div>

        {/* Goals by Category */}
        <div className="flex-1 space-y-4">
          {Object.entries(goalsByCategory).map(([category, goals], categoryIndex) => {
            const config = categoryConfig[category as QuarterlyCategory];
            const Icon = config.icon;

            return (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: categoryIndex * 0.1 }}
                className="bg-card rounded-xl border p-4"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", config.bgColor)}>
                    <Icon className={cn("w-4 h-4", config.color)} />
                  </div>
                  <span className="font-semibold text-foreground">{config.title}</span>
                </div>

                <div className="space-y-2">
                  {goals.map((goal, goalIndex) => (
                    <motion.div
                      key={goal.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: categoryIndex * 0.1 + goalIndex * 0.05 }}
                      className="flex items-start gap-3"
                    >
                      <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-green-600" />
                      </div>
                      <span className="text-sm text-foreground">{goal.title}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            );
          })}

          {/* Vision Summary */}
          {planningState.vision && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-muted/50 rounded-xl p-4 border border-dashed"
            >
              <p className="text-sm text-muted-foreground italic">
                "{planningState.vision}"
              </p>
            </motion.div>
          )}
        </div>

        {/* Auto Split Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 pb-8"
        >
          <Button
            onClick={handleAutoSplit}
            disabled={isSubmitting}
            size="lg"
            className="w-full h-14 text-lg font-semibold rounded-xl bg-gradient-to-r from-primary to-primary/80"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            {isSubmitting ? "Saving..." : "Auto Split Into Months"}
          </Button>
          <p className="text-center text-sm text-muted-foreground mt-3">
            We'll help break down your goals into monthly milestones
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default QuarterlySummary;
