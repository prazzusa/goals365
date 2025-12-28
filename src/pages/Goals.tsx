import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams, useSearchParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Heart, LogOut, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useGoals } from "@/hooks/useGoals";
import { format, startOfWeek } from "date-fns";
import YearlyGoalsStep from "@/components/goals/YearlyGoalsStep";
import MonthlyGoalsStep from "@/components/goals/MonthlyGoalsStep";
import WeeklyGoalsStep from "@/components/goals/WeeklyGoalsStep";
import DailyDashboard from "@/components/goals/DailyDashboard";

type GoalCategory = "personal" | "professional" | "fitness";

const stepLabels = ["Yearly Goals", "Monthly Focus", "Weekly Actions"];

const Goals = () => {
  const { category } = useParams<{ category: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const goals = useGoals();

  const validCategory = (category && ["personal", "professional", "fitness"].includes(category) 
    ? category : "personal") as GoalCategory;

  // Check if user wants to see daily dashboard (after completing setup)
  const showDashboard = searchParams.get("dashboard") === "true";

  const [currentStep, setCurrentStep] = useState(0);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const currentWeekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  // Check if user has completed all setup steps for at least one category
  const hasCompletedAnySetup = useMemo(() => {
    return goals.yearlyGoals.length > 0 && goals.weeklyGoals.length > 0;
  }, [goals.yearlyGoals, goals.weeklyGoals]);

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

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  // Get user's first name from profile or email
  const userName = user?.user_metadata?.full_name?.split(' ')[0] || 
                   user?.email?.split('@')[0] || undefined;

  if (authLoading || goals.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  // Show daily dashboard if user has completed setup and requested dashboard view
  if (showDashboard || (hasCompletedAnySetup && !category)) {
    return (
      <>
        <Helmet>
          <title>Daily Goals - GoalSync</title>
        </Helmet>
        <DailyDashboard
          userName={userName}
          yearlyGoals={goals.yearlyGoals}
          monthlyGoals={goals.monthlyGoals}
          weeklyGoals={goals.weeklyGoals}
          dailyGoals={goals.dailyGoals}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          onAddDailyGoal={(cat, title) => goals.addDailyGoal(null, cat, title, selectedDate)}
          onUpdateDailyGoal={(id, updates) => goals.updateDailyGoal(id, updates)}
          onRemoveDailyGoal={(id) => goals.deleteDailyGoal(id)}
          onSignOut={handleSignOut}
        />
      </>
    );
  }

  const canGoNext = currentStep < 2;
  const canGoPrev = currentStep > 0;

  const handleFinishSetup = () => {
    navigate("/goals?dashboard=true");
  };

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
            {currentStep === 2 && weeklyGoalsForCategory.length > 0 && (
              <Button onClick={handleFinishSetup} className="rounded-xl gap-2 bg-emerald-600 hover:bg-emerald-700">
                Continue to Daily Dashboard
              </Button>
            )}
          </div>
        </main>
      </div>
    </>
  );
};

export default Goals;
