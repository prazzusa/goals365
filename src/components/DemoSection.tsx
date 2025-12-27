import { motion } from "framer-motion";
import { Share2, Settings, Dumbbell, FolderOpen, BookOpen, Trophy, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const goals = [
  {
    icon: Dumbbell,
    title: "Exercise 4× a Week",
    progress: 90,
    color: "bg-blue-500",
    iconBg: "bg-blue-500",
  },
  {
    icon: FolderOpen,
    title: "Finish Project Proposal",
    progress: 66,
    color: "bg-brand-pink",
    iconBg: "bg-brand-pink",
  },
  {
    icon: BookOpen,
    title: "Read 20 Pages Daily",
    progress: 66,
    color: "bg-emerald-500",
    iconBg: "bg-emerald-500",
  },
];

const DemoSection = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Goals Overview Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-card rounded-3xl p-8 shadow-card border border-border/50"
          >
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-display font-bold">Your Goals Overview</h2>
              <div className="flex items-center gap-3">
                <button className="text-muted-foreground hover:text-foreground transition-colors">
                  <Share2 className="w-5 h-5" />
                </button>
                <button className="text-muted-foreground hover:text-foreground transition-colors">
                  <Settings className="w-5 h-5" />
                </button>
              </div>
            </div>
            <p className="text-muted-foreground mb-8">This week's progress</p>
            
            <div className="space-y-4">
              {goals.map((goal, index) => (
                <motion.div
                  key={goal.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                  className="bg-muted/50 rounded-2xl p-5 flex items-center gap-4"
                >
                  <div className={`w-12 h-12 ${goal.iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <goal.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold mb-2">{goal.title}</h3>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${goal.color}`}
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-semibold">{goal.progress}%</span>
                    <div className="w-10 h-10 rounded-full border-2 border-border flex items-center justify-center">
                      <svg className="w-8 h-8 -rotate-90" viewBox="0 0 36 36">
                        <circle
                          cx="18"
                          cy="18"
                          r="14"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          className="text-muted"
                        />
                        <circle
                          cx="18"
                          cy="18"
                          r="14"
                          fill="none"
                          stroke={goal.color === 'bg-blue-500' ? '#3b82f6' : goal.color === 'bg-brand-pink' ? '#ec4899' : '#10b981'}
                          strokeWidth="3"
                          strokeDasharray={`${goal.progress * 0.88} 100`}
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                  </div>
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
            className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-8 shadow-card relative overflow-hidden"
          >
            {/* Decorative dots */}
            <div className="absolute top-6 left-8 w-3 h-3 rounded-full bg-brand-coral" />
            <div className="absolute top-6 right-1/3 w-3 h-3 rounded-full bg-blue-500" />
            <div className="absolute top-6 right-8 w-3 h-3 rounded-full bg-emerald-500" />
            <div className="absolute bottom-1/4 right-6 w-3 h-3 rounded-full bg-brand-orange" />
            <div className="absolute top-1/3 left-6 w-3 h-3 rounded-full bg-brand-pink" />
            
            {/* Geometric shapes */}
            <div className="absolute bottom-0 left-1/4 w-40 h-40 bg-slate-700/30 rotate-45 transform translate-y-20" />
            <div className="absolute bottom-0 right-1/4 w-32 h-32 bg-slate-700/20 rotate-12 transform translate-y-10" />
            
            <div className="relative z-10 flex flex-col items-center justify-center h-full min-h-[400px]">
              {/* Trophy icon */}
              <div className="relative mb-6">
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-brand-pink rounded-lg" />
                <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-purple-500 rounded-md" />
                <div className="w-28 h-28 bg-gradient-to-br from-brand-yellow to-brand-orange rounded-2xl flex items-center justify-center shadow-lg">
                  <Trophy className="w-14 h-14 text-white" />
                </div>
              </div>
              
              {/* Achievement badge */}
              <div className="flex items-center gap-2 px-5 py-2.5 bg-slate-700/50 rounded-full border border-brand-yellow/30 mb-6">
                <Sparkles className="w-4 h-4 text-brand-yellow" />
                <span className="text-brand-yellow font-medium">Achievement Unlocked</span>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-2 text-center">
                Goal Completed!
              </h2>
              <p className="text-slate-400 text-lg mb-8 text-center">
                You Finished Your Weekly Workouts!
              </p>
              
              <Button 
                size="lg" 
                className="bg-brand-orange hover:bg-brand-orange/90 text-white px-8 py-6 text-lg rounded-full shadow-lg"
              >
                Share Victory
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default DemoSection;
