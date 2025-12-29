import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Heart, LogOut, Settings, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useOnboarding } from "@/hooks/useOnboarding";
import { usePremium } from "@/hooks/usePremium";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MomentumScore } from "@/components/dashboard/MomentumScore";
import { DailyInsight } from "@/components/dashboard/DailyInsight";
import { CategorySection } from "@/components/dashboard/CategorySection";
import { GoalCard } from "@/components/dashboard/GoalCard";
import { TierBadge } from "@/components/premium/TierBadge";
import { SubtleUpsell } from "@/components/premium/SubtleUpsell";
import { FeatureGate } from "@/components/premium/FeatureGate";
import { UpsellPrompt } from "@/components/premium/UpsellPrompt";
import { format } from "date-fns";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const { progress, loading: onboardingLoading, isCompleted } = useOnboarding();
  const { isPremium, limits, loading: premiumLoading } = usePremium();
  const [dailyGoals, setDailyGoals] = useState<any[]>([]);
  const [momentumData, setMomentumData] = useState({ score: 150, level: "seed" as const, streak: 3 });
  const [showCategoryUpsell, setShowCategoryUpsell] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!onboardingLoading && user && !isCompleted) navigate("/onboarding");
  }, [user, onboardingLoading, isCompleted, navigate]);

  useEffect(() => {
    if (user) fetchTodaysGoals();
  }, [user]);

  const fetchTodaysGoals = async () => {
    if (!user) return;
    const today = format(new Date(), "yyyy-MM-dd");
    const { data } = await supabase
      .from("daily_goals")
      .select("*")
      .eq("user_id", user.id)
      .eq("date", today);
    setDailyGoals(data || []);
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success("See you soon!");
    navigate("/");
  };

  const toggleGoalComplete = async (goalId: string, completed: boolean) => {
    await supabase.from("daily_goals").update({ completed: !completed }).eq("id", goalId);
    fetchTodaysGoals();
  };

  if (authLoading || onboardingLoading || premiumLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  // Count active categories for free tier limit
  const activeCategories = [
    (progress?.personal_goals?.length || 0) > 0,
    (progress?.professional_goals?.length || 0) > 0,
    (progress?.fitness_goals?.length || 0) > 0,
  ].filter(Boolean).length;

  const canAccessCategory = (index: number) => {
    if (isPremium) return true;
    return index < limits.maxCategories;
  };

  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const personalGoals = dailyGoals.filter(g => g.category === "personal");
  const professionalGoals = dailyGoals.filter(g => g.category === "professional");
  const fitnessGoals = dailyGoals.filter(g => g.category === "fitness");

  const getInsightMessage = () => {
    const completed = dailyGoals.filter(g => g.completed).length;
    if (dailyGoals.length === 0) return { message: "Start by adding a goal for today. Small steps lead to big changes.", type: "tip" as const };
    if (completed === dailyGoals.length) return { message: "Amazing! You've completed all your goals today. Take a moment to celebrate! 🎉", type: "celebration" as const };
    if (completed > 0) return { message: `You're doing great! ${completed} of ${dailyGoals.length} goals done. Keep the momentum going.`, type: "encouragement" as const };
    return { message: "A fresh start awaits. Pick one small goal to begin with.", type: "gentle" as const };
  };

  const insight = getInsightMessage();

  return (
    <>
      <Helmet>
        <title>Dashboard - GoalSync</title>
      </Helmet>

      <div className="min-h-screen bg-background safe-top safe-bottom">
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
              <TierBadge compact onClick={() => navigate("/pricing")} />
              <Button variant="ghost" size="icon" className="rounded-xl" onClick={handleSignOut}>
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
          
          {/* Category limit banner for free users */}
          {!isPremium && activeCategories >= limits.maxCategories && (
            <div className="px-4 pb-3">
              <SubtleUpsell 
                message="Unlock all goal categories" 
                context="category" 
              />
            </div>
          )}
        </header>

        {/* Content */}
        <main className="p-4 pb-24 space-y-6 max-w-lg mx-auto">
          {/* Momentum Score */}
          {/* Momentum Score - Full version for premium, limited for free */}
          <FeatureGate
            feature="hasFullMomentumScore"
            context="analytics"
            fallback={
              <MomentumScore 
                score={momentumData.score} 
                level={momentumData.level} 
                streakDays={momentumData.streak} 
                compact={true}
              />
            }
          >
            <MomentumScore score={momentumData.score} level={momentumData.level} streakDays={momentumData.streak} weeklyChange={12} />
          </FeatureGate>

          {/* Daily Insight */}
          <DailyInsight message={insight.message} type={insight.type} onAction={() => navigate("/addgoals/personal")} actionLabel="Add goal" />

          {/* Categories */}
          {(progress?.personal_goals?.length || 0) > 0 && (
            <CategorySection category="personal" title="Personal" count={personalGoals.length} completedCount={personalGoals.filter(g => g.completed).length}>
              {personalGoals.slice(0, 3).map((goal, i) => (
                <GoalCard key={goal.id} title={goal.title} category="personal" progress={goal.progress} isCompleted={goal.completed} onComplete={() => toggleGoalComplete(goal.id, goal.completed)} delay={i} />
              ))}
              {personalGoals.length === 0 && (
                <Link to="/addgoals/personal">
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 rounded-2xl border-2 border-dashed border-border hover:border-primary/30 transition-colors flex items-center justify-center gap-2 text-muted-foreground">
                    <Plus className="w-4 h-4" /> Add personal goal
                  </motion.div>
                </Link>
              )}
            </CategorySection>
          )}

          {(progress?.professional_goals?.length || 0) > 0 && (
            <CategorySection category="professional" title="Professional" count={professionalGoals.length} completedCount={professionalGoals.filter(g => g.completed).length}>
              {professionalGoals.slice(0, 3).map((goal, i) => (
                <GoalCard key={goal.id} title={goal.title} category="professional" progress={goal.progress} isCompleted={goal.completed} onComplete={() => toggleGoalComplete(goal.id, goal.completed)} delay={i} />
              ))}
              {professionalGoals.length === 0 && (
                <Link to="/addgoals/professional">
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 rounded-2xl border-2 border-dashed border-border hover:border-primary/30 transition-colors flex items-center justify-center gap-2 text-muted-foreground">
                    <Plus className="w-4 h-4" /> Add professional goal
                  </motion.div>
                </Link>
              )}
            </CategorySection>
          )}

          {(progress?.fitness_goals?.length || 0) > 0 && (
            <CategorySection category="fitness" title="Fitness" count={fitnessGoals.length} completedCount={fitnessGoals.filter(g => g.completed).length}>
              {fitnessGoals.slice(0, 3).map((goal, i) => (
                <GoalCard key={goal.id} title={goal.title} category="fitness" progress={goal.progress} isCompleted={goal.completed} onComplete={() => toggleGoalComplete(goal.id, goal.completed)} delay={i} />
              ))}
              {fitnessGoals.length === 0 && (
                <Link to="/addgoals/fitness">
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 rounded-2xl border-2 border-dashed border-border hover:border-primary/30 transition-colors flex items-center justify-center gap-2 text-muted-foreground">
                    <Plus className="w-4 h-4" /> Add fitness goal
                  </motion.div>
                </Link>
              )}
            </CategorySection>
          )}
        </main>

        {/* Bottom Nav */}
        <nav className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-lg border-t border-border safe-bottom">
          <div className="flex items-center justify-around p-2 max-w-lg mx-auto">
            <Link to="/dashboard" className="flex flex-col items-center p-2 text-primary">
              <Heart className="w-5 h-5 fill-current" />
              <span className="text-xs mt-1">Home</span>
            </Link>
            <Link to="/goals" className="flex flex-col items-center p-2 text-muted-foreground hover:text-foreground">
              <Settings className="w-5 h-5" />
              <span className="text-xs mt-1">Goals</span>
            </Link>
          </div>
        </nav>

        {/* Category upsell modal */}
        <UpsellPrompt
          isOpen={showCategoryUpsell}
          onClose={() => setShowCategoryUpsell(false)}
          context="category"
        />
      </div>
    </>
  );
};

export default Dashboard;