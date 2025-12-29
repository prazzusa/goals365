import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, addMonths, startOfMonth } from "date-fns";

interface MonthSelectorProps {
  selectedMonth: Date;
  onMonthSelect: (month: Date) => void;
  onNext: () => void;
  onBack: () => void;
}

const MonthSelector = ({
  selectedMonth,
  onMonthSelect,
  onNext,
  onBack,
}: MonthSelectorProps) => {
  const currentMonth = startOfMonth(new Date());
  const months = [
    currentMonth,
    addMonths(currentMonth, 1),
    addMonths(currentMonth, 2),
  ];

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
          <h1 className="text-2xl font-bold text-foreground">Select Month</h1>
          <p className="text-muted-foreground text-sm">Step 1 of 4</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col max-w-lg mx-auto w-full">
        <p className="text-muted-foreground mb-6 text-center">
          Which month would you like to focus on?
        </p>

        <div className="space-y-3">
          {months.map((month, index) => {
            const isSelected =
              format(month, "yyyy-MM") === format(selectedMonth, "yyyy-MM");
            const isCurrent =
              format(month, "yyyy-MM") === format(currentMonth, "yyyy-MM");

            return (
              <motion.button
                key={format(month, "yyyy-MM")}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => onMonthSelect(month)}
                className={cn(
                  "w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between",
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50",
                  isCurrent && "ring-2 ring-primary/20"
                )}
              >
                <div>
                  <span className="font-semibold text-foreground block">
                    {format(month, "MMMM yyyy")}
                  </span>
                  {isCurrent && (
                    <span className="text-xs text-primary">Current month</span>
                  )}
                </div>
                {isSelected && (
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>

        <div className="mt-auto pt-8">
          <Button
            onClick={onNext}
            size="lg"
            className="w-full h-14 text-lg font-semibold rounded-xl"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MonthSelector;
