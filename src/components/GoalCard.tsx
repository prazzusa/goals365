import { motion } from "framer-motion";
import { Check, MoreHorizontal, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface GoalCardProps {
  goal: string;
  index: number;
  onRemove?: () => void;
  onComplete?: () => void;
  isCompleted?: boolean;
}

const GoalCard = ({ goal, index, onRemove, onComplete, isCompleted }: GoalCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ delay: index * 0.05 }}
      className={`group relative p-4 rounded-xl border transition-all duration-200 ${
        isCompleted 
          ? "bg-primary/5 border-primary/20" 
          : "bg-card border-border hover:border-primary/30 hover:shadow-md"
      }`}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={onComplete}
          className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
            isCompleted 
              ? "bg-primary border-primary" 
              : "border-muted-foreground/30 hover:border-primary"
          }`}
        >
          {isCompleted && <Check className="w-3 h-3 text-primary-foreground" />}
        </button>
        
        <div className="flex-1">
          <p className={`text-sm font-medium ${isCompleted ? "line-through text-muted-foreground" : ""}`}>
            {goal}
          </p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onRemove} className="text-destructive">
              Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {isCompleted && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-2 -right-2"
        >
          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-primary-foreground" />
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default GoalCard;
