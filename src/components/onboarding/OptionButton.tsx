import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface OptionButtonProps {
  label: string;
  description?: string;
  icon?: ReactNode;
  isSelected: boolean;
  onSelect: () => void;
  delay?: number;
  variant?: "default" | "large";
}

export const OptionButton = ({
  label,
  description,
  icon,
  isSelected,
  onSelect,
  delay = 0,
  variant = "default",
}: OptionButtonProps) => {
  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.05, duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      className={cn(
        "relative w-full text-left transition-all duration-200 touch-target",
        "rounded-2xl border-2 overflow-hidden",
        variant === "large" ? "p-5" : "p-4",
        isSelected
          ? "border-primary bg-primary/5"
          : "border-border bg-card hover:border-primary/30 hover:bg-primary/5"
      )}
    >
      <div className="flex items-center gap-3">
        {icon && (
          <div
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
              isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
            )}
          >
            {icon}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <span className="font-medium block">{label}</span>
          {description && (
            <span className="text-sm text-muted-foreground">{description}</span>
          )}
        </div>

        <div
          className={cn(
            "w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all",
            isSelected
              ? "bg-primary text-primary-foreground"
              : "border-2 border-muted-foreground/30"
          )}
        >
          {isSelected && <Check className="w-3 h-3" />}
        </div>
      </div>
    </motion.button>
  );
};