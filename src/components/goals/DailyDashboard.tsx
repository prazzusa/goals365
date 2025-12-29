import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format, startOfWeek, addDays, subDays, isToday } from "date-fns";
import { Plus, Check, ChevronLeft, ChevronRight, Edit2, Sparkles, Mic, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useNavigate } from "react-router-dom";
import VoiceInput from "@/components/VoiceInput";
import { MomentumScore } from "@/components/dashboard/MomentumScore";
import { useMomentum } from "@/hooks/useMomentum";
import type { YearlyGoal, MonthlyGoal, WeeklyGoal, DailyGoal } from "@/hooks/useGoals";

type GoalCategory = "personal" | "professional" | "fitness";

interface DailyDashboardProps {
  userName?: string;
  yearlyGoals: YearlyGoal[];
  monthlyGoals: MonthlyGoal[];
  weeklyGoals: WeeklyGoal[];
  dailyGoals: DailyGoal[];
  selectedDate: string;
  onDateChange: (date: string) => void;
  onAddDailyGoal: (category: GoalCategory, title: string) => void;
  onUpdateDailyGoal: (id: string, updates: Partial<DailyGoal>) => void;
  onRemoveDailyGoal: (id: string) => void;
  onSignOut: () => void;
}

const categoryConfig = {
  personal: { 
    label: "Personal Goals", 
    color: "hsl(340 80% 60%)", 
    bgColor: "bg-pink-50", 
    borderColor: "border-pink-200",
    progressBg: "bg-pink-100",
    progressFill: "bg-pink-500"
  },
  professional: { 
    label: "Professional Goals", 
    color: "hsl(150 60% 45%)", 
    bgColor: "bg-emerald-50", 
    borderColor: "border-emerald-200",
    progressBg: "bg-emerald-100",
    progressFill: "bg-emerald-500"
  },
  fitness: { 
    label: "Fitness Goals", 
    color: "hsl(45 90% 55%)", 
    bgColor: "bg-amber-50", 
    borderColor: "border-amber-200",
    progressBg: "bg-amber-100",
    progressFill: "bg-amber-500"
  },
};

// Circular Progress Component with enhanced animations
const CircularProgress = ({ 
  percentage, 
  label, 
  color,
  size = 100,
  delay = 0
}: { 
  percentage: number; 
  label: string; 
  color: string;
  size?: number;
  delay?: number;
}) => {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <motion.div 
      className="flex flex-col items-center gap-2"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.4, ease: "easeOut" }}
    >
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={strokeWidth}
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, delay: delay + 0.2, ease: "easeOut" }}
          />
        </svg>
        <motion.div 
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.5 }}
        >
          <motion.span 
            className="text-xl font-bold text-foreground"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: delay + 0.6, type: "spring", stiffness: 200 }}
          >
            {percentage}%
          </motion.span>
        </motion.div>
      </div>
      <motion.span 
        className="text-xs text-muted-foreground font-medium"
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: delay + 0.3 }}
      >
        {label}
      </motion.span>
    </motion.div>
  );
};

// Goal Category Card Component with enhanced animations
const GoalCategoryCard = ({
  category,
  goals,
  weeklyGoals,
  onEdit,
  index = 0,
}: {
  category: GoalCategory;
  goals: DailyGoal[];
  weeklyGoals: WeeklyGoal[];
  onEdit: () => void;
  index?: number;
}) => {
  const config = categoryConfig[category];
  const completedSteps = goals.filter(g => g.completed).length;
  const totalSteps = Math.max(goals.length, 1);
  const progressPercent = Math.round((completedSteps / totalSteps) * 100);
  
  // Get a sample goal to display
  const displayGoal = goals[0] || weeklyGoals[0];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      whileHover={{ scale: 1.02, y: -2 }}
      className={`${config.bgColor} ${config.borderColor} border rounded-2xl p-4 relative cursor-pointer transition-shadow hover:shadow-lg`}
    >
      <div className="flex items-start justify-between mb-3">
        <motion.h3 
          className="font-semibold text-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.1 + 0.1 }}
        >
          {config.label}
        </motion.h3>
        <motion.button 
          onClick={onEdit}
          className="text-primary text-sm font-medium hover:underline"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Edit
        </motion.button>
      </div>
      
      {displayGoal ? (
        <motion.div 
          className="space-y-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 + 0.2 }}
        >
          <p className="text-sm text-foreground font-medium">
            {displayGoal.title}
          </p>
          <p className="text-xs text-muted-foreground">
            {completedSteps} / {totalSteps} steps this week
          </p>
          <div className={`h-2 ${config.progressBg} rounded-full overflow-hidden`}>
            <motion.div
              className={`h-full ${config.progressFill} rounded-full`}
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.8, delay: index * 0.1 + 0.3 }}
            />
          </div>
        </motion.div>
      ) : (
        <motion.p 
          className="text-sm text-muted-foreground italic"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.1 + 0.2 }}
        >
          No goals set yet
        </motion.p>
      )}
    </motion.div>
  );
};

// Today's Progress Section
const TodayProgress = ({
  progress,
  onProgressChange,
}: {
  progress: number;
  onProgressChange: (value: number) => void;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-2xl p-5"
    >
      <h3 className="text-lg font-semibold text-center mb-2">Today's Progress</h3>
      <p className="text-sm text-muted-foreground text-center mb-4">
        How much progress did you make today?
      </p>
      
      <div className="flex justify-center gap-2 mb-4">
        {[1, 2, 3, 4, 5].map((value) => (
          <motion.button
            key={value}
            onClick={() => onProgressChange(value)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className={`w-12 h-12 rounded-xl font-semibold text-lg transition-all ${
              progress >= value
                ? "bg-primary text-primary-foreground shadow-lg"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {value}
          </motion.button>
        ))}
      </div>
      
      <div className="flex justify-between text-xs text-muted-foreground px-2">
        <span>Very Little</span>
        <span>Excellent</span>
      </div>
    </motion.div>
  );
};

// Weekly Review Section
const WeeklyReview = ({ dailyGoals }: { dailyGoals: DailyGoal[] }) => {
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(weekStart, i);
    const dateStr = format(date, "yyyy-MM-dd");
    const dayGoals = dailyGoals.filter(g => g.date === dateStr);
    const completed = dayGoals.filter(g => g.completed).length;
    const total = dayGoals.length;
    const percentage = total > 0 ? (completed / total) * 100 : 0;
    
    return {
      day: format(date, "EEE").charAt(0),
      date: dateStr,
      isToday: isToday(date),
      percentage,
      hasGoals: total > 0,
    };
  });

  const getColor = (percentage: number, hasGoals: boolean) => {
    if (!hasGoals) return "bg-muted";
    if (percentage >= 80) return "bg-primary";
    if (percentage >= 50) return "bg-amber-400";
    return "bg-muted";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-2xl p-5"
    >
      <h3 className="text-lg font-semibold mb-4">Weekly Review</h3>
      
      <div className="flex justify-between gap-2">
        {weekDays.map((day, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <span className={`text-xs font-medium ${day.isToday ? "text-primary" : "text-muted-foreground"}`}>
              {day.day}
            </span>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className={`w-9 h-9 rounded-full flex items-center justify-center ${getColor(day.percentage, day.hasGoals)} ${
                day.isToday ? "ring-2 ring-primary ring-offset-2" : ""
              }`}
            >
              {day.percentage >= 80 && day.hasGoals && (
                <Check className="w-4 h-4 text-primary-foreground" />
              )}
            </motion.div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

// Daily Goals List
const DailyGoalsList = ({
  goals,
  category,
  onToggle,
  onUpdateProgress,
  onUpdateNotes,
  onRemove,
}: {
  goals: DailyGoal[];
  category: GoalCategory;
  onToggle: (id: string) => void;
  onUpdateProgress: (id: string, progress: number) => void;
  onUpdateNotes: (id: string, notes: string) => void;
  onRemove: (id: string) => void;
}) => {
  const config = categoryConfig[category];
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (goals.length === 0) return null;

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
        {config.label}
      </h4>
      <AnimatePresence>
        {goals.map((goal) => (
          <motion.div
            key={goal.id}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className={`${config.bgColor} ${config.borderColor} border rounded-2xl p-4`}
          >
            <div className="flex items-center gap-3">
              <motion.button
                onClick={() => onToggle(goal.id)}
                whileTap={{ scale: 0.9 }}
                className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
                  goal.completed
                    ? `${config.progressFill} border-transparent`
                    : `border-muted-foreground/30 bg-background`
                }`}
              >
                {goal.completed && <Check className="w-4 h-4 text-white" />}
              </motion.button>
              
              <div className="flex-1 min-w-0">
                <p className={`font-medium ${goal.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                  {goal.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <div className={`flex-1 h-1.5 ${config.progressBg} rounded-full overflow-hidden`}>
                    <motion.div
                      className={`h-full ${config.progressFill} rounded-full`}
                      initial={{ width: 0 }}
                      animate={{ width: `${goal.progress * 20}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">{goal.progress}/5</span>
                </div>
              </div>
              
              <button
                onClick={() => setExpandedId(expandedId === goal.id ? null : goal.id)}
                className="p-2 hover:bg-background/50 rounded-lg transition-colors"
              >
                <Edit2 className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            
            {/* Expanded section for notes and progress */}
            <AnimatePresence>
              {expandedId === goal.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 space-y-3">
                    {/* Progress buttons */}
                    <div className="flex gap-2 justify-center">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <button
                          key={value}
                          onClick={() => onUpdateProgress(goal.id, value)}
                          className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all ${
                            goal.progress >= value
                              ? `${config.progressFill} text-white`
                              : "bg-background text-muted-foreground"
                          }`}
                        >
                          {value}
                        </button>
                      ))}
                    </div>
                    
                    {/* Notes */}
                    <Textarea
                      placeholder="Add a note or reflection..."
                      value={goal.notes || ""}
                      onChange={(e) => onUpdateNotes(goal.id, e.target.value)}
                      className="bg-background/50 border-0 resize-none text-sm rounded-xl min-h-[60px]"
                    />
                    
                    <button
                      onClick={() => onRemove(goal.id)}
                      className="text-destructive text-sm hover:underline"
                    >
                      Remove goal
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

// Add Goal Input
const AddGoalInput = ({
  category,
  onAdd,
}: {
  category: GoalCategory;
  onAdd: (title: string) => void;
}) => {
  const [value, setValue] = useState("");
  const [showVoice, setShowVoice] = useState(false);
  const config = categoryConfig[category];

  const handleAdd = () => {
    if (value.trim()) {
      onAdd(value.trim());
      setValue("");
    }
  };

  const handleVoiceResult = (text: string) => {
    setValue(text);
    setShowVoice(false);
  };

  return (
    <div className={`${config.bgColor} ${config.borderColor} border rounded-2xl p-4 space-y-3`}>
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={`Add ${config.label.toLowerCase().replace(" goals", "")} goal...`}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          className="flex-1 bg-background border-0 rounded-xl h-12 text-base"
        />
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowVoice(!showVoice)}
          className="h-12 w-12 rounded-xl shrink-0"
        >
          <Mic className="w-5 h-5" />
        </Button>
        <Button
          onClick={handleAdd}
          size="icon"
          className="h-12 w-12 rounded-xl shrink-0"
          disabled={!value.trim()}
        >
          <Plus className="w-5 h-5" />
        </Button>
      </div>
      {showVoice && (
        <VoiceInput onTranscript={handleVoiceResult} />
      )}
    </div>
  );
};

const DailyDashboard = ({
  userName,
  yearlyGoals,
  monthlyGoals,
  weeklyGoals,
  dailyGoals,
  selectedDate,
  onDateChange,
  onAddDailyGoal,
  onUpdateDailyGoal,
  onRemoveDailyGoal,
  onSignOut,
}: DailyDashboardProps) => {
  const navigate = useNavigate();
  const [todayProgress, setTodayProgress] = useState(3);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const { momentum, loading: momentumLoading } = useMomentum();

  // Calculate progress percentages
  const calculateProgress = (goals: { completed?: boolean }[]) => {
    if (goals.length === 0) return 0;
    const completed = goals.filter(g => g.completed).length;
    return Math.round((completed / goals.length) * 100);
  };

  const yearlyProgress = calculateProgress(monthlyGoals);
  const monthlyProgress = calculateProgress(weeklyGoals);
  const weeklyProgress = calculateProgress(dailyGoals.filter(g => g.date === selectedDate));

  // Get goals by category for today
  const personalGoals = dailyGoals.filter(g => g.category === "personal" && g.date === selectedDate);
  const professionalGoals = dailyGoals.filter(g => g.category === "professional" && g.date === selectedDate);
  const fitnessGoals = dailyGoals.filter(g => g.category === "fitness" && g.date === selectedDate);

  // Weekly goals by category
  const personalWeeklyGoals = weeklyGoals.filter(g => 
    monthlyGoals.some(mg => mg.yearly_goal_id && 
      yearlyGoals.some(yg => yg.id === mg.yearly_goal_id && yg.category === "personal") &&
      mg.id === g.monthly_goal_id
    )
  );
  const professionalWeeklyGoals = weeklyGoals.filter(g => 
    monthlyGoals.some(mg => mg.yearly_goal_id && 
      yearlyGoals.some(yg => yg.id === mg.yearly_goal_id && yg.category === "professional") &&
      mg.id === g.monthly_goal_id
    )
  );
  const fitnessWeeklyGoals = weeklyGoals.filter(g => 
    monthlyGoals.some(mg => mg.yearly_goal_id && 
      yearlyGoals.some(yg => yg.id === mg.yearly_goal_id && yg.category === "fitness") &&
      mg.id === g.monthly_goal_id
    )
  );

  const goToPrevDay = () => {
    const date = new Date(selectedDate);
    onDateChange(format(subDays(date, 1), "yyyy-MM-dd"));
  };

  const goToNextDay = () => {
    const date = new Date(selectedDate);
    onDateChange(format(addDays(date, 1), "yyyy-MM-dd"));
  };

  const handleCalendarSelect = (date: Date | undefined) => {
    if (date) {
      onDateChange(format(date, "yyyy-MM-dd"));
      setCalendarOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary/30 to-background pb-8">
      {/* Header */}
      <motion.header 
        className="bg-card/80 backdrop-blur-sm sticky top-0 z-10 border-b border-border"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="px-4 py-4 flex items-center justify-between max-w-lg mx-auto">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <h1 className="text-xl font-display font-bold">
              Welcome back{userName ? `, ${userName}` : ""}!
            </h1>
            <p className="text-sm text-muted-foreground">Here's your progress so far.</p>
          </motion.div>
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Button variant="outline" size="sm" onClick={onSignOut} className="rounded-xl">
              Sign Out
            </Button>
          </motion.div>
        </div>
      </motion.header>

      <div className="px-4 max-w-lg mx-auto space-y-6 mt-6">
        {/* Momentum Score */}
        {!momentumLoading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <MomentumScore
              score={momentum.score}
              level={momentum.level}
              streakDays={momentum.streakDays}
              weeklyChange={momentum.weeklyChange}
            />
          </motion.div>
        )}

        {/* Progress Circles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-3xl p-6 shadow-lg"
        >
          <div className="flex justify-around items-center">
            <CircularProgress 
              percentage={yearlyProgress} 
              label="Yearly Goals" 
              color="hsl(217 91% 60%)"
              delay={0.3}
            />
            <CircularProgress 
              percentage={monthlyProgress} 
              label="Monthly Goals" 
              color="hsl(25 95% 65%)"
              delay={0.4}
            />
            <CircularProgress 
              percentage={weeklyProgress} 
              label="Weekly Goals" 
              color="hsl(150 60% 45%)"
              delay={0.5}
            />
          </div>
          <motion.p 
            className="text-center text-sm text-muted-foreground mt-4 flex items-center justify-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <motion.span
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5, delay: 1, repeat: Infinity, repeatDelay: 3 }}
            >
              <Sparkles className="w-4 h-4 text-primary" />
            </motion.span>
            Every step counts on your journey.
          </motion.p>
        </motion.div>

        {/* Date Navigation with Calendar Popover */}
        <motion.div 
          className="flex items-center justify-center gap-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button variant="ghost" size="icon" onClick={goToPrevDay} className="rounded-xl">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </motion.div>
          
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <motion.button
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-border hover:bg-muted transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium text-foreground">
                  {isToday(new Date(selectedDate)) ? "Today" : format(new Date(selectedDate), "MMM d, yyyy")}
                </span>
              </motion.button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="center">
              <Calendar
                mode="single"
                selected={new Date(selectedDate)}
                onSelect={handleCalendarSelect}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button variant="ghost" size="icon" onClick={goToNextDay} className="rounded-xl">
              <ChevronRight className="w-5 h-5" />
            </Button>
          </motion.div>
        </motion.div>

        {/* Goal Category Cards */}
        <div className="space-y-3">
          <GoalCategoryCard
            category="personal"
            goals={personalGoals}
            weeklyGoals={personalWeeklyGoals}
            onEdit={() => navigate("/goals/personal")}
            index={0}
          />
          <GoalCategoryCard
            category="professional"
            goals={professionalGoals}
            weeklyGoals={professionalWeeklyGoals}
            onEdit={() => navigate("/goals/professional")}
            index={1}
          />
          <GoalCategoryCard
            category="fitness"
            goals={fitnessGoals}
            weeklyGoals={fitnessWeeklyGoals}
            onEdit={() => navigate("/goals/fitness")}
            index={2}
          />
        </div>

        {/* Today's Progress */}
        <TodayProgress
          progress={todayProgress}
          onProgressChange={setTodayProgress}
        />

        {/* Weekly Review */}
        <WeeklyReview dailyGoals={dailyGoals} />

        {/* Daily Goals by Category */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <span>Today's Goals</span>
          </h2>

          {/* Add goals */}
          <div className="space-y-3">
            <AddGoalInput category="personal" onAdd={(title) => onAddDailyGoal("personal", title)} />
            <AddGoalInput category="professional" onAdd={(title) => onAddDailyGoal("professional", title)} />
            <AddGoalInput category="fitness" onAdd={(title) => onAddDailyGoal("fitness", title)} />
          </div>

          {/* Goals lists */}
          <DailyGoalsList
            goals={personalGoals}
            category="personal"
            onToggle={(id) => {
              const goal = personalGoals.find(g => g.id === id);
              if (goal) onUpdateDailyGoal(id, { completed: !goal.completed, progress: goal.completed ? 0 : 5 });
            }}
            onUpdateProgress={(id, progress) => onUpdateDailyGoal(id, { progress, completed: progress === 5 })}
            onUpdateNotes={(id, notes) => onUpdateDailyGoal(id, { notes })}
            onRemove={onRemoveDailyGoal}
          />
          <DailyGoalsList
            goals={professionalGoals}
            category="professional"
            onToggle={(id) => {
              const goal = professionalGoals.find(g => g.id === id);
              if (goal) onUpdateDailyGoal(id, { completed: !goal.completed, progress: goal.completed ? 0 : 5 });
            }}
            onUpdateProgress={(id, progress) => onUpdateDailyGoal(id, { progress, completed: progress === 5 })}
            onUpdateNotes={(id, notes) => onUpdateDailyGoal(id, { notes })}
            onRemove={onRemoveDailyGoal}
          />
          <DailyGoalsList
            goals={fitnessGoals}
            category="fitness"
            onToggle={(id) => {
              const goal = fitnessGoals.find(g => g.id === id);
              if (goal) onUpdateDailyGoal(id, { completed: !goal.completed, progress: goal.completed ? 0 : 5 });
            }}
            onUpdateProgress={(id, progress) => onUpdateDailyGoal(id, { progress, completed: progress === 5 })}
            onUpdateNotes={(id, notes) => onUpdateDailyGoal(id, { notes })}
            onRemove={onRemoveDailyGoal}
          />
        </div>
      </div>
    </div>
  );
};

export default DailyDashboard;
