import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Sparkles, ArrowRight, Flame, Target, Compass, Scale, Waves } from "lucide-react";
import { Button } from "@/components/ui/button";
import confetti from "canvas-confetti";

interface WelcomeRevealProps {
  archetype: string;
  userName?: string;
  goalsCreated: number;
}

const archetypeData = {
  explorer: {
    name: "The Explorer",
    emoji: "🧭",
    icon: Compass,
    color: "from-cyan-500 to-blue-500",
    tagline: "Curious soul, endless possibilities",
    description: "You thrive on discovery and new experiences. Your journey will be filled with diverse goals that keep life exciting and fresh.",
    traits: ["Curious", "Adaptable", "Open-minded"],
  },
  builder: {
    name: "The Builder",
    emoji: "🔧",
    icon: Target,
    color: "from-amber-500 to-orange-500",
    tagline: "One brick at a time",
    description: "You believe in steady, consistent progress. Your approach is methodical, building lasting habits that compound over time.",
    traits: ["Patient", "Persistent", "Methodical"],
  },
  rebalancer: {
    name: "The Rebalancer",
    emoji: "⚖️",
    icon: Scale,
    color: "from-violet-500 to-purple-500",
    tagline: "Harmony in all things",
    description: "You seek balance across all areas of life. Your goals will help you nurture every dimension of your wellbeing.",
    traits: ["Balanced", "Mindful", "Holistic"],
  },
  achiever: {
    name: "The Achiever",
    emoji: "🎯",
    icon: Flame,
    color: "from-rose-500 to-red-500",
    tagline: "Born to conquer",
    description: "You're driven by results and love a good challenge. Prepare for ambitious goals that push you to your limits.",
    traits: ["Ambitious", "Driven", "Results-focused"],
  },
  harmonizer: {
    name: "The Harmonizer",
    emoji: "🌊",
    icon: Waves,
    color: "from-teal-500 to-emerald-500",
    tagline: "Flow with purpose",
    description: "You value peace and sustainable growth. Your journey prioritizes wellbeing and gentle, lasting transformation.",
    traits: ["Peaceful", "Sustainable", "Nurturing"],
  },
};

export const WelcomeReveal = ({ archetype, userName, goalsCreated }: WelcomeRevealProps) => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<"intro" | "reveal" | "traits" | "ready">("intro");
  const data = archetypeData[archetype as keyof typeof archetypeData] || archetypeData.explorer;
  const IconComponent = data.icon;

  useEffect(() => {
    // Progress through phases
    const timers = [
      setTimeout(() => setPhase("reveal"), 1500),
      setTimeout(() => {
        setPhase("traits");
        // Trigger confetti on reveal
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#8b5cf6", "#06b6d4", "#f59e0b", "#ef4444", "#10b981"],
        });
      }, 3000),
      setTimeout(() => setPhase("ready"), 5000),
    ];

    return () => timers.forEach(clearTimeout);
  }, []);

  const handleContinue = () => {
    navigate("/dashboard");
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex items-center justify-center p-6">
      <AnimatePresence mode="wait">
        {phase === "intro" && (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/20 flex items-center justify-center"
            >
              <Sparkles className="w-10 h-10 text-primary" />
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xl text-muted-foreground"
            >
              Analyzing your profile...
            </motion.p>
          </motion.div>
        )}

        {phase === "reveal" && (
          <motion.div
            key="reveal"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", damping: 15 }}
              className={`w-32 h-32 mx-auto mb-6 rounded-3xl bg-gradient-to-br ${data.color} flex items-center justify-center shadow-2xl`}
            >
              <span className="text-6xl">{data.emoji}</span>
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-sm text-muted-foreground mb-2"
            >
              You are...
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-4xl font-display font-bold mb-2"
            >
              {data.name}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-lg text-primary font-medium"
            >
              {data.tagline}
            </motion.p>
          </motion.div>
        )}

        {(phase === "traits" || phase === "ready") && (
          <motion.div
            key="traits"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center max-w-md"
          >
            {/* Archetype header */}
            <motion.div
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              className={`w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${data.color} flex items-center justify-center shadow-xl`}
            >
              <span className="text-5xl">{data.emoji}</span>
            </motion.div>

            <h1 className="text-3xl font-display font-bold mb-2">{data.name}</h1>
            <p className="text-primary font-medium mb-4">{data.tagline}</p>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-muted-foreground mb-6"
            >
              {data.description}
            </motion.p>

            {/* Traits */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex justify-center gap-2 mb-8"
            >
              {data.traits.map((trait, i) => (
                <motion.span
                  key={trait}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium"
                >
                  {trait}
                </motion.span>
              ))}
            </motion.div>

            {/* Goals created badge */}
            {goalsCreated > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emotion-growth/10 text-emotion-growth mb-8"
              >
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {goalsCreated} starter {goalsCreated === 1 ? "goal" : "goals"} created for today
                </span>
              </motion.div>
            )}

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: phase === "ready" ? 1 : 0.5 }}
              transition={{ delay: 0.8 }}
            >
              <Button
                onClick={handleContinue}
                disabled={phase !== "ready"}
                className="h-14 px-8 rounded-2xl gap-2 text-base gradient-momentum text-white border-0"
              >
                {phase === "ready" ? (
                  <>
                    Let's Begin <ArrowRight className="w-5 h-5" />
                  </>
                ) : (
                  "Preparing your dashboard..."
                )}
              </Button>
            </motion.div>

            {userName && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="mt-6 text-sm text-muted-foreground"
              >
                Welcome to your journey, {userName}
              </motion.p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
