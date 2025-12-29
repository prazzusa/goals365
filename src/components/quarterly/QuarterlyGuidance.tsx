import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ArrowRight,
  Lightbulb,
  AlertTriangle,
  CheckCircle2,
  Scale,
} from "lucide-react";
import { QuarterlyGoal } from "@/pages/QuarterlyPlanning";
import { cn } from "@/lib/utils";

interface QuarterlyGuidanceProps {
  goals: QuarterlyGoal[];
  onNext: () => void;
  onBack: () => void;
}

interface Insight {
  type: "success" | "warning" | "tip";
  icon: React.ElementType;
  title: string;
  message: string;
}

const QuarterlyGuidance = ({ goals, onNext, onBack }: QuarterlyGuidanceProps) => {
  // Analyze goals and generate insights
  const generateInsights = (): Insight[] => {
    const insights: Insight[] = [];
    
    const stretchCount = goals.filter((g) => g.difficulty === "stretch").length;
    const lightCount = goals.filter((g) => g.difficulty === "light").length;
    const totalGoals = goals.length;
    
    // Check for overload
    if (stretchCount > 2) {
      insights.push({
        type: "warning",
        icon: AlertTriangle,
        title: "Ambitious Quarter Ahead",
        message: `You have ${stretchCount} stretch goals. Consider converting one to "balanced" to avoid burnout.`,
      });
    }

    // Check for balance
    const categories = new Set(goals.map((g) => g.category));
    if (categories.size === 3 && totalGoals >= 3) {
      insights.push({
        type: "success",
        icon: Scale,
        title: "Well-Balanced Plan",
        message: "Great job! You've set goals across all life areas for holistic growth.",
      });
    }

    // Check for too many goals
    if (totalGoals > 6) {
      insights.push({
        type: "warning",
        icon: AlertTriangle,
        title: "Consider Prioritizing",
        message: "With more than 6 quarterly goals, focus might become difficult. Consider removing lower-priority items.",
      });
    }

    // Encourage if mostly light goals
    if (lightCount === totalGoals && totalGoals > 0) {
      insights.push({
        type: "tip",
        icon: Lightbulb,
        title: "Room to Grow",
        message: "All your goals are light intensity. Consider adding one balanced goal for meaningful progress.",
      });
    }

    // Default positive insight if no issues
    if (insights.length === 0) {
      insights.push({
        type: "success",
        icon: CheckCircle2,
        title: "Looking Good!",
        message: "Your quarterly plan is balanced and achievable. You're set for success!",
      });
    }

    return insights;
  };

  const insights = generateInsights();

  const getInsightStyles = (type: Insight["type"]) => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800";
      case "warning":
        return "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800";
      case "tip":
        return "bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800";
    }
  };

  const getIconStyles = (type: Insight["type"]) => {
    switch (type) {
      case "success":
        return "text-green-600";
      case "warning":
        return "text-amber-600";
      case "tip":
        return "text-blue-600";
    }
  };

  return (
    <div className="min-h-screen flex flex-col px-6 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Intelligent Guidance</h1>
          <p className="text-muted-foreground text-sm">Step 4 of 5</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col max-w-lg mx-auto w-full">
        {/* Introduction */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <Lightbulb className="w-8 h-8 text-primary" />
          </div>
          <p className="text-muted-foreground">
            Based on your goals, here's what we think...
          </p>
        </motion.div>

        {/* Insights */}
        <div className="flex-1 space-y-4">
          {insights.map((insight, index) => {
            const Icon = insight.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.15 }}
                className={cn(
                  "rounded-xl p-5 border",
                  getInsightStyles(insight.type)
                )}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                      insight.type === "success" && "bg-green-100 dark:bg-green-900/50",
                      insight.type === "warning" && "bg-amber-100 dark:bg-amber-900/50",
                      insight.type === "tip" && "bg-blue-100 dark:bg-blue-900/50"
                    )}
                  >
                    <Icon className={cn("w-5 h-5", getIconStyles(insight.type))} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">
                      {insight.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {insight.message}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Stats Summary */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 grid grid-cols-3 gap-3"
        >
          {[
            { label: "Total Goals", value: goals.length },
            {
              label: "Categories",
              value: new Set(goals.map((g) => g.category)).size,
            },
            {
              label: "Stretch Goals",
              value: goals.filter((g) => g.difficulty === "stretch").length,
            },
          ].map((stat, index) => (
            <div
              key={index}
              className="bg-muted/50 rounded-xl p-4 text-center"
            >
              <div className="text-2xl font-bold text-foreground">
                {stat.value}
              </div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 pb-8"
        >
          <Button
            onClick={onNext}
            size="lg"
            className="w-full h-14 text-lg font-semibold rounded-xl"
          >
            View Quarter Summary
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default QuarterlyGuidance;
