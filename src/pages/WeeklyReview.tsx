import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ThumbsUp, ThumbsDown, ArrowRight } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { format, startOfWeek, endOfWeek } from "date-fns";

interface WeeklyReviewProps {
  completedCount?: number;
  plannedCount?: number;
}

const WeeklyReview = ({ completedCount = 5, plannedCount = 8 }: WeeklyReviewProps = {}) => {
  const [helped, setHelped] = useState("");
  const [hindered, setHindered] = useState("");
  
  const weekStart = startOfWeek(new Date());
  const weekEnd = endOfWeek(new Date());
  const completionRate = Math.round((completedCount / plannedCount) * 100) || 0;

  return (
    <div className="min-h-screen flex flex-col px-6 py-8">
      <div className="flex items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Weekly Review</h1>
          <p className="text-muted-foreground text-sm">
            {format(weekStart, "MMM d")} - {format(weekEnd, "d, yyyy")}
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col max-w-lg mx-auto w-full">
        {/* Completion Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary/10 rounded-xl p-6 text-center mb-6"
        >
          <p className="text-4xl font-bold text-primary mb-1">{completionRate}%</p>
          <p className="text-sm text-muted-foreground">
            {completedCount} of {plannedCount} tasks completed
          </p>
        </motion.div>

        {/* What Helped */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-4"
        >
          <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
            <ThumbsUp className="w-4 h-4 text-green-500" />
            What helped?
          </label>
          <Textarea
            value={helped}
            onChange={(e) => setHelped(e.target.value)}
            placeholder="Share what went well..."
            className="min-h-[80px] resize-none"
          />
        </motion.div>

        {/* What Hindered */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
            <ThumbsDown className="w-4 h-4 text-amber-500" />
            What got in the way?
          </label>
          <Textarea
            value={hindered}
            onChange={(e) => setHindered(e.target.value)}
            placeholder="Be honest, no judgment..."
            className="min-h-[80px] resize-none"
          />
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-sm text-muted-foreground text-center italic flex-1"
        >
          "Progress over perfection. Every step counts."
        </motion.p>

        <Button size="lg" className="w-full h-14 text-lg font-semibold rounded-xl mt-8">
          Carry Insights Forward
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default WeeklyReview;
