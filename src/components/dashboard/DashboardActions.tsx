import { motion } from "framer-motion";
import { RefreshCw, BarChart3, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardActionsProps {
  onUpdateGoals: () => void;
  onTrackProgress: () => void;
}

const DashboardActions = ({ onUpdateGoals, onTrackProgress }: DashboardActionsProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="flex gap-3"
    >
      <Button
        onClick={onUpdateGoals}
        variant="outline"
        className="flex-1 h-14 rounded-2xl gap-2 border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all group"
      >
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center group-hover:from-primary/30 group-hover:to-primary/20 transition-all">
          <RefreshCw className="w-4 h-4 text-primary" />
        </div>
        <span className="text-sm font-medium">Update Goals</span>
      </Button>
      
      <Button
        onClick={onTrackProgress}
        className="flex-1 h-14 rounded-2xl gap-2 bg-gradient-to-r from-fitness to-emerald-500 hover:from-fitness/90 hover:to-emerald-500/90 text-white shadow-lg shadow-fitness/25 transition-all group"
      >
        <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-all">
          <BarChart3 className="w-4 h-4 text-white" />
        </div>
        <span className="text-sm font-medium">Track Progress</span>
        <Sparkles className="w-4 h-4 opacity-70" />
      </Button>
    </motion.div>
  );
};

export default DashboardActions;
