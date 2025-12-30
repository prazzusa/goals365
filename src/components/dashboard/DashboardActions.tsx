import { motion } from "framer-motion";
import { RefreshCw, BarChart3 } from "lucide-react";
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
      className="flex gap-2"
    >
      <Button
        onClick={onUpdateGoals}
        variant="outline"
        className="flex-1 h-12 rounded-xl gap-2"
      >
        <RefreshCw className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-medium">Update Goals</span>
      </Button>
      
      <Button
        onClick={onTrackProgress}
        variant="outline"
        className="flex-1 h-12 rounded-xl gap-2"
      >
        <BarChart3 className="w-4 h-4 text-emerald-500" />
        <span className="text-sm font-medium">Track Progress</span>
      </Button>
    </motion.div>
  );
};

export default DashboardActions;
