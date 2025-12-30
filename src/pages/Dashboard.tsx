import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Heart, LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { usePlanningProgress } from "@/hooks/usePlanningProgress";
import { useMomentum } from "@/hooks/useMomentum";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, startOfWeek, getMonth, getYear } from "date-fns";

import MomentumGauge from "@/components/dashboard/MomentumGauge";
import QuarterFocus from "@/components/dashboard/QuarterFocus";
import MonthFocus from "@/components/dashboard/MonthFocus";
import WeekFocus from "@/components/dashboard/WeekFocus";
import DashboardActions from "@/components/dashboard/DashboardActions";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const { progress, loading: planningLoading, isCompleted } = usePlanningProgress();
  const { momentum, loading: momentumLoading } = useMomentum();
  
  const [quarterGoals, setQuarterGoals] = useState<any[]>([]);
  const [monthGoals, setMonthGoals] = useState<any[]>([]);
  const [weekTasks, setWeekTasks] = useState<any[]>([]);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  // Redirect to planning if not completed
  useEffect(() => {
    if (!planningLoading && !isCompleted && user) {
      navigate("/planning");
    }
  }, [planningLoading, isCompleted, user, navigate]);

  const fetchGoalsData = async () => {
    if (!user) return;

    // Fetch quarterly/yearly goals
    const { data: yearlyData } = await supabase
      .from("yearly_goals")
      .select("id, title, category")
      .eq("user_id", user.id);

    if (yearlyData) {
      setQuarterGoals(yearlyData.map((g) => ({
        id: g.id,
        title: g.title,
        category: g.category as "personal" | "professional" | "fitness",
        progress: Math.floor(Math.random() * 100), // Placeholder - would calculate from actual data
      })));
    }

    // Fetch monthly goals
    const currentMonth = getMonth(new Date()) + 1;
    const currentYear = getYear(new Date());
    
    const { data: monthlyData } = await supabase
      .from("monthly_goals")
      .select("id, title, progress, priority")
      .eq("user_id", user.id)
      .eq("month", currentMonth)
      .eq("year", currentYear);

    if (monthlyData) {
      setMonthGoals(monthlyData.map((g) => ({
        id: g.id,
        title: g.title,
        priority: (g.priority || "medium") as "low" | "medium" | "high",
        progress: g.progress || 0,
      })));
    }

    // Fetch weekly tasks
    const weekStart = format(startOfWeek(new Date()), "yyyy-MM-dd");
    
    const { data: weeklyData } = await supabase
      .from("weekly_goals")
      .select("id, title, effort, status")
      .eq("user_id", user.id)
      .eq("week_start", weekStart);

    if (weeklyData) {
      setWeekTasks(weeklyData.map((t) => ({
        id: t.id,
        title: t.title,
        effort: (t.effort || "M") as "S" | "M" | "L",
        status: (t.status || "todo") as "todo" | "in_progress" | "done",
      })));
    }
  };

  // Fetch goals data
  useEffect(() => {
    fetchGoalsData();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    toast.success("See you soon!");
    navigate("/");
  };

  const handleTaskToggle = async (taskId: string) => {
    const task = weekTasks.find((t) => t.id === taskId);
    if (!task) return;

    const nextStatus = task.status === "done" ? "todo" : "done";
    
    await supabase
      .from("weekly_goals")
      .update({ status: nextStatus })
      .eq("id", taskId);

    setWeekTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: nextStatus } : t))
    );
  };

  if (authLoading || planningLoading || momentumLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  // Calculate momentum score as percentage (0-100)
  const momentumPercent = Math.round((momentum.score / 1000) * 100);

  return (
    <>
      <Helmet>
        <title>Dashboard - Goals365</title>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 safe-top safe-bottom">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 gradient-momentum rounded-xl flex items-center justify-center">
                <Heart className="w-5 h-5 text-white fill-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{greeting}</p>
                <h1 className="font-display font-bold">{firstName}</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="rounded-xl" onClick={handleSignOut}>
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-4 pb-24 space-y-4 max-w-lg mx-auto">
          {/* Momentum Gauge */}
          <MomentumGauge 
            score={momentumPercent} 
            weeklyChange={momentum.weeklyChange} 
          />

          {/* Quarter Focus */}
          <QuarterFocus 
            goals={quarterGoals}
            onViewDetails={() => navigate("/planning")}
            onGoalsChange={fetchGoalsData}
          />

          {/* Month Focus */}
          <MonthFocus 
            goals={monthGoals}
            onViewDetails={() => navigate("/monthly")}
          />

          {/* Week Focus */}
          <WeekFocus 
            tasks={weekTasks}
            onTaskToggle={handleTaskToggle}
          />

          {/* Action Buttons */}
          <DashboardActions
            onSetGoals={() => navigate("/planning")}
            onUpdateGoals={() => navigate("/monthly")}
            onTrackProgress={() => navigate("/insights")}
          />
        </main>

        {/* Bottom Nav */}
        <nav className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-lg border-t border-border safe-bottom">
          <div className="flex items-center justify-around p-2 max-w-lg mx-auto">
            <Link to="/dashboard" className="flex flex-col items-center p-2 text-primary">
              <Heart className="w-5 h-5 fill-current" />
              <span className="text-xs mt-1">Home</span>
            </Link>
            <Link to="/insights" className="flex flex-col items-center p-2 text-muted-foreground hover:text-foreground">
              <Settings className="w-5 h-5" />
              <span className="text-xs mt-1">Insights</span>
            </Link>
          </div>
        </nav>
      </div>
    </>
  );
};

export default Dashboard;
