import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowRight } from "lucide-react";

interface MonthlyWelcomeProps {
  onStartPlanning: () => void;
}

const MonthlyWelcome = ({ onStartPlanning }: MonthlyWelcomeProps) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6"
        >
          <Calendar className="w-10 h-10 text-primary" />
        </motion.div>

        <h1 className="text-3xl font-bold text-foreground mb-3">
          Refine into Monthly Focus
        </h1>
        <p className="text-muted-foreground mb-8">
          Turn your quarterly vision into realistic monthly progress.
        </p>

        <Button
          onClick={onStartPlanning}
          size="lg"
          className="h-14 px-8 text-lg font-semibold rounded-xl"
        >
          Start Monthly Planning
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </motion.div>
    </div>
  );
};

export default MonthlyWelcome;
