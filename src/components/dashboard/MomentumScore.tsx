import { motion } from "framer-motion";
import { Sparkles, TrendingUp, Flame, Droplets, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProgressRing } from "./ProgressRing";

interface MomentumScoreProps {
  score: number; // 0-1000
  level: "seed" | "build" | "rise" | "flow" | "mastery";
  streakDays: number;
  weeklyChange?: number;
  compact?: boolean;
}

const levelConfig = {
  seed: {
    label: "Seed",
    emoji: "🌱",
    color: "text-score-seed",
    ring: "stroke-score-seed",
    gradient: "from-score-seed to-emerald-400",
    description: "Planting the seeds of change",
    range: [0, 200],
  },
  build: {
    label: "Build",
    emoji: "🔧",
    color: "text-score-build",
    ring: "stroke-score-build",
    gradient: "from-score-build to-amber-400",
    description: "Building your foundation",
    range: [201, 400],
  },
  rise: {
    label: "Rise",
    emoji: "🔥",
    color: "text-score-rise",
    ring: "stroke-score-rise",
    gradient: "from-score-rise to-orange-400",
    description: "Rising to new heights",
    range: [401, 600],
  },
  flow: {
    label: "Flow",
    emoji: "🌊",
    color: "text-score-flow",
    ring: "stroke-score-flow",
    gradient: "from-score-flow to-violet-400",
    description: "In the flow of growth",
    range: [601, 800],
  },
  mastery: {
    label: "Mastery",
    emoji: "✨",
    color: "text-score-mastery",
    ring: "stroke-score-mastery",
    gradient: "from-score-mastery to-fuchsia-400",
    description: "Mastering your potential",
    range: [801, 1000],
  },
};

export const MomentumScore = ({
  score,
  level,
  streakDays,
  weeklyChange = 0,
  compact = false,
}: MomentumScoreProps) => {
  const config = levelConfig[level];
  const progressInLevel =
    ((score - config.range[0]) / (config.range[1] - config.range[0])) * 100;

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-border"
      >
        <ProgressRing
          progress={Math.min(100, progressInLevel)}
          size={48}
          strokeWidth={4}
          color={config.ring}
          showLabel={false}
        >
          <span className="text-lg">{config.emoji}</span>
        </ProgressRing>
        <div>
          <p className="text-sm font-medium">
            {score} <span className="text-muted-foreground">pts</span>
          </p>
          <p className={cn("text-xs font-medium", config.color)}>
            {config.label}
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl bg-card border border-border p-6"
    >
      {/* Background gradient */}
      <div
        className={cn(
          "absolute inset-0 opacity-5 bg-gradient-to-br",
          config.gradient
        )}
      />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Sparkles className={cn("w-5 h-5", config.color)} />
            <h3 className="font-display font-bold">Life Momentum</h3>
          </div>
          {weeklyChange !== 0 && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className={cn(
                "flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-full",
                weeklyChange > 0
                  ? "bg-emotion-growth/10 text-emotion-growth"
                  : "bg-destructive/10 text-destructive"
              )}
            >
              <TrendingUp
                className={cn("w-3 h-3", weeklyChange < 0 && "rotate-180")}
              />
              {weeklyChange > 0 ? "+" : ""}
              {weeklyChange}
            </motion.div>
          )}
        </div>

        {/* Score display */}
        <div className="flex items-center gap-6">
          <ProgressRing
            progress={Math.min(100, progressInLevel)}
            size={120}
            strokeWidth={8}
            color={config.ring}
            showLabel={false}
          >
            <div className="text-center">
              <motion.p
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="text-3xl font-display font-bold"
              >
                {score}
              </motion.p>
              <p className="text-xs text-muted-foreground">points</p>
            </div>
          </ProgressRing>

          <div className="flex-1">
            {/* Level badge */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-2 mb-2"
            >
              <span className="text-2xl">{config.emoji}</span>
              <span className={cn("text-xl font-display font-bold", config.color)}>
                {config.label}
              </span>
            </motion.div>

            <p className="text-sm text-muted-foreground mb-4">
              {config.description}
            </p>

            {/* Stats */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-emotion-energy" />
                <span className="text-sm font-medium">{streakDays} days</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 text-emotion-joy" />
                <span className="text-sm text-muted-foreground">
                  Next: {config.range[1] - score} pts
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};