import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { TrendingUp, Target, BarChart3, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

const ProgressInsights = () => {
  const navigate = useNavigate();
  const momentumScore = 72;
  const level = "Build";

  const factors = [
    { label: "Consistency", value: 80, color: "bg-blue-500" },
    { label: "Completion", value: 65, color: "bg-green-500" },
    { label: "Recovery", value: 75, color: "bg-amber-500" },
    { label: "Adaptability", value: 70, color: "bg-purple-500" },
  ];

  const categoryBalance = [
    { name: "Personal", value: 35, color: "bg-rose-500" },
    { name: "Professional", value: 40, color: "bg-blue-500" },
    { name: "Fitness", value: 25, color: "bg-emerald-500" },
  ];

  return (
    <div className="min-h-screen flex flex-col px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Progress & Insights</h1>
        <p className="text-muted-foreground text-sm">Your momentum at a glance</p>
      </div>

      <div className="flex-1 flex flex-col max-w-lg mx-auto w-full">
        {/* Momentum Score */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl p-6 text-center mb-6"
        >
          <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3">
            <span className="text-4xl font-bold text-primary">{momentumScore}</span>
          </div>
          <p className="text-lg font-semibold text-foreground">Life Momentum</p>
          <p className="text-sm text-muted-foreground">Level: {level}</p>
        </motion.div>

        {/* Score Factors */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4" /> Score Factors
          </h3>
          <div className="space-y-3">
            {factors.map((factor, i) => (
              <div key={factor.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-foreground">{factor.label}</span>
                  <span className="text-muted-foreground">{factor.value}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${factor.value}%` }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                    className={cn("h-full rounded-full", factor.color)}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Category Balance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex-1"
        >
          <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
            <BarChart3 className="w-4 h-4" /> Category Balance
          </h3>
          <div className="flex h-4 rounded-full overflow-hidden mb-3">
            {categoryBalance.map((cat) => (
              <div
                key={cat.name}
                className={cn("h-full", cat.color)}
                style={{ width: `${cat.value}%` }}
              />
            ))}
          </div>
          <div className="flex justify-between text-xs">
            {categoryBalance.map((cat) => (
              <div key={cat.name} className="flex items-center gap-1">
                <div className={cn("w-2 h-2 rounded-full", cat.color)} />
                <span className="text-muted-foreground">{cat.name}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center text-sm text-muted-foreground italic mt-6"
        >
          "Progress over perfection."
        </motion.p>

        <Button
          onClick={() => navigate("/planning")}
          size="lg"
          className="w-full h-14 text-lg font-semibold rounded-xl mt-6"
        >
          Continue Planning
        </Button>
      </div>
    </div>
  );
};

export default ProgressInsights;
