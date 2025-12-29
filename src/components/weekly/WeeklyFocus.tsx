import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Target, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, startOfWeek, endOfWeek } from "date-fns";

interface WeeklyFocusProps {
  currentWeek: Date;
  activeGoals: { id: string; title: string; category: string }[];
  suggestedFocus: string[];
  onNext: () => void;
  onBack: () => void;
}

const categoryColors: Record<string, string> = {
  personal: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
  professional: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  fitness: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
};

const WeeklyFocus = ({
  currentWeek,
  activeGoals,
  suggestedFocus,
  onNext,
  onBack,
}: WeeklyFocusProps) => {
  const weekStart = startOfWeek(currentWeek);
  const weekEnd = endOfWeek(currentWeek);

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
          <h1 className="text-2xl font-bold text-foreground">Weekly Focus</h1>
          <p className="text-muted-foreground text-sm">
            {format(weekStart, "MMM d")} - {format(weekEnd, "MMM d")} • Step 1 of 4
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col max-w-lg mx-auto w-full">
        {/* Current Week Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary/10 rounded-xl p-4 mb-6 text-center"
        >
          <p className="text-sm text-primary font-medium">This Week</p>
          <p className="text-lg font-semibold text-foreground">
            {format(weekStart, "MMMM d")} - {format(weekEnd, "d, yyyy")}
          </p>
        </motion.div>

        {/* Active Goals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
            <Target className="w-4 h-4" />
            Active Monthly Goals
          </h3>
          <div className="space-y-2">
            {activeGoals.map((goal, index) => (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className="p-3 rounded-lg border bg-card flex items-center gap-3"
              >
                <span
                  className={cn(
                    "px-2 py-0.5 rounded text-xs font-medium capitalize",
                    categoryColors[goal.category]
                  )}
                >
                  {goal.category}
                </span>
                <span className="text-sm font-medium text-foreground">
                  {goal.title}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Suggested Focus Areas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex-1"
        >
          <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            Suggested Focus Areas
          </h3>
          <div className="space-y-2">
            {suggestedFocus.length > 0 ? (
              suggestedFocus.map((focus, index) => (
                <div
                  key={index}
                  className="p-3 rounded-lg bg-muted/50 text-sm text-foreground"
                >
                  {focus}
                </div>
              ))
            ) : (
              <div className="p-4 rounded-lg bg-muted/50 text-center text-muted-foreground">
                Focus on making meaningful progress on your active goals
              </div>
            )}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 pt-4"
        >
          <Button
            onClick={onNext}
            size="lg"
            className="w-full h-14 text-lg font-semibold rounded-xl"
          >
            Break into Tasks
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default WeeklyFocus;
