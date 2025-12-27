import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Heart, LogOut, Target, Briefcase, Dumbbell, Plus, ArrowLeft, 
  Sparkles, Sun, Moon, Mountain, Flame, Leaf, Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useOnboarding } from "@/hooks/useOnboarding";
import { toast } from "sonner";
import VoiceInput from "@/components/VoiceInput";
import GoalCard from "@/components/GoalCard";

type GoalCategory = "personal" | "professional" | "fitness";

const categoryConfig = {
  personal: {
    title: "Personal Goals",
    subtitle: "Nurture your inner self",
    icon: Target,
    gradient: "from-rose-500/20 via-pink-500/10 to-orange-500/20",
    accentColor: "text-rose-500",
    bgAccent: "bg-rose-500/10",
    borderAccent: "border-rose-500/20",
    prompt: "What brings you joy and peace?",
    decorativeIcon: Sun,
    suggestions: [
      "Read 20 minutes daily",
      "Practice gratitude",
      "Learn something new",
      "Spend time in nature",
      "Journal my thoughts",
      "Call a loved one weekly",
    ],
  },
  professional: {
    title: "Professional Goals",
    subtitle: "Grow your career mindfully",
    icon: Briefcase,
    gradient: "from-blue-500/20 via-indigo-500/10 to-violet-500/20",
    accentColor: "text-blue-500",
    bgAccent: "bg-blue-500/10",
    borderAccent: "border-blue-500/20",
    prompt: "What would make you proud at work?",
    decorativeIcon: Mountain,
    suggestions: [
      "Complete a course",
      "Mentor someone",
      "Lead a project",
      "Build new skills",
      "Network authentically",
      "Share my knowledge",
    ],
  },
  fitness: {
    title: "Fitness Goals",
    subtitle: "Honor your body",
    icon: Dumbbell,
    gradient: "from-emerald-500/20 via-teal-500/10 to-cyan-500/20",
    accentColor: "text-emerald-500",
    bgAccent: "bg-emerald-500/10",
    borderAccent: "border-emerald-500/20",
    prompt: "How do you want to feel in your body?",
    decorativeIcon: Flame,
    suggestions: [
      "Walk 10,000 steps",
      "Stretch every morning",
      "Drink more water",
      "Sleep 8 hours",
      "Try a new activity",
      "Rest when needed",
    ],
  },
};

const Goals = () => {
  const { category } = useParams<{ category: GoalCategory }>();
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const { progress, loading: onboardingLoading, updateProgress, isCompleted } = useOnboarding();
  
  const [goals, setGoals] = useState<string[]>([]);
  const [newGoal, setNewGoal] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const validCategory = category && categoryConfig[category] ? category : "personal";
  const config = categoryConfig[validCategory];

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

  useEffect(() => {
    if (progress) {
      const categoryGoals = progress[`${validCategory}_goals` as keyof typeof progress] as string[] || [];
      setGoals(categoryGoals);
    }
  }, [progress, validCategory]);

  const saveGoals = useCallback(async (newGoals: string[]) => {
    setIsSaving(true);
    try {
      await updateProgress({ [`${validCategory}_goals`]: newGoals });
    } catch (error) {
      toast.error("Couldn't save. We'll try again.");
    } finally {
      setIsSaving(false);
    }
  }, [updateProgress, validCategory]);

  const addGoal = useCallback((goalText: string) => {
    const trimmed = goalText.trim();
    if (trimmed && !goals.includes(trimmed)) {
      const newGoals = [...goals, trimmed];
      setGoals(newGoals);
      saveGoals(newGoals);
      setNewGoal("");
      toast.success("Goal added", { duration: 2000 });
    }
  }, [goals, saveGoals]);

  const removeGoal = useCallback((goal: string) => {
    const newGoals = goals.filter(g => g !== goal);
    setGoals(newGoals);
    saveGoals(newGoals);
  }, [goals, saveGoals]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (authLoading || onboardingLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{config.title} - GoalSync</title>
        <meta name="description" content={`Track and manage your ${validCategory} goals with GoalSync.`} />
      </Helmet>

      <div className={`min-h-screen bg-gradient-to-br ${config.gradient} relative overflow-hidden`}>
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-20 right-10 opacity-10"
          >
            <config.decorativeIcon className="w-32 h-32" />
          </motion.div>
          <motion.div
            animate={{ y: [0, 15, 0], rotate: [0, -5, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-20 left-10 opacity-10"
          >
            <Leaf className="w-24 h-24" />
          </motion.div>
        </div>

        {/* Header */}
        <header className="border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-10">
          <div className="container mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => navigate("/dashboard")}
                className="rounded-xl"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <Link to="/" className="flex items-center gap-2">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                  <Heart className="w-5 h-5 text-primary-foreground fill-primary-foreground" />
                </div>
                <span className="text-xl font-display font-bold">
                  Goal<span className="text-primary">Sync</span>
                </span>
              </Link>
            </div>

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
        <main className="container mx-auto px-6 py-8 relative z-0">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-3xl ${config.bgAccent} mb-4`}>
              <config.icon className={`w-10 h-10 ${config.accentColor}`} />
            </div>
            <h1 className="text-4xl font-display font-bold mb-2">{config.title}</h1>
            <p className="text-lg text-muted-foreground">{config.subtitle}</p>
          </motion.div>

          <div className="max-w-2xl mx-auto space-y-6">
            {/* Prompt Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={`p-6 rounded-2xl bg-card/80 backdrop-blur border ${config.borderAccent}`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl ${config.bgAccent} flex items-center justify-center`}>
                  <Sparkles className={`w-5 h-5 ${config.accentColor}`} />
                </div>
                <p className="text-lg font-medium">{config.prompt}</p>
              </div>

              {/* Voice Input */}
              <VoiceInput 
                onTranscript={addGoal} 
                placeholder="Speak your goal..."
                className="mb-4"
              />

              {/* Text Input */}
              <div className="flex gap-2">
                <Input
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addGoal(newGoal)}
                  placeholder="Or type your goal here..."
                  className="rounded-xl h-12"
                />
                <Button 
                  onClick={() => addGoal(newGoal)}
                  disabled={!newGoal.trim()}
                  className="rounded-xl h-12 px-6"
                >
                  <Plus className="w-5 h-5" />
                </Button>
              </div>
            </motion.div>

            {/* Suggestions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <p className="text-sm text-muted-foreground mb-3">Need inspiration?</p>
              <div className="flex flex-wrap gap-2">
                {config.suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => addGoal(suggestion)}
                    disabled={goals.includes(suggestion)}
                    className={`px-4 py-2 rounded-full text-sm transition-all ${
                      goals.includes(suggestion)
                        ? "bg-muted text-muted-foreground cursor-not-allowed"
                        : `${config.bgAccent} ${config.accentColor} hover:opacity-80`
                    }`}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Goals List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Your Goals</h2>
                {isSaving && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    Saving...
                  </span>
                )}
              </div>

              <AnimatePresence mode="popLayout">
                {goals.length > 0 ? (
                  goals.map((goal, index) => (
                    <GoalCard
                      key={goal}
                      goal={goal}
                      index={index}
                      onRemove={() => removeGoal(goal)}
                    />
                  ))
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12 rounded-2xl border border-dashed border-border"
                  >
                    <Star className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground">No goals yet. Start with one small step.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </main>
      </div>
    </>
  );
};

export default Goals;
