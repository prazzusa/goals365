import { motion } from "framer-motion";
import { Check, Heart, Briefcase, Dumbbell } from "lucide-react";
import { cn } from "@/lib/utils";

interface CategoryCardProps {
  category: "personal" | "professional" | "fitness";
  title: string;
  subtitle: string;
  microcopy: string;
  isSelected: boolean;
  onSelect: () => void;
  delay?: number;
}

const categoryConfig = {
  personal: {
    icon: Heart,
    gradient: "gradient-personal",
    shadow: "shadow-personal",
    bgLight: "bg-personal-light",
  },
  professional: {
    icon: Briefcase,
    gradient: "gradient-professional",
    shadow: "shadow-professional",
    bgLight: "bg-professional-light",
  },
  fitness: {
    icon: Dumbbell,
    gradient: "gradient-fitness",
    shadow: "shadow-fitness",
    bgLight: "bg-fitness-light",
  },
};

export const CategoryCard = ({
  category,
  title,
  subtitle,
  microcopy,
  isSelected,
  onSelect,
  delay = 0,
}: CategoryCardProps) => {
  const config = categoryConfig[category];
  const Icon = config.icon;

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.1, duration: 0.4 }}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      className={cn(
        "relative w-full p-6 rounded-3xl text-left transition-all duration-300 touch-target",
        "border-2 overflow-hidden group",
        isSelected
          ? `border-transparent ${config.shadow}`
          : "border-border bg-card hover:border-primary/30"
      )}
    >
      {/* Background gradient when selected */}
      {isSelected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={cn("absolute inset-0 opacity-10", config.gradient)}
        />
      )}

      {/* Content */}
      <div className="relative z-10">
        {/* Icon */}
        <div
          className={cn(
            "w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-all",
            isSelected ? config.gradient : config.bgLight
          )}
        >
          <Icon
            className={cn(
              "w-7 h-7 transition-colors",
              isSelected ? "text-white" : `text-${category}`
            )}
          />
        </div>

        {/* Title & Subtitle */}
        <h3 className="text-xl font-display font-bold mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground mb-3">{subtitle}</p>

        {/* Microcopy */}
        <p className="text-xs text-muted-foreground italic">{microcopy}</p>

        {/* Selection indicator */}
        <div
          className={cn(
            "absolute top-4 right-4 w-6 h-6 rounded-full flex items-center justify-center transition-all",
            isSelected
              ? `${config.gradient} text-white`
              : "border-2 border-muted-foreground/30"
          )}
        >
          {isSelected && <Check className="w-4 h-4" />}
        </div>
      </div>

      {/* Hover glow effect */}
      <motion.div
        className={cn(
          "absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity",
          config.gradient
        )}
      />
    </motion.button>
  );
};