import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format, startOfWeek, addDays, subDays, isToday, startOfMonth, endOfMonth, eachDayOfInterval, startOfYear, endOfYear, eachMonthOfInterval } from "date-fns";
import { Plus, Check, ChevronLeft, ChevronRight, Edit2, Sparkles, Mic, Calendar as CalendarIcon, Target, TrendingUp, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useNavigate } from "react-router-dom";
import VoiceInput from "@/components/VoiceInput";
import { MomentumScore } from "@/components/dashboard/MomentumScore";
import { useMomentum } from "@/hooks/useMomentum";
import { cn } from "@/lib/utils";
import type { YearlyGoal, MonthlyGoal, WeeklyGoal, DailyGoal } from "@/hooks/useGoals";

type GoalCategory = "personal" | "professional" | "fitness";
type ReviewTab = "daily" | "weekly" | "monthly";

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
    label: "Personal", 
    color: "hsl(340 80% 60%)", 
    bgColor: "bg-pink-50 dark:bg-pink-950/30", 
    borderColor: "border-pink-200 dark:border-pink-800",
    progressBg: "bg-pink-100 dark:bg-pink-900/50",
    progressFill: "bg-pink-500",
    icon: "💫"
  },
  professional: { 
    label: "Professional", 
    color: "hsl(150 60% 45%)", 
    bgColor: "bg-emerald-50 dark:bg-emerald-950/30", 
    borderColor: "border-emerald-200 dark:border-emerald-800",
    progressBg: "bg-emerald-100 dark:bg-emerald-900/50",
    progressFill: "bg-emerald-500",
    icon: "💼"
  },
  fitness: { 
    label: "Fitness", 
    color: "hsl(45 90% 55%)", 
    bgColor: "bg-amber-50 dark:bg-amber-950/30", 
    borderColor: "border-amber-200 dark:border-amber-800",
    progressBg: "bg-amber-100 dark:bg-amber-900/50",
    progressFill: "bg-amber-500",
    icon: "🏋️"
  },
};

// Circular Progress Component
const CircularProgress = ({ 
  percentage, 
  label, 
  color,
  size = 90,
  strokeWidth = 6,
  delay = 0,
  icon
}: { 
  percentage: number; 
  label: string; 
  color: string;
  size?: number;
  strokeWidth?: number;
  delay?: number;
  icon?: React.ReactNode;
}) => {
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
          className="absolute inset-0 flex flex-col items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.5 }}
        >
          {icon ? (
            <span className="text-lg">{icon}</span>
          ) : (
            <motion.span 
              className="text-lg font-bold text-foreground"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: delay + 0.6, type: "spring", stiffness: 200 }}
            >
              {percentage}%
            </motion.span>
          )}
        </motion.div>
      </div>
      <motion.span 
        className="text-xs text-muted-foreground font-medium text-center"
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: delay + 0.3 }}
      >
        {label}
      </motion.span>
    </motion.div>
  );
};

// Tab Button Component
const TabButton = ({ 
  active, 
  onClick, 
  children,
  icon
}: { 
  active: boolean; 
  onClick: () => void; 
  children: React.ReactNode;
  icon: React.ReactNode;
}) => (
  <motion.button
    onClick={onClick}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    className={cn(
      "flex-1 py-3 px-4 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2",
      active 
        ? "bg-primary text-primary-foreground shadow-lg" 
        : "bg-muted/50 text-muted-foreground hover:bg-muted"
    )}
  >
    {icon}
    {children}
  </motion.button>
);

// Review Section - Daily View
const DailyReview = ({ dailyGoals, selectedDate }: { dailyGoals: DailyGoal[]; selectedDate: string }) => {
  const todayGoals = dailyGoals.filter(g => g.date === selectedDate);
  const completed = todayGoals.filter(g => g.completed).length;
  const total = todayGoals.length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-center">
        <CircularProgress 
          percentage={percentage} 
          label={`${completed}/${total} completed`}
          color="hsl(var(--primary))"
          size={120}
          strokeWidth={8}
        />
      </div>
      
      {total === 0 && (
        <p className="text-center text-muted-foreground text-sm">
          No goals set for this day yet.
        </p>
      )}
    </motion.div>
  );
};

// Review Section - Weekly View
const WeeklyReview = ({ dailyGoals, selectedDate }: { dailyGoals: DailyGoal[]; selectedDate: string }) => {
  const currentDate = new Date(selectedDate);
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(weekStart, i);
    const dateStr = format(date, "yyyy-MM-dd");
    const dayGoals = dailyGoals.filter(g => g.date === dateStr);
    const completed = dayGoals.filter(g => g.completed).length;
    const total = dayGoals.length;
    const percentage = total > 0 ? (completed / total) * 100 : 0;
    
    return {
      dayName: format(date, "EEE"),
      dayNum: format(date, "d"),
      date: dateStr,
      isToday: isToday(date),
      isSelected: dateStr === selectedDate,
      percentage,
      hasGoals: total > 0,
      completed,
      total,
    };
  });

  const weeklyTotal = weekDays.reduce((sum, d) => sum + d.total, 0);
  const weeklyCompleted = weekDays.reduce((sum, d) => sum + d.completed, 0);
  const weeklyPercentage = weeklyTotal > 0 ? Math.round((weeklyCompleted / weeklyTotal) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex justify-center mb-4">
        <CircularProgress 
          percentage={weeklyPercentage} 
          label={`${weeklyCompleted}/${weeklyTotal} this week`}
          color="hsl(150 60% 45%)"
          size={100}
          strokeWidth={7}
        />
      </div>
      
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day, i) => (
          <motion.div 
            key={i} 
            className="flex flex-col items-center gap-1"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <span className={cn(
              "text-xs font-medium",
              day.isToday ? "text-primary" : "text-muted-foreground"
            )}>
              {day.dayName}
            </span>
            <motion.div
              whileHover={{ scale: 1.1 }}
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                day.isToday && "ring-2 ring-primary ring-offset-2 ring-offset-background",
                day.hasGoals 
                  ? day.percentage >= 80 
                    ? "bg-primary text-primary-foreground"
                    : day.percentage >= 50 
                      ? "bg-amber-400 text-amber-950"
                      : "bg-muted text-muted-foreground"
                  : "bg-muted/50 text-muted-foreground"
              )}
            >
              {day.hasGoals && day.percentage >= 80 ? (
                <Check className="w-4 h-4" />
              ) : (
                day.dayNum
              )}
            </motion.div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

// Review Section - Monthly View
const MonthlyReview = ({ dailyGoals, selectedDate }: { dailyGoals: DailyGoal[]; selectedDate: string }) => {
  const currentDate = new Date(selectedDate);
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  const monthlyData = daysInMonth.map(date => {
    const dateStr = format(date, "yyyy-MM-dd");
    const dayGoals = dailyGoals.filter(g => g.date === dateStr);
    const completed = dayGoals.filter(g => g.completed).length;
    const total = dayGoals.length;
    const percentage = total > 0 ? (completed / total) * 100 : 0;
    
    return {
      date: dateStr,
      dayNum: format(date, "d"),
      percentage,
      hasGoals: total > 0,
      isToday: isToday(date),
    };
  });

  const monthlyTotal = monthlyData.reduce((sum, d) => sum + (d.hasGoals ? 1 : 0), 0);
  const monthlyCompleted = monthlyData.filter(d => d.hasGoals && d.percentage >= 80).length;
  const monthlyPercentage = monthlyTotal > 0 ? Math.round((monthlyCompleted / monthlyTotal) * 100) : 0;

  // Get the day of week for the first day (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfWeek = monthStart.getDay();
  const paddingDays = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1; // Adjust for Monday start

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="text-center mb-3">
        <h4 className="font-semibold text-foreground">{format(currentDate, "MMMM yyyy")}</h4>
        <p className="text-sm text-muted-foreground">
          {monthlyCompleted} of {monthlyTotal} days completed (80%+)
        </p>
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {/* Day headers */}
        {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => (
          <div key={i} className="text-center text-xs text-muted-foreground font-medium py-1">
            {day}
          </div>
        ))}
        
        {/* Padding for first week */}
        {Array.from({ length: paddingDays }).map((_, i) => (
          <div key={`pad-${i}`} />
        ))}
        
        {/* Days */}
        {monthlyData.map((day, i) => (
          <motion.div
            key={day.date}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.01 }}
            className={cn(
              "aspect-square rounded-lg flex items-center justify-center text-xs font-medium transition-all",
              day.isToday && "ring-1 ring-primary",
              day.hasGoals 
                ? day.percentage >= 80 
                  ? "bg-primary/80 text-primary-foreground"
                  : day.percentage >= 50 
                    ? "bg-amber-400/60 text-amber-950"
                    : "bg-muted text-muted-foreground"
                : "text-muted-foreground/50"
            )}
          >
            {day.hasGoals && day.percentage >= 80 ? (
              <Check className="w-3 h-3" />
            ) : (
              day.dayNum
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

// Quick Action Card
const QuickActionCard = ({
  category,
  goals,
  onEdit,
  index = 0,
}: {
  category: GoalCategory;
  goals: DailyGoal[];
  onEdit: () => void;
  index?: number;
}) => {
  const config = categoryConfig[category];
  const completed = goals.filter(g => g.completed).length;
  const total = goals.length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onEdit}
      className={cn(
        "flex items-center gap-3 p-4 rounded-2xl cursor-pointer transition-all border",
        config.bgColor,
        config.borderColor
      )}
    >
      <div className="relative">
        <CircularProgress 
          percentage={percentage} 
          label=""
          color={config.color}
          size={50}
          strokeWidth={4}
          icon={<span className="text-sm">{config.icon}</span>}
        />
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-foreground text-sm">{config.label}</h4>
        <p className="text-xs text-muted-foreground">
          {total > 0 ? `${completed}/${total} goals done` : "No goals yet"}
        </p>
      </div>
      
      <ChevronRight className="w-5 h-5 text-muted-foreground" />
    </motion.div>
  );
};

// Daily Goals Section
const DailyGoalItem = ({
  goal,
  category,
  onToggle,
  onUpdateProgress,
  onUpdateNotes,
  onRemove,
}: {
  goal: DailyGoal;
  category: GoalCategory;
  onToggle: () => void;
  onUpdateProgress: (progress: number) => void;
  onUpdateNotes: (notes: string) => void;
  onRemove: () => void;
}) => {
  const config = categoryConfig[category];
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className={cn(
        "rounded-xl p-3 border transition-all",
        config.bgColor,
        config.borderColor
      )}
    >
      <div className="flex items-center gap-3">
        <motion.button
          onClick={onToggle}
          whileTap={{ scale: 0.9 }}
          className={cn(
            "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0",
            goal.completed
              ? `${config.progressFill} border-transparent`
              : "border-muted-foreground/30 bg-background"
          )}
        >
          {goal.completed && <Check className="w-3 h-3 text-white" />}
        </motion.button>
        
        <div className="flex-1 min-w-0">
          <p className={cn(
            "text-sm font-medium truncate",
            goal.completed ? "line-through text-muted-foreground" : "text-foreground"
          )}>
            {goal.title}
          </p>
        </div>
        
        <button
          onClick={() => setExpanded(!expanded)}
          className="p-1.5 hover:bg-background/50 rounded-lg transition-colors flex-shrink-0"
        >
          <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </div>
      
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-3 space-y-3">
              <div className="flex gap-1.5 justify-center">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    onClick={() => onUpdateProgress(value)}
                    className={cn(
                      "w-8 h-8 rounded-lg text-xs font-semibold transition-all",
                      goal.progress >= value
                        ? `${config.progressFill} text-white`
                        : "bg-background text-muted-foreground"
                    )}
                  >
                    {value}
                  </button>
                ))}
              </div>
              
              <Textarea
                placeholder="Add a note..."
                value={goal.notes || ""}
                onChange={(e) => onUpdateNotes(e.target.value)}
                className="bg-background/50 border-0 resize-none text-xs rounded-lg min-h-[50px]"
              />
              
              <button
                onClick={onRemove}
                className="text-destructive text-xs hover:underline"
              >
                Remove
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
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

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-sm">{config.icon}</span>
        <span className="text-xs font-medium text-muted-foreground">{config.label}</span>
      </div>
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={`Add ${config.label.toLowerCase()} goal...`}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          className="flex-1 bg-background h-10 text-sm rounded-xl"
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowVoice(!showVoice)}
          className="h-10 w-10 rounded-xl shrink-0"
        >
          <Mic className="w-4 h-4" />
        </Button>
        <Button
          onClick={handleAdd}
          size="icon"
          className="h-10 w-10 rounded-xl shrink-0"
          disabled={!value.trim()}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      {showVoice && (
        <VoiceInput onTranscript={(text) => {
          setValue(text);
          setShowVoice(false);
        }} />
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
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [reviewTab, setReviewTab] = useState<ReviewTab>("daily");
  const { momentum, loading: momentumLoading } = useMomentum();

  // Get goals by category for selected date
  const personalGoals = dailyGoals.filter(g => g.category === "personal" && g.date === selectedDate);
  const professionalGoals = dailyGoals.filter(g => g.category === "professional" && g.date === selectedDate);
  const fitnessGoals = dailyGoals.filter(g => g.category === "fitness" && g.date === selectedDate);
  const allTodayGoals = [...personalGoals, ...professionalGoals, ...fitnessGoals];

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

  // Parse selectedDate safely for the calendar
  const selectedDateObj = useMemo(() => {
    const parsed = new Date(selectedDate + "T00:00:00");
    return isNaN(parsed.getTime()) ? new Date() : parsed;
  }, [selectedDate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary/20 to-background pb-24">
      {/* Compact Header */}
      <motion.header 
        className="bg-card/90 backdrop-blur-sm sticky top-0 z-10 border-b border-border"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="px-4 py-3 flex items-center justify-between max-w-lg mx-auto">
          <div>
            <h1 className="text-lg font-display font-bold">
              {userName ? `Hi, ${userName}` : "Welcome back"}! 👋
            </h1>
          </div>
          <Button variant="ghost" size="sm" onClick={onSignOut} className="rounded-xl text-xs">
            Sign Out
          </Button>
        </div>
      </motion.header>

      <div className="px-4 max-w-lg mx-auto space-y-5 mt-4">
        {/* Momentum Score - Compact */}
        {!momentumLoading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <MomentumScore
              score={momentum.score}
              level={momentum.level}
              streakDays={momentum.streakDays}
              weeklyChange={momentum.weeklyChange}
            />
          </motion.div>
        )}

        {/* Date Navigation */}
        <motion.div 
          className="flex items-center justify-center gap-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button variant="ghost" size="icon" onClick={goToPrevDay} className="rounded-xl h-9 w-9">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center gap-2 px-4 py-2 rounded-xl h-9"
              >
                <CalendarIcon className="w-4 h-4" />
                <span className="font-medium text-sm">
                  {isToday(selectedDateObj) ? "Today" : format(selectedDateObj, "MMM d, yyyy")}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 pointer-events-auto" align="center">
              <Calendar
                mode="single"
                selected={selectedDateObj}
                onSelect={handleCalendarSelect}
                defaultMonth={selectedDateObj}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>

          <Button variant="ghost" size="icon" onClick={goToNextDay} className="rounded-xl h-9 w-9">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </motion.div>

        {/* Review Tab Buttons */}
        <motion.div 
          className="flex gap-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <TabButton 
            active={reviewTab === "daily"} 
            onClick={() => setReviewTab("daily")}
            icon={<Target className="w-4 h-4" />}
          >
            Daily
          </TabButton>
          <TabButton 
            active={reviewTab === "weekly"} 
            onClick={() => setReviewTab("weekly")}
            icon={<TrendingUp className="w-4 h-4" />}
          >
            Weekly
          </TabButton>
          <TabButton 
            active={reviewTab === "monthly"} 
            onClick={() => setReviewTab("monthly")}
            icon={<Zap className="w-4 h-4" />}
          >
            Monthly
          </TabButton>
        </motion.div>

        {/* Review Content */}
        <motion.div
          key={reviewTab}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-card border border-border rounded-2xl p-4 shadow-sm"
        >
          <AnimatePresence mode="wait">
            {reviewTab === "daily" && (
              <DailyReview dailyGoals={dailyGoals} selectedDate={selectedDate} />
            )}
            {reviewTab === "weekly" && (
              <WeeklyReview dailyGoals={dailyGoals} selectedDate={selectedDate} />
            )}
            {reviewTab === "monthly" && (
              <MonthlyReview dailyGoals={dailyGoals} selectedDate={selectedDate} />
            )}
          </AnimatePresence>
        </motion.div>

        {/* Quick Actions - Category Cards */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            Goal Categories
          </h3>
          <div className="space-y-2">
            <QuickActionCard
              category="personal"
              goals={personalGoals}
              onEdit={() => navigate("/goals/personal")}
              index={0}
            />
            <QuickActionCard
              category="professional"
              goals={professionalGoals}
              onEdit={() => navigate("/goals/professional")}
              index={1}
            />
            <QuickActionCard
              category="fitness"
              goals={fitnessGoals}
              onEdit={() => navigate("/goals/fitness")}
              index={2}
            />
          </div>
        </div>

        {/* Today's Goals Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-foreground">
            {isToday(selectedDateObj) ? "Today's Goals" : `Goals for ${format(selectedDateObj, "MMM d")}`}
          </h3>

          {/* Add Goals */}
          <div className="bg-card border border-border rounded-2xl p-4 space-y-4">
            <AddGoalInput category="personal" onAdd={(title) => onAddDailyGoal("personal", title)} />
            <AddGoalInput category="professional" onAdd={(title) => onAddDailyGoal("professional", title)} />
            <AddGoalInput category="fitness" onAdd={(title) => onAddDailyGoal("fitness", title)} />
          </div>

          {/* Goals List */}
          {allTodayGoals.length > 0 && (
            <div className="space-y-2">
              <AnimatePresence>
                {allTodayGoals.map((goal) => (
                  <DailyGoalItem
                    key={goal.id}
                    goal={goal}
                    category={goal.category as GoalCategory}
                    onToggle={() => onUpdateDailyGoal(goal.id, { 
                      completed: !goal.completed, 
                      progress: goal.completed ? 0 : 5 
                    })}
                    onUpdateProgress={(progress) => onUpdateDailyGoal(goal.id, { 
                      progress, 
                      completed: progress === 5 
                    })}
                    onUpdateNotes={(notes) => onUpdateDailyGoal(goal.id, { notes })}
                    onRemove={() => onRemoveDailyGoal(goal.id)}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DailyDashboard;
