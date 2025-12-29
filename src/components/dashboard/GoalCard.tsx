import { motion } from "framer-motion";
import { Check, MoreHorizontal, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProgressRing } from "./ProgressRing";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface GoalCardProps {
  title: string;
  category: "personal" | "professional" | "fitness";
  progress: number;
  isCompleted?: boolean;
  streak?: number;
  onClick?: () => void;
  onComplete?: () => void;
  onEdit?: () => void;
  delay?: number;
}

const categoryStyles = {
  personal: {
    gradient: "gradient-personal",
    ring: "stroke-personal",
    bg: "bg-personal-light",
    text: "text-personal",
  },
  professional: {
    gradient: "gradient-professional",
    ring: "stroke-professional",
    bg: "bg-professional-light",
    text: "text-professional",
  },
  fitness: {
    gradient: "gradient-fitness",
    ring: "stroke-fitness",
    bg: "bg-fitness-light",
    text: "text-fitness",
  },
};

export const GoalCard = ({
  title,
  category,
  progress,
  isCompleted = false,
  streak,
  onClick,
  onComplete,
  onEdit,
  delay = 0,
}: GoalCardProps) => {
  const styles = categoryStyles[category];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.1, duration: 0.4 }}
      whileHover={{ y: -2 }}
      className={cn(
        "relative p-4 rounded-2xl bg-card border border-border shadow-card",
        "hover:shadow-card-hover transition-all duration-300",
        isCompleted && "opacity-80"
      )}
    >
      <div className="flex items-center gap-4">
        {/* Progress Ring */}
        <ProgressRing
          progress={isCompleted ? 100 : progress}
          size={56}
          strokeWidth={5}
          color={styles.ring}
          showLabel={false}
        >
          {isCompleted ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={cn("w-8 h-8 rounded-full flex items-center justify-center", styles.gradient)}
            >
              <Check className="w-5 h-5 text-white" />
            </motion.div>
          ) : (
            <span className={cn("text-xs font-bold", styles.text)}>
              {Math.round(progress)}%
            </span>
          )}
        </ProgressRing>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3
            className={cn(
              "font-semibold truncate",
              isCompleted && "line-through text-muted-foreground"
            )}
          >
            {title}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className={cn("text-xs px-2 py-0.5 rounded-full capitalize", styles.bg, styles.text)}>
              {category}
            </span>
            {streak && streak > 0 && (
              <span className="text-xs text-muted-foreground">
                🔥 {streak} day streak
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {!isCompleted && onComplete && (
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onComplete();
              }}
              className="h-9 w-9 rounded-xl hover:bg-primary/10"
            >
              <Check className="w-4 h-4" />
            </Button>
          )}

          {onClick && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClick}
              className="h-9 w-9 rounded-xl hover:bg-muted"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}

          {onEdit && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-xl hover:bg-muted"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl">
                <DropdownMenuItem onClick={onEdit}>Edit Goal</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </motion.div>
  );
};