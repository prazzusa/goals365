import { motion } from "framer-motion";
import { Sparkles, Leaf } from "lucide-react";
import { usePremium } from "@/hooks/usePremium";

interface TierBadgeProps {
  showUpgrade?: boolean;
  compact?: boolean;
  onClick?: () => void;
}

export const TierBadge = ({ 
  showUpgrade = true, 
  compact = false,
  onClick 
}: TierBadgeProps) => {
  const { isPremium, tierName } = usePremium();

  if (compact) {
    return (
      <motion.button
        onClick={onClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
          isPremium
            ? "bg-primary/20 text-primary"
            : "bg-muted text-muted-foreground hover:bg-muted/80"
        }`}
      >
        {isPremium ? (
          <Sparkles className="w-3 h-3" />
        ) : (
          <Leaf className="w-3 h-3" />
        )}
        {tierName}
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center gap-3 p-3 rounded-2xl ${
        isPremium
          ? "bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20"
          : "bg-muted/50 border border-border"
      }`}
    >
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
          isPremium ? "bg-primary/20" : "bg-muted"
        }`}
      >
        {isPremium ? (
          <Sparkles className="w-5 h-5 text-primary" />
        ) : (
          <Leaf className="w-5 h-5 text-muted-foreground" />
        )}
      </div>
      <div className="flex-1">
        <p className="font-semibold text-foreground">{tierName}</p>
        <p className="text-xs text-muted-foreground">
          {isPremium ? "Full access unlocked" : "Free tier"}
        </p>
      </div>
      {!isPremium && showUpgrade && onClick && (
        <motion.button
          onClick={onClick}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium"
        >
          Upgrade
        </motion.button>
      )}
    </motion.div>
  );
};
