import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Check, Sun, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import VoiceInput from "@/components/VoiceInput";
import { format, addDays, subDays } from "date-fns";

interface DailyGoal {
  id: string;
  title: string;
  completed: boolean;
  progress: number;
  category: "personal" | "professional" | "fitness";
}

interface DailyCheckInProps {
  category: "personal" | "professional" | "fitness";
  dailyGoals: DailyGoal[];
  selectedDate: string;
  onDateChange: (date: string) => void;
  onAddGoal: (title: string) => void;
  onToggleComplete: (id: string) => void;
  onUpdateProgress: (id: string, progress: number) => void;
  onRemoveGoal: (id: string) => void;
}

const categoryConfig = {
  personal: { color: "text-rose-500", bg: "bg-rose-500/10", progress: "bg-rose-500" },
  professional: { color: "text-blue-500", bg: "bg-blue-500/10", progress: "bg-blue-500" },
  fitness: { color: "text-emerald-500", bg: "bg-emerald-500/10", progress: "bg-emerald-500" },
};

const progressEmoji = ["😴", "🌱", "🚶", "🏃", "🔥", "⭐"];
const progressLabels = ["Not started", "Just began", "Making progress", "Going well", "Almost there", "Completed!"];

const DailyCheckIn = ({
  category,
  dailyGoals,
  selectedDate,
  onDateChange,
  onAddGoal,
  onToggleComplete,
  onUpdateProgress,
  onRemoveGoal,
}: DailyCheckInProps) => {
  const [newGoal, setNewGoal] = useState("");
  const config = categoryConfig[category];

  const date = new Date(selectedDate);
  const isToday = format(new Date(), "yyyy-MM-dd") === selectedDate;

  const handleAdd = (text: string) => {
    const trimmed = text.trim();
    if (trimmed) {
      onAddGoal(trimmed);
      setNewGoal("");
    }
  };

  const goToPrevDay = () => {
    onDateChange(format(subDays(date, 1), "yyyy-MM-dd"));
  };

  const goToNextDay = () => {
    onDateChange(format(addDays(date, 1), "yyyy-MM-dd"));
  };

  const completedCount = dailyGoals.filter(g => g.completed || g.progress === 5).length;
  const totalProgress = dailyGoals.length > 0 
    ? Math.round(dailyGoals.reduce((acc, g) => acc + g.progress, 0) / (dailyGoals.length * 5) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${config.bg} mb-2`}>
          <Sun className={`w-8 h-8 ${config.color}`} />
        </div>
        <h2 className="text-2xl font-display font-bold">Daily Check-In</h2>
        <p className="text-muted-foreground">How are your goals going today?</p>
      </div>

      {/* Date Navigation */}
      <div className="flex items-center justify-center gap-4">
        <Button variant="ghost" size="icon" onClick={goToPrevDay} className="rounded-xl">
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div className="text-center min-w-[160px]">
          <p className="font-semibold">{format(date, "EEEE")}</p>
          <p className="text-sm text-muted-foreground">{format(date, "MMMM d, yyyy")}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={goToNextDay} className="rounded-xl">
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Progress Summary */}
      {dailyGoals.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`max-w-lg mx-auto p-4 rounded-xl ${config.bg} border ${config.color.replace("text-", "border-")}/20`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Today's Progress</span>
            <span className={`text-lg font-bold ${config.color}`}>{totalProgress}%</span>
          </div>
          <div className="h-2 rounded-full bg-background">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${totalProgress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className={`h-full rounded-full ${config.progress}`}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {completedCount}/{dailyGoals.length} goals completed
          </p>
        </motion.div>
      )}

      {/* Daily Goals List */}
      <div className="max-w-lg mx-auto space-y-3">
        <AnimatePresence mode="popLayout">
          {dailyGoals.map((goal, index) => (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: index * 0.05 }}
              className={`p-4 rounded-xl border bg-card transition-all ${
                goal.progress === 5 ? `${config.color.replace("text-", "border-")}/30 ${config.bg}` : "border-border"
              }`}
            >
              <div className="flex items-start gap-3 mb-3">
                <button
                  onClick={() => onToggleComplete(goal.id)}
                  className={`mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    goal.completed || goal.progress === 5
                      ? `${config.progress} border-transparent`
                      : "border-muted-foreground/30 hover:border-primary"
                  }`}
                >
                  {(goal.completed || goal.progress === 5) && <Check className="w-4 h-4 text-white" />}
                </button>
                
                <div className="flex-1">
                  <p className={`font-medium ${goal.progress === 5 ? "line-through text-muted-foreground" : ""}`}>
                    {goal.title}
                  </p>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => onRemoveGoal(goal.id)}
                >
                  <X className="w-4 h-4 text-destructive" />
                </Button>
              </div>

              {/* Progress Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{progressEmoji[goal.progress]}</span>
                  <span className="text-sm text-muted-foreground">{progressLabels[goal.progress]}</span>
                </div>
                <Slider
                  value={[goal.progress]}
                  onValueChange={([value]) => onUpdateProgress(goal.id, value)}
                  max={5}
                  step={1}
                  className="cursor-pointer"
                />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Empty State */}
        {dailyGoals.length === 0 && (
          <div className="text-center py-8">
            <Sparkles className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No goals for {isToday ? "today" : "this day"} yet.</p>
            <p className="text-sm text-muted-foreground">Add a simple action below.</p>
          </div>
        )}

        {/* Add Goal */}
        <div className="space-y-2 pt-2">
          <VoiceInput
            onTranscript={handleAdd}
            placeholder="Speak your goal..."
          />
          <div className="flex gap-2">
            <Input
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd(newGoal)}
              placeholder="Add a quick goal for today..."
              className="rounded-xl h-11"
            />
            <Button
              onClick={() => handleAdd(newGoal)}
              disabled={!newGoal.trim()}
              className="rounded-xl h-11"
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyCheckIn;
