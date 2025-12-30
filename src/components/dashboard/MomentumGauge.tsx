import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface MomentumGaugeProps {
  score: number; // 0-100
  weeklyChange?: number;
}

const MomentumGauge = ({ score, weeklyChange = 0 }: MomentumGaugeProps) => {
  // Calculate rotation for the gauge pointer (-90deg to 90deg maps to 0-100)
  const rotation = -90 + (score / 100) * 180;
  
  // Color segments for the gauge
  const segments = [
    { color: "#4ade80", start: 0, end: 40 },    // Green
    { color: "#facc15", start: 40, end: 60 },   // Yellow
    { color: "#f97316", start: 60, end: 80 },   // Orange
    { color: "#3b82f6", start: 80, end: 100 },  // Blue
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative flex flex-col items-center pt-4 pb-2"
    >
      {/* Gauge SVG */}
      <div className="relative w-48 h-24 overflow-hidden">
        <svg 
          viewBox="0 0 200 100" 
          className="w-full h-full"
        >
          {/* Background arc */}
          <path
            d="M 10 100 A 90 90 0 0 1 190 100"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="16"
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
              <path
                key={i}
                d={`M ${x1} ${y1} A 90 90 0 0 1 ${x2} ${y2}`}
                fill="none"
                stroke={segment.color}
                strokeWidth="12"
                strokeLinecap="round"
                opacity={0.9}
              />
            );
          })}
          
          {/* Center point */}
          <circle cx="100" cy="100" r="8" fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth="2" />
          
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
              y2="25"
              stroke="hsl(var(--foreground))"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <circle cx="100" cy="100" r="4" fill="hsl(var(--foreground))" />
          </motion.g>
        </svg>
        
        {/* Score display */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="absolute inset-0 flex items-end justify-center pb-0"
        >
          <span className="text-5xl font-bold text-primary">{score}</span>
        </motion.div>
      </div>
      
      {/* Labels */}
      <p className="text-sm text-muted-foreground mt-2">Your momentum this week</p>
      
      {weeklyChange !== 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className={cn(
            "flex items-center gap-1 text-sm font-medium mt-1",
            weeklyChange > 0 ? "text-emerald-500" : "text-destructive"
          )}
        >
          <TrendingUp className={cn("w-4 h-4", weeklyChange < 0 && "rotate-180")} />
          {weeklyChange > 0 ? "Improving" : "Declining"} from last week
        </motion.div>
      )}
    </motion.div>
  );
};

export default MomentumGauge;
