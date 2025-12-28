import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Heart, LogOut, ArrowLeft, ArrowRight, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useGoals } from "@/hooks/useGoals";
import { format, startOfWeek } from "date-fns";
import YearlyGoalsStep from "@/components/goals/YearlyGoalsStep";
import MonthlyGoalsStep from "@/components/goals/MonthlyGoalsStep";
import WeeklyGoalsStep from "@/components/goals/WeeklyGoalsStep";
import DailyCheckIn from "@/components/goals/DailyCheckIn";
import ProgressTracker from "@/components/goals/ProgressTracker";

type GoalCategory = "personal" | "professional" | "fitness";

const stepLabels = ["Yearly Goals", "Monthly Focus", "Weekly Actions", "Daily Check-In", "Track Progress"];

const Goals = () => {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const goals = useGoals();

  const validCategory = (category && ["personal", "professional", "fitness"].includes(category) 
    ? category : "personal") as GoalCategory;

  const [currentStep, setCurrentStep] = useState(0);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const currentWeekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  // Get category-specific data
  const yearlyGoalsForCategory = goals.getYearlyGoalsByCategory(validCategory);
  const monthlyGoalsForCategory = useMemo(() => 
    goals.monthlyGoals.filter(g => 
      yearlyGoalsForCategory.some(yg => yg.id === g.yearly_goal_id) &&
      g.month === currentMonth && g.year === currentYear
    ), [goals.monthlyGoals, yearlyGoalsForCategory, currentMonth, currentYear]);
  
  const weeklyGoalsForCategory = useMemo(() =>
    goals.weeklyGoals.filter(g =>
      monthlyGoalsForCategory.some(mg => mg.id === g.monthly_goal_id) &&
      g.week_start === currentWeekStart
    ), [goals.weeklyGoals, monthlyGoalsForCategory, currentWeekStart]);

  const dailyGoalsForCategory = goals.getDailyGoalsByCategory(validCategory, selectedDate);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (authLoading || goals.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const canGoNext = currentStep < 4;
  const canGoPrev = currentStep > 0;

  return (
    <>
      <Helmet>
        <title>{validCategory.charAt(0).toUpperCase() + validCategory.slice(1)} Goals - GoalSync</title>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        {/* Header */}
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="container mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")} className="rounded-xl">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <Link to="/" className="flex items-center gap-2">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                  <Heart className="w-5 h-5 text-primary-foreground fill-primary-foreground" />
                </div>
                <span className="text-xl font-display font-bold">Goal<span className="text-primary">Sync</span></span>
              </Link>
            </div>
            <Button variant="ghost" onClick={handleSignOut} className="rounded-xl gap-2">
              <LogOut className="w-4 h-4" />Sign Out
            </Button>
          </div>
        </header>

        {/* Step Indicator */}
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {stepLabels.map((label, index) => (
              <button
                key={label}
                onClick={() => setCurrentStep(index)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition-all ${
                  index === currentStep 
                    ? "bg-primary text-primary-foreground font-medium" 
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-background/20 flex items-center justify-center text-xs">
                  {index + 1}
                </span>
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <main className="container mx-auto px-6 py-6">
          <motion.div key={currentStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
            {currentStep === 0 && (
              <YearlyGoalsStep
                category={validCategory}
                goals={yearlyGoalsForCategory.map(g => ({ id: g.id, title: g.title }))}
                onAddGoal={(title) => goals.addYearlyGoal(validCategory, title)}
                onUpdateGoal={(id, title) => goals.updateYearlyGoal(id, { title })}
                onRemoveGoal={(id) => goals.deleteYearlyGoal(id)}
              />
            )}
            {currentStep === 1 && (
              <MonthlyGoalsStep
                yearlyGoals={yearlyGoalsForCategory}
                monthlyGoals={monthlyGoalsForCategory}
                currentMonth={currentMonth}
                currentYear={currentYear}
                onAddGoal={(yearlyGoalId, title) => goals.addMonthlyGoal(yearlyGoalId, title, currentMonth, currentYear)}
                onRemoveGoal={(id) => goals.deleteMonthlyGoal(id)}
              />
            )}
            {currentStep === 2 && (
              <WeeklyGoalsStep
                monthlyGoals={monthlyGoalsForCategory}
                weeklyGoals={weeklyGoalsForCategory}
                currentWeekStart={currentWeekStart}
                onAddGoal={(monthlyGoalId, title) => goals.addWeeklyGoal(monthlyGoalId, title, currentWeekStart)}
                onRemoveGoal={(id) => goals.deleteWeeklyGoal(id)}
              />
            )}
            {currentStep === 3 && (
              <DailyCheckIn
                category={validCategory}
                dailyGoals={dailyGoalsForCategory}
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
                onAddGoal={(title) => goals.addDailyGoal(null, validCategory, title, selectedDate)}
                onToggleComplete={(id) => {
                  const goal = dailyGoalsForCategory.find(g => g.id === id);
                  if (goal) goals.updateDailyGoal(id, { completed: !goal.completed, progress: goal.completed ? 0 : 5 });
                }}
                onUpdateProgress={(id, progress) => goals.updateDailyGoal(id, { progress, completed: progress === 5 })}
                onRemoveGoal={(id) => goals.deleteDailyGoal(id)}
              />
            )}
            {currentStep === 4 && (
              <ProgressTracker category={validCategory} dailyGoals={goals.dailyGoals} />
            )}
          </motion.div>

          {/* Navigation */}
          <div className="flex justify-center gap-4 mt-8">
            {canGoPrev && (
              <Button variant="outline" onClick={() => setCurrentStep(s => s - 1)} className="rounded-xl gap-2">
                <ArrowLeft className="w-4 h-4" />Previous
              </Button>
            )}
            {canGoNext && (
              <Button onClick={() => setCurrentStep(s => s + 1)} className="rounded-xl gap-2">
                Next<ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </main>
      </div>
    </>
  );
};

export default Goals;
