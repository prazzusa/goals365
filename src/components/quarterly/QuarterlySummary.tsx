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
import { QuarterlyPlanningState } from "@/pages/QuarterlyPlanning";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

type QuarterlyCategory = "personal" | "professional" | "fitness";

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

const months = ["April", "May", "June"];

const QuarterlySummary = ({
  planningState,
  onBack,
  onComplete,
}: QuarterlySummaryProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeMonth, setActiveMonth] = useState(months[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get goals from the planning state
  const monthlyGoals = planningState.monthlyGoals || [];
  const weeklyPriorities = planningState.weeklyPriorities || [];

  const handleAutoSplit = async () => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      // Save yearly goals from monthly goals
      if (monthlyGoals.length > 0) {
        const yearlyGoalPromises = monthlyGoals.map(async (goal) => {
          const { data, error } = await supabase
            .from("yearly_goals")
            .insert({
              user_id: user.id,
              category: "personal",
              title: goal.title,
              description: null,
            })
            .select()
            .single();

          if (error) throw error;
          return data;
        });

        await Promise.all(yearlyGoalPromises);
      }

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

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-2 mb-6"
        >
          {[
            { key: "light", label: "Light", color: "bg-green-500" },
            { key: "balanced", label: "Medium", color: "bg-amber-500" },
            { key: "stretch", label: "Stretch", color: "bg-red-500" },
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

        <div className="flex-1 space-y-4">
          {/* Monthly Goals */}
          {monthlyGoals.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-xl border p-4"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", categoryConfig.personal.bgColor)}>
                  <Heart className={cn("w-4 h-4", categoryConfig.personal.color)} />
                </div>
                <span className="font-semibold text-foreground">Monthly Goals</span>
              </div>

              <div className="space-y-2">
                {monthlyGoals.map((goal, goalIndex) => (
                  <motion.div
                    key={goal.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: goalIndex * 0.05 }}
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
          )}

          {/* Weekly Priorities */}
          {weeklyPriorities.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card rounded-xl border p-4"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", categoryConfig.professional.bgColor)}>
                  <Briefcase className={cn("w-4 h-4", categoryConfig.professional.color)} />
                </div>
                <span className="font-semibold text-foreground">Weekly Priorities</span>
              </div>

              <div className="space-y-2">
                {weeklyPriorities.map((priority, idx) => (
                  <motion.div
                    key={priority.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 + idx * 0.05 }}
                    className="flex items-start gap-3"
                  >
                    <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-blue-600" />
                    </div>
                    <span className="text-sm text-foreground">{priority.title}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

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

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 pb-8 space-y-3"
        >
          <Button
            onClick={handleAutoSplit}
            disabled={isSubmitting}
            size="lg"
            className="w-full h-14 text-lg font-semibold rounded-xl bg-gradient-to-r from-primary to-primary/80"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            {isSubmitting ? "Saving..." : "Save & Continue"}
          </Button>
          <Button
            onClick={() => navigate("/monthly")}
            variant="outline"
            size="lg"
            className="w-full h-14 text-lg font-semibold rounded-xl"
          >
            Refine into Monthly Focus
          </Button>
          <p className="text-center text-sm text-muted-foreground mt-3">
            Break down your quarterly vision into actionable monthly goals
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default QuarterlySummary;
