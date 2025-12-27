import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Heart, LogOut, Target, Briefcase, Dumbbell, ArrowRight, Sparkles } from "lucide-react";
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
    toast.success("Take care! See you soon.");
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
      key: "personal" as const,
      title: "Personal",
      subtitle: "Nurture your inner self",
      icon: Target,
      goals: progress?.personal_goals || [],
      gradient: "from-rose-500/10 to-orange-500/10",
      iconBg: "bg-rose-500/10",
      iconColor: "text-rose-500",
    },
    {
      key: "professional" as const,
      title: "Professional",
      subtitle: "Grow mindfully",
      icon: Briefcase,
      goals: progress?.professional_goals || [],
      gradient: "from-blue-500/10 to-indigo-500/10",
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-500",
    },
    {
      key: "fitness" as const,
      title: "Fitness",
      subtitle: "Honor your body",
      icon: Dumbbell,
      goals: progress?.fitness_goals || [],
      gradient: "from-emerald-500/10 to-teal-500/10",
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-500",
    },
  ];

  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || "";
  const greeting = getGreeting();

  return (
    <>
      <Helmet>
        <title>Dashboard - GoalSync</title>
        <meta name="description" content="Your personal space for growth and reflection." />
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

            <Button
              variant="ghost"
              onClick={handleSignOut}
              className="rounded-xl gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-6 py-8">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 text-center"
          >
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">
              {greeting}{firstName ? `, ${firstName}` : ""}
            </h1>
            <p className="text-muted-foreground text-lg">
              What would you like to focus on today?
            </p>
          </motion.div>

          {/* Goal Categories */}
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {goalCategories.map((category, index) => (
              <motion.div
                key={category.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  to={`/goals/${category.key}`}
                  className={`block p-6 rounded-2xl bg-gradient-to-br ${category.gradient} border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300 group`}
                >
                  <div className={`w-14 h-14 rounded-2xl ${category.iconBg} flex items-center justify-center mb-4`}>
                    <category.icon className={`w-7 h-7 ${category.iconColor}`} />
                  </div>
                  
                  <h2 className="text-xl font-semibold mb-1">{category.title}</h2>
                  <p className="text-sm text-muted-foreground mb-4">{category.subtitle}</p>

                  {category.goals.length > 0 ? (
                    <div className="space-y-2 mb-4">
                      {category.goals.slice(0, 2).map((goal, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                          <span className="truncate">{goal}</span>
                        </div>
                      ))}
                      {category.goals.length > 2 && (
                        <p className="text-xs text-muted-foreground">
                          +{category.goals.length - 2} more
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground mb-4 italic">
                      No goals yet
                    </p>
                  )}

                  <div className="flex items-center gap-2 text-sm font-medium text-primary group-hover:gap-3 transition-all">
                    <span>Explore</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Gentle Encouragement */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-12 text-center max-w-md mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm">
              <Sparkles className="w-4 h-4" />
              <span>Small steps lead to big changes</span>
            </div>
          </motion.div>
        </main>
      </div>
    </>
  );
};

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default Dashboard;
