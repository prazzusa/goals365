import { motion } from "framer-motion";
import { ChevronRight, Plus, Heart, Briefcase, Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface CategorySectionProps {
  category: "personal" | "professional" | "fitness";
  title: string;
  count: number;
  completedCount: number;
  children?: React.ReactNode;
  onAddGoal?: () => void;
}

const categoryConfig = {
  personal: {
    icon: Heart,
    gradient: "gradient-personal",
    bg: "bg-personal-light",
    text: "text-personal",
    link: "/addgoals/personal",
  },
  professional: {
    icon: Briefcase,
    gradient: "gradient-professional",
    bg: "bg-professional-light",
    text: "text-professional",
    link: "/addgoals/professional",
  },
  fitness: {
    icon: Dumbbell,
    gradient: "gradient-fitness",
    bg: "bg-fitness-light",
    text: "text-fitness",
    link: "/addgoals/fitness",
  },
};

export const CategorySection = ({
  category,
  title,
  count,
  completedCount,
  children,
  onAddGoal,
}: CategorySectionProps) => {
  const config = categoryConfig[category];
  const Icon = config.icon;
  const progress = count > 0 ? Math.round((completedCount / count) * 100) : 0;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center",
              config.bg
            )}
          >
            <Icon className={cn("w-5 h-5", config.text)} />
          </div>
          <div>
            <h2 className="font-display font-bold">{title}</h2>
            <p className="text-xs text-muted-foreground">
              {completedCount}/{count} completed • {progress}%
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link to={config.link}>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-xl hover:bg-muted"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </Link>
          <Link to={config.link}>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-xl hover:bg-muted"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={cn("h-full rounded-full", config.gradient)}
        />
      </div>

      {/* Content */}
      {children && <div className="space-y-2">{children}</div>}
    </motion.section>
  );
};