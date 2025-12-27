import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Trophy, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const goals = [
  { title: "Exercise 4x a Week", progress: 90 },
  { title: "Finish Project Proposal", progress: 66 },
  { title: "Read 20 Pages Daily", progress: 66 },
];

const DemoSection = () => {
  return (
    <section className="py-24 bg-gradient-to-b from-background to-secondary/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-sm font-medium text-muted-foreground tracking-wide uppercase mb-4 block">
            Track Everything
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold mb-4">
            Your Goals, <span className="gradient-text">Your Journey.</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            All in one powerful app designed to keep you motivated and on track.
          </p>
        </motion.div>

        {/* Demo Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Goals Overview Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-card rounded-3xl p-6 shadow-card border border-border/50"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display font-semibold text-lg">Your Goals Overview</h3>
              <span className="text-xs text-muted-foreground bg-secondary px-3 py-1 rounded-full">
                This week's progress
              </span>
            </div>
            <div className="space-y-5">
              {goals.map((goal, index) => (
                <motion.div
                  key={goal.title}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{goal.title}</span>
                    <span className="text-sm text-muted-foreground">{goal.progress}%</span>
                  </div>
                  <Progress value={goal.progress} className="h-2" />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Achievement Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-card rounded-3xl p-6 shadow-card border border-border/50 flex flex-col justify-between"
          >
            <div>
              <span className="text-xs text-muted-foreground bg-secondary px-3 py-1 rounded-full">
                Achievement Unlocked
              </span>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center py-8">
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                className="w-20 h-20 bg-brand-yellow/20 rounded-full flex items-center justify-center mb-4"
              >
                <Trophy className="w-10 h-10 text-brand-orange" />
              </motion.div>
              <h3 className="text-xl font-display font-bold mb-2">Goal Completed!</h3>
              <p className="text-muted-foreground text-center mb-6">
                You Finished Your Weekly Workouts!
              </p>
              <Button variant="outline" size="sm" className="gap-2 rounded-full">
                <Share2 className="w-4 h-4" />
                Share Victory
              </Button>
            </div>
          </motion.div>
        </div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12"
        >
          <Button asChild size="lg" variant="outline" className="rounded-full px-8">
            <Link to="/auth?mode=signup">Sign Up Free</Link>
          </Button>
          <Button asChild size="lg" className="rounded-full px-8 gap-2">
            <Link to="/auth?mode=signup">
              Get Started Free
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default DemoSection;
