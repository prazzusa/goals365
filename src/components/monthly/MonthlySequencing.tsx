import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, AlertTriangle, Lightbulb, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, startOfWeek, addWeeks, endOfWeek } from "date-fns";
import { MonthlyObjective } from "./MonthlyObjectives";

interface MonthlySequencingProps {
  selectedMonth: Date;
  objectives: MonthlyObjective[];
  onNext: () => void;
  onBack: () => void;
}

const MonthlySequencing = ({
  selectedMonth,
  objectives,
  onNext,
  onBack,
}: MonthlySequencingProps) => {
  // Calculate weeks in the month
  const weeksInMonth = [0, 1, 2, 3].map((i) => {
    const weekStart = startOfWeek(addWeeks(selectedMonth, i));
    const weekEnd = endOfWeek(weekStart);
    return { start: weekStart, end: weekEnd };
  });

  // Analyze workload
  const totalEffort = objectives.reduce((acc, obj) => {
    return acc + (obj.effort === "large" ? 3 : obj.effort === "medium" ? 2 : 1);
  }, 0);

  const isOverloaded = totalEffort > 8;
  const isLightLoad = totalEffort < 3;

  const effortDistribution = {
    small: objectives.filter((o) => o.effort === "small").length,
    medium: objectives.filter((o) => o.effort === "medium").length,
    large: objectives.filter((o) => o.effort === "large").length,
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
          <h1 className="text-2xl font-bold text-foreground">Intelligent Sequencing</h1>
          <p className="text-muted-foreground text-sm">
            {format(selectedMonth, "MMMM")} • Step 4 of 4
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col max-w-lg mx-auto w-full">
        {/* Workload Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "p-4 rounded-xl border mb-6",
            isOverloaded
              ? "border-amber-500/50 bg-amber-50 dark:bg-amber-900/20"
              : isLightLoad
              ? "border-blue-500/50 bg-blue-50 dark:bg-blue-900/20"
              : "border-green-500/50 bg-green-50 dark:bg-green-900/20"
          )}
        >
          <div className="flex items-start gap-3">
            {isOverloaded ? (
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
            ) : (
              <Lightbulb className="w-5 h-5 text-primary mt-0.5" />
            )}
            <div>
              <h3 className="font-semibold text-foreground mb-1">
                {isOverloaded
                  ? "This looks ambitious"
                  : isLightLoad
                  ? "Room for more"
                  : "Well balanced"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {isOverloaded
                  ? "Consider spreading some objectives across weeks or reducing scope."
                  : isLightLoad
                  ? "You have capacity for more objectives if needed."
                  : "Your workload is well distributed across the month."}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Effort Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            Effort Distribution
          </h3>
          <div className="flex gap-2">
            <div className="flex-1 bg-green-100 dark:bg-green-900/30 rounded-lg p-3 text-center">
              <span className="text-2xl font-bold text-green-700 dark:text-green-400">
                {effortDistribution.small}
              </span>
              <p className="text-xs text-green-600 dark:text-green-500">Small</p>
            </div>
            <div className="flex-1 bg-amber-100 dark:bg-amber-900/30 rounded-lg p-3 text-center">
              <span className="text-2xl font-bold text-amber-700 dark:text-amber-400">
                {effortDistribution.medium}
              </span>
              <p className="text-xs text-amber-600 dark:text-amber-500">Medium</p>
            </div>
            <div className="flex-1 bg-red-100 dark:bg-red-900/30 rounded-lg p-3 text-center">
              <span className="text-2xl font-bold text-red-700 dark:text-red-400">
                {effortDistribution.large}
              </span>
              <p className="text-xs text-red-600 dark:text-red-500">Large</p>
            </div>
          </div>
        </motion.div>

        {/* Week Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex-1"
        >
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            Weekly Overview
          </h3>
          <div className="space-y-2">
            {weeksInMonth.map((week, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
              >
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    Week {index + 1}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(week.start, "MMM d")} - {format(week.end, "MMM d")}
                  </p>
                </div>
                <div className="flex gap-1">
                  {[...Array(Math.ceil(objectives.length / 4))].map((_, i) => (
                    <div
                      key={i}
                      className="w-2 h-2 rounded-full bg-primary/40"
                    />
                  ))}
                </div>
              </div>
            ))}
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
            Plan My Week
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default MonthlySequencing;
