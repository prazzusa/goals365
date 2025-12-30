import { motion } from "framer-motion";
import { TrendingUp, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface MomentumGaugeProps {
  score: number; // 0-100
  weeklyChange?: number;
}

const MomentumGauge = ({ score, weeklyChange = 0 }: MomentumGaugeProps) => {
  // Calculate rotation for the gauge pointer (-90deg to 90deg maps to 0-100)
  const rotation = -90 + (score / 100) * 180;
  
  // Vibrant gradient segments for the gauge
  const segments = [
    { color: "url(#greenGradient)", start: 0, end: 25 },
    { color: "url(#yellowGradient)", start: 25, end: 50 },
    { color: "url(#orangeGradient)", start: 50, end: 75 },
    { color: "url(#purpleGradient)", start: 75, end: 100 },
  ];

  // Get score level and color
  const getScoreLevel = () => {
    if (score >= 80) return { label: "Mastery", color: "text-score-mastery", bg: "bg-score-mastery" };
    if (score >= 60) return { label: "Flow", color: "text-score-flow", bg: "bg-score-flow" };
    if (score >= 40) return { label: "Rise", color: "text-score-rise", bg: "bg-score-rise" };
    if (score >= 20) return { label: "Build", color: "text-score-build", bg: "bg-score-build" };
    return { label: "Seed", color: "text-score-seed", bg: "bg-score-seed" };
  };

  const level = getScoreLevel();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative flex flex-col items-center pt-6 pb-4 bg-gradient-to-br from-card via-card to-primary/5 rounded-3xl border border-border/50 shadow-card overflow-hidden"
    >
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-fitness/10 to-transparent rounded-full blur-2xl" />
      
      {/* Gauge SVG */}
      <div className="relative w-56 h-28 overflow-hidden">
        <svg 
          viewBox="0 0 200 100" 
          className="w-full h-full"
        >
          {/* Define gradients */}
          <defs>
            <linearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(150, 70%, 45%)" />
              <stop offset="100%" stopColor="hsl(170, 65%, 50%)" />
            </linearGradient>
            <linearGradient id="yellowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(45, 93%, 55%)" />
              <stop offset="100%" stopColor="hsl(35, 90%, 52%)" />
            </linearGradient>
            <linearGradient id="orangeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(25, 95%, 55%)" />
              <stop offset="100%" stopColor="hsl(15, 90%, 50%)" />
            </linearGradient>
            <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(250, 84%, 63%)" />
              <stop offset="100%" stopColor="hsl(280, 85%, 60%)" />
            </linearGradient>
            <linearGradient id="pointerGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--foreground))" />
              <stop offset="100%" stopColor="hsl(var(--primary))" />
            </linearGradient>
          </defs>
          
          {/* Background arc */}
          <path
            d="M 10 100 A 90 90 0 0 1 190 100"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="18"
            strokeLinecap="round"
          />
          
          {/* Colored segments */}
          {segments.map((segment, i) => {
            const startAngle = -180 + (segment.start / 100) * 180;
            const endAngle = -180 + (segment.end / 100) * 180;
            const startRad = (startAngle * Math.PI) / 180;
            const endRad = (endAngle * Math.PI) / 180;
            
            const x1 = 100 + 90 * Math.cos(startRad);
            const y1 = 100 + 90 * Math.sin(startRad);
            const x2 = 100 + 90 * Math.cos(endRad);
            const y2 = 100 + 90 * Math.sin(endRad);
            
            return (
              <motion.path
                key={i}
                d={`M ${x1} ${y1} A 90 90 0 0 1 ${x2} ${y2}`}
                fill="none"
                stroke={segment.color}
                strokeWidth="14"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ delay: 0.2 + i * 0.1, duration: 0.6 }}
              />
            );
          })}
          
          {/* Center decorative ring */}
          <circle cx="100" cy="100" r="12" fill="hsl(var(--card))" stroke="url(#purpleGradient)" strokeWidth="3" />
          
          {/* Pointer */}
          <motion.g
            initial={{ rotate: -90 }}
            animate={{ rotate: rotation }}
            transition={{ type: "spring", stiffness: 60, damping: 15 }}
            style={{ transformOrigin: "100px 100px" }}
          >
            <line
              x1="100"
              y1="100"
              x2="100"
              y2="20"
              stroke="url(#pointerGradient)"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <circle cx="100" cy="100" r="6" fill="hsl(var(--primary))" />
          </motion.g>
        </svg>
        
        {/* Score display */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="absolute inset-0 flex items-end justify-center pb-0"
        >
          <div className="flex items-baseline gap-1">
            <span className="text-5xl font-bold bg-gradient-to-r from-primary to-score-mastery bg-clip-text text-transparent">
              {score}
            </span>
          </div>
        </motion.div>
      </div>
      
      {/* Level Badge */}
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1 rounded-full mt-2",
          level.bg + "/20"
        )}
      >
        <Sparkles className={cn("w-3.5 h-3.5", level.color)} />
        <span className={cn("text-sm font-semibold", level.color)}>{level.label}</span>
      </motion.div>
      
      {/* Labels */}
      <p className="text-sm text-muted-foreground mt-2">Your momentum this week</p>
      
      {weeklyChange !== 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className={cn(
            "flex items-center gap-1 text-sm font-medium mt-1 px-2 py-0.5 rounded-full",
            weeklyChange > 0 
              ? "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400" 
              : "text-destructive bg-destructive/10"
          )}
        >
          <TrendingUp className={cn("w-4 h-4", weeklyChange < 0 && "rotate-180")} />
          {weeklyChange > 0 ? "+" : ""}{weeklyChange}% from last week
        </motion.div>
      )}
    </motion.div>
  );
};

export default MomentumGauge;
