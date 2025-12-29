import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ArrowRight, ArrowLeft, Sparkles, Zap, Clock, Target, Compass, Hammer, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useOnboarding } from "@/hooks/useOnboarding";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CategoryCard } from "@/components/onboarding/CategoryCard";
import { OptionButton } from "@/components/onboarding/OptionButton";
import { ProgressDots } from "@/components/onboarding/ProgressDots";

const TOTAL_STEPS = 4;

const archetypes = {
  explorer: { name: "Explorer", emoji: "🧭", description: "Curious and open to new experiences" },
  builder: { name: "Builder", emoji: "🔧", description: "Focused on steady, incremental progress" },
  rebalancer: { name: "Rebalancer", emoji: "⚖️", description: "Seeking harmony across life areas" },
  achiever: { name: "Achiever", emoji: "🎯", description: "Goal-driven and results-oriented" },
  harmonizer: { name: "Harmonizer", emoji: "🌊", description: "Values peace and sustainable growth" },
};

const Onboarding = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { progress, loading: onboardingLoading, updateProgress, completeOnboarding, isCompleted } = useOnboarding();
  
  const [step, setStep] = useState(0);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [experienceLevel, setExperienceLevel] = useState("beginner");
  const [dailyTime, setDailyTime] = useState(15);
  const [motivationStyle, setMotivationStyle] = useState("gentle");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (isCompleted) navigate("/dashboard");
  }, [isCompleted, navigate]);

  useEffect(() => {
    if (progress) {
      setStep(Math.min(progress.current_step - 1, 0));
    }
  }, [progress]);

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const determineArchetype = () => {
    if (selectedCategories.length === 3) return "rebalancer";
    if (motivationStyle === "challenging") return "achiever";
    if (motivationStyle === "gentle") return "harmonizer";
    if (experienceLevel === "beginner") return "explorer";
    return "builder";
  };

  const handleNext = async () => {
    if (step < TOTAL_STEPS - 1) {
      setStep(s => s + 1);
      await updateProgress({ current_step: step + 2 });
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(s => s - 1);
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      const archetype = determineArchetype();
      
      // Save preferences
      await supabase.from("user_preferences").upsert({
        user_id: user!.id,
        selected_categories: selectedCategories,
        experience_level: experienceLevel,
        daily_time: dailyTime,
        motivation_style: motivationStyle,
        archetype,
      });

      // Map categories to goals
      const goalMap: Record<string, string[]> = {
        personal: ["Build better habits", "Practice mindfulness"],
        professional: ["Improve productivity", "Learn new skills"],
        fitness: ["Exercise regularly", "Eat healthier"],
      };

      await updateProgress({
        personal_goals: selectedCategories.includes("personal") ? goalMap.personal : [],
        professional_goals: selectedCategories.includes("professional") ? goalMap.professional : [],
        fitness_goals: selectedCategories.includes("fitness") ? goalMap.fitness : [],
      });

      await completeOnboarding();
      toast.success(`Welcome, ${archetypes[archetype as keyof typeof archetypes].name}! Let's begin.`);
      navigate("/dashboard");
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
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
        <title>Welcome to GoalSync</title>
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col safe-top safe-bottom">
        {/* Header */}
        <header className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 gradient-momentum rounded-xl flex items-center justify-center">
              <Heart className="w-5 h-5 text-white fill-white" />
            </div>
            <span className="text-xl font-display font-bold">GoalSync</span>
          </div>
          <ProgressDots total={TOTAL_STEPS} current={step} />
        </header>

        {/* Content */}
        <main className="flex-1 flex flex-col justify-center p-6 max-w-lg mx-auto w-full">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-display font-bold mb-2">What matters most to you?</h1>
                  <p className="text-muted-foreground">Select one or more areas to focus on</p>
                </div>
                <div className="space-y-4">
                  <CategoryCard 
                    category="personal" 
                    title="Personal Growth" 
                    subtitle="Nurture your mind & soul" 
                    microcopy="The journey of self-discovery starts here" 
                    isSelected={selectedCategories.includes("personal")} 
                    onSelect={() => toggleCategory("personal")} 
                    delay={0} 
                  />
                  <CategoryCard 
                    category="professional" 
                    title="Professional Growth" 
                    subtitle="Advance your career" 
                    microcopy="Build the future you deserve" 
                    isSelected={selectedCategories.includes("professional")} 
                    onSelect={() => toggleCategory("professional")} 
                    delay={1} 
                  />
                  <CategoryCard 
                    category="fitness" 
                    title="Fitness & Wellness" 
                    subtitle="Honor your body" 
                    microcopy="Strong body, strong mind" 
                    isSelected={selectedCategories.includes("fitness")} 
                    onSelect={() => toggleCategory("fitness")} 
                    delay={2} 
                  />
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-display font-bold mb-2">How experienced are you?</h1>
                  <p className="text-muted-foreground">This helps us personalize your journey</p>
                </div>
                <div className="space-y-3">
                  <OptionButton label="Beginner" description="Just starting my growth journey" icon={<Compass className="w-5 h-5" />} isSelected={experienceLevel === "beginner"} onSelect={() => setExperienceLevel("beginner")} />
                  <OptionButton label="Intermediate" description="I've built some habits" icon={<Target className="w-5 h-5" />} isSelected={experienceLevel === "intermediate"} onSelect={() => setExperienceLevel("intermediate")} />
                  <OptionButton label="Advanced" description="Ready for a challenge" icon={<Zap className="w-5 h-5" />} isSelected={experienceLevel === "advanced"} onSelect={() => setExperienceLevel("advanced")} />
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-display font-bold mb-2">How much time do you have?</h1>
                  <p className="text-muted-foreground">We'll adapt to your schedule</p>
                </div>
                <div className="space-y-3">
                  {[{ min: 10, label: "10 min", desc: "Quick daily check-in" }, { min: 15, label: "15 min", desc: "Focused micro-sessions" }, { min: 30, label: "30 min", desc: "Deep work blocks" }, { min: 60, label: "60+ min", desc: "Comprehensive sessions" }].map((opt, i) => (
                    <OptionButton key={opt.min} label={opt.label} description={opt.desc} icon={<Clock className="w-5 h-5" />} isSelected={dailyTime === opt.min} onSelect={() => setDailyTime(opt.min)} delay={i} />
                  ))}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-display font-bold mb-2">How should we motivate you?</h1>
                  <p className="text-muted-foreground">Choose your coaching style</p>
                </div>
                <div className="space-y-3">
                  <OptionButton label="Gentle" description="Supportive nudges, no pressure" icon={<span className="text-lg">🌿</span>} isSelected={motivationStyle === "gentle"} onSelect={() => setMotivationStyle("gentle")} />
                  <OptionButton label="Structured" description="Clear goals with accountability" icon={<span className="text-lg">📋</span>} isSelected={motivationStyle === "structured"} onSelect={() => setMotivationStyle("structured")} />
                  <OptionButton label="Challenging" description="Push me to my limits" icon={<span className="text-lg">🔥</span>} isSelected={motivationStyle === "challenging"} onSelect={() => setMotivationStyle("challenging")} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Footer */}
        <footer className="p-6 space-y-4">
          <div className="flex gap-3">
            {step > 0 && (
              <Button variant="outline" onClick={handleBack} className="flex-1 h-14 rounded-2xl gap-2">
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>
            )}
            {step < TOTAL_STEPS - 1 ? (
              <Button onClick={handleNext} disabled={step === 0 && selectedCategories.length === 0} className="flex-1 h-14 rounded-2xl gap-2">
                Continue <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button onClick={handleComplete} disabled={isSubmitting} className="flex-1 h-14 rounded-2xl gap-2 gradient-momentum text-white border-0">
                {isSubmitting ? "Setting up..." : <>Begin My Journey <Sparkles className="w-4 h-4" /></>}
              </Button>
            )}
          </div>
        </footer>
      </div>
    </>
  );
};

export default Onboarding;