import { useMemo } from "react";
import { motion } from "framer-motion";
import { Trophy, TrendingUp, Calendar, Star, Flame, CheckCircle2 } from "lucide-react";
import { format, startOfWeek, addDays, subDays, isSameDay } from "date-fns";

interface DailyGoal {
  id: string;
  title: string;
  completed: boolean;
  progress: number;
  date: string;
  category: "personal" | "professional" | "fitness";
}

interface ProgressTrackerProps {
  category: "personal" | "professional" | "fitness";
  dailyGoals: DailyGoal[];
}

const categoryConfig = {
  personal: { color: "text-rose-500", bg: "bg-rose-500/10", fill: "bg-rose-500" },
  professional: { color: "text-blue-500", bg: "bg-blue-500/10", fill: "bg-blue-500" },
  fitness: { color: "text-emerald-500", bg: "bg-emerald-500/10", fill: "bg-emerald-500" },
};

const ProgressTracker = ({ category, dailyGoals }: ProgressTrackerProps) => {
  const config = categoryConfig[category];

  // Calculate stats
  const stats = useMemo(() => {
    const categoryGoals = dailyGoals.filter(g => g.category === category);
    const completedGoals = categoryGoals.filter(g => g.completed || g.progress === 5);
    const totalProgress = categoryGoals.reduce((acc, g) => acc + g.progress, 0);
    const maxProgress = categoryGoals.length * 5;

    // Calculate streak
    let streak = 0;
    const today = new Date();
    let checkDate = today;
    
    while (true) {
      const dateStr = format(checkDate, "yyyy-MM-dd");
      const dayGoals = categoryGoals.filter(g => g.date === dateStr);
      if (dayGoals.length === 0) break;
      
      const dayCompleted = dayGoals.every(g => g.completed || g.progress >= 4);
      if (!dayCompleted) break;
      
      streak++;
      checkDate = subDays(checkDate, 1);
    }

    // Get last 7 days data
    const weekData = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(today, i);
      const dateStr = format(date, "yyyy-MM-dd");
      const dayGoals = categoryGoals.filter(g => g.date === dateStr);
      const dayAvg = dayGoals.length > 0 
        ? Math.round(dayGoals.reduce((acc, g) => acc + g.progress, 0) / dayGoals.length) 
        : 0;
      
      weekData.push({
        date,
        dateStr,
        dayName: format(date, "EEE"),
        goals: dayGoals.length,
        completed: dayGoals.filter(g => g.completed || g.progress === 5).length,
        avgProgress: dayAvg,
        isToday: isSameDay(date, today),
      });
    }

    return {
      totalGoals: categoryGoals.length,
      completedGoals: completedGoals.length,
      avgProgress: maxProgress > 0 ? Math.round((totalProgress / maxProgress) * 100) : 0,
      streak,
      weekData,
    };
  }, [dailyGoals, category]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${config.bg} mb-2`}>
          <TrendingUp className={`w-8 h-8 ${config.color}`} />
        </div>
        <h2 className="text-2xl font-display font-bold">Your Progress</h2>
        <p className="text-muted-foreground">Celebrate how far you've come!</p>
      </div>

      {/* Stats Cards */}
      <div className="max-w-lg mx-auto grid grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`p-4 rounded-xl ${config.bg} text-center`}
        >
          <Trophy className={`w-6 h-6 ${config.color} mx-auto mb-2`} />
          <p className="text-2xl font-bold">{stats.completedGoals}</p>
          <p className="text-xs text-muted-foreground">Goals Completed</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`p-4 rounded-xl ${config.bg} text-center`}
        >
          <Flame className={`w-6 h-6 ${config.color} mx-auto mb-2`} />
          <p className="text-2xl font-bold">{stats.streak}</p>
          <p className="text-xs text-muted-foreground">Day Streak</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`p-4 rounded-xl ${config.bg} text-center`}
        >
          <Star className={`w-6 h-6 ${config.color} mx-auto mb-2`} />
          <p className="text-2xl font-bold">{stats.avgProgress}%</p>
          <p className="text-xs text-muted-foreground">Avg Progress</p>
        </motion.div>
      </div>

      {/* Weekly Consistency Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="max-w-lg mx-auto p-6 rounded-xl bg-card border border-border"
      >
        <div className="flex items-center gap-2 mb-4">
          <Calendar className={`w-5 h-5 ${config.color}`} />
          <h3 className="font-semibold">Weekly Consistency</h3>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {stats.weekData.map((day, index) => (
            <div key={day.dateStr} className="text-center">
              <p className="text-xs text-muted-foreground mb-2">{day.dayName}</p>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5 + index * 0.05 }}
                className={`relative w-10 h-10 mx-auto rounded-xl flex items-center justify-center ${
                  day.avgProgress === 5 
                    ? config.fill 
                    : day.avgProgress > 0 
                    ? config.bg 
                    : "bg-muted"
                } ${day.isToday ? "ring-2 ring-offset-2 ring-primary" : ""}`}
              >
                {day.avgProgress === 5 ? (
                  <CheckCircle2 className="w-5 h-5 text-white" />
                ) : day.avgProgress > 0 ? (
                  <span className={`text-sm font-semibold ${config.color}`}>{day.avgProgress}</span>
                ) : (
                  <span className="text-xs text-muted-foreground">-</span>
                )}
              </motion.div>
              <p className="text-[10px] text-muted-foreground mt-1">
                {day.goals > 0 ? `${day.completed}/${day.goals}` : ""}
              </p>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-muted" />
            <span className="text-xs text-muted-foreground">No goals</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded ${config.bg}`} />
            <span className="text-xs text-muted-foreground">In progress</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded ${config.fill}`} />
            <span className="text-xs text-muted-foreground">Complete</span>
          </div>
        </div>
      </motion.div>

      {/* Encouragement */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-center"
      >
        {stats.streak > 0 ? (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary">
            <Flame className="w-4 h-4" />
            <span className="text-sm font-medium">
              {stats.streak === 1 ? "Great start!" : `${stats.streak} day streak! Keep it up!`}
            </span>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Every journey starts with a single step. You've got this! 💪
          </p>
        )}
      </motion.div>
    </div>
  );
};

export default ProgressTracker;
