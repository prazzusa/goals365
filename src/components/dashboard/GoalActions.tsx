import { motion } from "framer-motion";
import { Target, RefreshCw, BarChart3, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface GoalActionsProps {
  onSetGoals: () => void;
  onUpdateGoals: () => void;
  onTrackGoals: () => void;
}

const ActionCard = ({
  title,
  description,
  icon: Icon,
  gradient,
  onClick,
  delay = 0,
}: {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  onClick: () => void;
  delay?: number;
}) => (
  <motion.button
    onClick={onClick}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4, ease: "easeOut" }}
    whileHover={{ scale: 1.02, y: -2 }}
    whileTap={{ scale: 0.98 }}
    className={cn(
      "relative overflow-hidden w-full p-5 rounded-2xl text-left transition-shadow",
      "border border-border/50 shadow-sm hover:shadow-lg",
      gradient
    )}
  >
    {/* Subtle glow effect */}
    <motion.div
      className="absolute inset-0 opacity-0 bg-gradient-to-br from-white/20 to-transparent"
      whileHover={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    />
    
    <div className="relative z-10 flex items-start gap-4">
      <motion.div
        initial={{ scale: 0.8, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: delay + 0.2, type: "spring", stiffness: 200 }}
        className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center"
      >
        <Icon className="w-6 h-6 text-white" />
      </motion.div>
      
      <div className="flex-1">
        <h3 className="font-display font-bold text-lg text-white mb-1">{title}</h3>
        <p className="text-sm text-white/80 leading-relaxed">{description}</p>
      </div>
    </div>
    
    {/* Decorative elements */}
    <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-white/10 blur-xl" />
    <div className="absolute right-8 top-2 w-2 h-2 rounded-full bg-white/30" />
  </motion.button>
);

const GoalActions = ({ onSetGoals, onUpdateGoals, onTrackGoals }: GoalActionsProps) => {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      {/* Inspirational header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2 px-4"
      >
        <div className="flex items-center justify-center gap-2 text-primary">
          <Sparkles className="w-4 h-4" />
          <span className="text-xs font-medium uppercase tracking-wider">Take Action</span>
          <Sparkles className="w-4 h-4" />
        </div>
        <p className="text-sm text-muted-foreground">
          The best progress starts with intention.
        </p>
      </motion.div>

      {/* Action Cards */}
      <div className="space-y-3">
        <ActionCard
          title="Set Goals"
          description="Design your intent. Plan your path to success."
          icon={Target}
          gradient="bg-gradient-to-br from-primary to-primary/80"
          onClick={onSetGoals}
          delay={0.1}
        />
        
        <ActionCard
          title="Update Goals"
          description="Refine and adjust your goals as you grow."
          icon={RefreshCw}
          gradient="bg-gradient-to-br from-emerald-500 to-emerald-600"
          onClick={onUpdateGoals}
          delay={0.2}
        />
        
        <ActionCard
          title="Track Goals"
          description="Reflect on your progress and celebrate wins."
          icon={BarChart3}
          gradient="bg-gradient-to-br from-amber-500 to-orange-500"
          onClick={onTrackGoals}
          delay={0.3}
        />
      </div>
    </motion.section>
  );
};

export default GoalActions;
