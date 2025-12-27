import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Heart, LogOut, Target, Briefcase, Dumbbell, Plus, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useOnboarding } from "@/hooks/useOnboarding";
import { toast } from "sonner";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const { progress, loading: onboardingLoading, isCompleted } = useOnboarding();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!onboardingLoading && user && !isCompleted) {
      navigate("/onboarding");
    }
  }, [user, onboardingLoading, isCompleted, navigate]);

  const handleSignOut = async () => {
    await signOut();
    toast.success("You've been signed out successfully.");
    navigate("/");
  };

  if (authLoading || onboardingLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const goalCategories = [
    {
      title: "Personal Goals",
      icon: Target,
      goals: progress?.personal_goals || [],
      color: "bg-rose-500/10 text-rose-500",
    },
    {
      title: "Professional Goals",
      icon: Briefcase,
      goals: progress?.professional_goals || [],
      color: "bg-blue-500/10 text-blue-500",
    },
    {
      title: "Fitness Goals",
      icon: Dumbbell,
      goals: progress?.fitness_goals || [],
      color: "bg-emerald-500/10 text-emerald-500",
    },
  ];

  return (
    <>
      <Helmet>
        <title>Dashboard - GoalSync</title>
        <meta name="description" content="Track and manage your personal, professional, and fitness goals." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        {/* Header */}
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="container mx-auto px-6 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <Heart className="w-5 h-5 text-primary-foreground fill-primary-foreground" />
              </div>
              <span className="text-xl font-display font-bold">
                Goal<span className="text-primary">Sync</span>
              </span>
            </Link>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="rounded-xl">
                <Settings className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                onClick={handleSignOut}
                className="rounded-xl gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-6 py-8">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-display font-bold mb-2">
              Welcome back{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name}` : ""}!
            </h1>
            <p className="text-muted-foreground">
              Let's continue your journey. Here are your goals:
            </p>
          </motion.div>

          {/* Goals Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            {goalCategories.map((category, index) => (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-card rounded-2xl border border-border p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${category.color}`}>
                    <category.icon className="w-5 h-5" />
                  </div>
                  <h2 className="text-lg font-semibold">{category.title}</h2>
                </div>

                {category.goals.length > 0 ? (
                  <ul className="space-y-2 mb-4">
                    {category.goals.map((goal, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-2 text-sm text-muted-foreground"
                      >
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        {goal}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground mb-4">
                    No goals set yet.
                  </p>
                )}

                <Button variant="outline" className="w-full rounded-xl gap-2">
                  <Plus className="w-4 h-4" />
                  Add Goal
                </Button>
              </motion.div>
            ))}
          </div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 bg-card rounded-2xl border border-border p-6"
          >
            <h2 className="text-lg font-semibold mb-4">Your Progress Overview</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">
                  {(progress?.personal_goals?.length || 0) +
                    (progress?.professional_goals?.length || 0) +
                    (progress?.fitness_goals?.length || 0)}
                </p>
                <p className="text-sm text-muted-foreground">Total Goals</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-emerald-500">0</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-amber-500">0%</p>
                <p className="text-sm text-muted-foreground">Progress</p>
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </>
  );
};

export default Dashboard;
