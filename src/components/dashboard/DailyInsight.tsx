import { motion } from "framer-motion";
import { Lightbulb, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DailyInsightProps {
  message: string;
  suggestion?: string;
  type?: "encouragement" | "tip" | "celebration" | "gentle";
  onAction?: () => void;
  actionLabel?: string;
}

const typeConfig = {
  encouragement: {
    bg: "bg-emotion-calm/10",
    border: "border-emotion-calm/20",
    icon: "text-emotion-calm",
  },
  tip: {
    bg: "bg-emotion-focus/10",
    border: "border-emotion-focus/20",
    icon: "text-emotion-focus",
  },
  celebration: {
    bg: "bg-emotion-joy/10",
    border: "border-emotion-joy/20",
    icon: "text-emotion-joy",
  },
  gentle: {
    bg: "bg-muted",
    border: "border-border",
    icon: "text-muted-foreground",
  },
};

export const DailyInsight = ({
  message,
  suggestion,
  type = "tip",
  onAction,
  actionLabel = "Let's go",
}: DailyInsightProps) => {
  const config = typeConfig[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "p-4 rounded-2xl border",
        config.bg,
        config.border
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn("mt-0.5", config.icon)}>
          <Lightbulb className="w-5 h-5" />
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm leading-relaxed">{message}</p>
          {suggestion && (
            <p className="text-sm text-muted-foreground mt-1">{suggestion}</p>
          )}
        </div>

        {onAction && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onAction}
            className="shrink-0 gap-1 text-primary hover:text-primary"
          >
            {actionLabel}
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </motion.div>
  );
};