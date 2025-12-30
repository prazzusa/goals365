import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sparkles, RotateCcw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface QuarterlyWelcomeProps {
  onStartPlanning: () => void;
  onResume: () => void;
  hasExistingProgress?: boolean;
}

const QuarterlyWelcome = ({ onStartPlanning, onResume, hasExistingProgress = false }: QuarterlyWelcomeProps) => {
  const { user } = useAuth();
  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || "there";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-md mx-auto"
      >
        {/* Welcome Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-20 h-20 mx-auto mb-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center"
        >
          <Sparkles className="w-10 h-10 text-primary" />
        </motion.div>

        {/* Header */}
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-bold text-foreground mb-3"
        >
          Welcome back, {firstName}
        </motion.h1>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-muted-foreground text-lg mb-12"
        >
          Let's shape your progress — one step at a time.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-4"
        >
          <Button
            onClick={onStartPlanning}
            size="lg"
            className="w-full h-14 text-lg font-semibold rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Start Planning
          </Button>

          {hasExistingProgress && (
            <Button
              onClick={onResume}
              variant="outline"
              size="lg"
              className="w-full h-14 text-lg font-medium rounded-xl border-2"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Resume Where I Left Off
            </Button>
          )}
        </motion.div>

        {/* Decorative elements */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 0.7 }}
          className="mt-16 text-sm text-muted-foreground"
        >
          Your journey to meaningful progress starts here
        </motion.div>
      </motion.div>
    </div>
  );
};

export default QuarterlyWelcome;
