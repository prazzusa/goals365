import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, ChevronRight } from "lucide-react";
import { UpsellPrompt } from "./UpsellPrompt";

interface SubtleUpsellProps {
  message: string;
  context?: "category" | "analytics" | "fitness" | "insights" | "general";
  className?: string;
}

export const SubtleUpsell = ({
  message,
  context = "general",
  className = "",
}: SubtleUpsellProps) => {
  const [showUpsell, setShowUpsell] = useState(false);

  return (
    <>
      <motion.button
        onClick={() => setShowUpsell(true)}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`w-full p-4 rounded-2xl bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 flex items-center gap-3 group transition-all hover:from-primary/10 hover:to-primary/15 ${className}`}
      >
        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-medium text-foreground">{message}</p>
          <p className="text-xs text-muted-foreground">Upgrade to Momentum+</p>
        </div>
        <ChevronRight className="w-5 h-5 text-primary/60 group-hover:text-primary transition-colors" />
      </motion.button>
      <UpsellPrompt
        isOpen={showUpsell}
        onClose={() => setShowUpsell(false)}
        context={context}
      />
    </>
  );
};
