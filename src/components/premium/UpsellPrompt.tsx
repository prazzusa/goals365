import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, TrendingUp, Brain, Zap, Calendar, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface UpsellPromptProps {
  isOpen: boolean;
  onClose: () => void;
  feature?: string;
  context?: "category" | "analytics" | "fitness" | "insights" | "general";
}

const contextMessages = {
  category: {
    title: "Unlock All Categories",
    subtitle: "Focus on personal, professional, AND fitness goals together",
    icon: TrendingUp,
  },
  analytics: {
    title: "See Your Full Journey",
    subtitle: "Access complete history and deep analytics",
    icon: BarChart3,
  },
  fitness: {
    title: "Advanced Fitness Tracking",
    subtitle: "Track sets, reps, weight, cardio, and nutrition",
    icon: Zap,
  },
  insights: {
    title: "AI-Powered Insights",
    subtitle: "Get personalized recommendations and predictions",
    icon: Brain,
  },
  general: {
    title: "Upgrade to Momentum+",
    subtitle: "Unlock your full potential",
    icon: Sparkles,
  },
};

const features = [
  { icon: TrendingUp, text: "Unlimited goal categories" },
  { icon: Brain, text: "AI-driven personalization" },
  { icon: BarChart3, text: "Full analytics & history" },
  { icon: Calendar, text: "Smart reminders" },
  { icon: Zap, text: "Advanced fitness tracking" },
  { icon: Sparkles, text: "Predictive insights" },
];

export const UpsellPrompt = ({ 
  isOpen, 
  onClose, 
  context = "general" 
}: UpsellPromptProps) => {
  const navigate = useNavigate();
  const contextInfo = contextMessages[context];
  const ContextIcon = contextInfo.icon;

  const handleUpgrade = () => {
    onClose();
    navigate("/pricing");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-md mx-auto"
          >
            <div className="glass rounded-3xl p-6 border border-primary/20 shadow-2xl">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted/50 transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>

              {/* Header */}
              <div className="text-center mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: "spring" }}
                  className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center"
                >
                  <ContextIcon className="w-8 h-8 text-primary-foreground" />
                </motion.div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  {contextInfo.title}
                </h2>
                <p className="text-muted-foreground">
                  {contextInfo.subtitle}
                </p>
              </div>

              {/* Features */}
              <div className="space-y-3 mb-6">
                {features.map((feature, index) => (
                  <motion.div
                    key={feature.text}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + index * 0.05 }}
                    className="flex items-center gap-3 text-sm"
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <feature.icon className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-foreground">{feature.text}</span>
                  </motion.div>
                ))}
              </div>

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-3"
              >
                <Button
                  onClick={handleUpgrade}
                  className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Upgrade to Momentum+
                </Button>
                <button
                  onClick={onClose}
                  className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Maybe later
                </button>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
