import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Target, Briefcase, Dumbbell, Calendar, CalendarDays, CalendarRange, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

type Category = "personal" | "professional" | "fitness";
type Frequency = "daily" | "weekly" | "monthly";

interface SetGoalsFlowProps {
  onClose: () => void;
}

const categoryConfig = {
  personal: {
    label: "Personal",
    description: "Growth, relationships & self-care",
    icon: Target,
    gradient: "bg-gradient-to-br from-pink-500 to-rose-500",
    bgLight: "bg-pink-50 dark:bg-pink-950/30",
    borderColor: "border-pink-200 dark:border-pink-800",
  },
  professional: {
    label: "Professional",
    description: "Career, skills & achievements",
    icon: Briefcase,
    gradient: "bg-gradient-to-br from-emerald-500 to-green-500",
    bgLight: "bg-emerald-50 dark:bg-emerald-950/30",
    borderColor: "border-emerald-200 dark:border-emerald-800",
  },
  fitness: {
    label: "Fitness",
    description: "Health, exercise & nutrition",
    icon: Dumbbell,
    gradient: "bg-gradient-to-br from-amber-500 to-orange-500",
    bgLight: "bg-amber-50 dark:bg-amber-950/30",
    borderColor: "border-amber-200 dark:border-amber-800",
  },
};

const frequencyConfig = {
  daily: {
    label: "Daily",
    description: "Small steps every day",
    icon: Calendar,
    example: "e.g., Read for 30 minutes",
  },
  weekly: {
    label: "Weekly",
    description: "Milestone each week",
    icon: CalendarDays,
    example: "e.g., Complete project phase",
  },
  monthly: {
    label: "Monthly",
    description: "Big picture focus",
    icon: CalendarRange,
    example: "e.g., Launch new feature",
  },
};

const CategoryCard = ({
  category,
  selected,
  onClick,
  delay = 0,
}: {
  category: Category;
  selected: boolean;
  onClick: () => void;
  delay?: number;
}) => {
  const config = categoryConfig[category];
  const Icon = config.icon;

  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "relative w-full p-5 rounded-2xl text-left transition-all border-2",
        selected
          ? cn(config.gradient, "border-transparent text-white shadow-lg")
          : cn(config.bgLight, config.borderColor, "hover:shadow-md")
      )}
    >
      <div className="flex items-center gap-4">
        <div
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center",
            selected ? "bg-white/20" : config.gradient
          )}
        >
          <Icon className={cn("w-6 h-6", selected ? "text-white" : "text-white")} />
        </div>
        <div className="flex-1">
          <h3 className={cn("font-bold text-lg", !selected && "text-foreground")}>
            {config.label}
          </h3>
          <p className={cn("text-sm", selected ? "text-white/80" : "text-muted-foreground")}>
            {config.description}
          </p>
        </div>
        {selected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-6 h-6 rounded-full bg-white/30 flex items-center justify-center"
          >
            <Check className="w-4 h-4 text-white" />
          </motion.div>
        )}
      </div>
    </motion.button>
  );
};

const FrequencyCard = ({
  frequency,
  selected,
  onClick,
  delay = 0,
}: {
  frequency: Frequency;
  selected: boolean;
  onClick: () => void;
  delay?: number;
}) => {
  const config = frequencyConfig[frequency];
  const Icon = config.icon;

  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "relative w-full p-4 rounded-xl text-left transition-all border-2",
        selected
          ? "bg-primary border-primary text-primary-foreground shadow-md"
          : "bg-card border-border hover:border-primary/50"
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center",
            selected ? "bg-white/20" : "bg-primary/10"
          )}
        >
          <Icon className={cn("w-5 h-5", selected ? "text-white" : "text-primary")} />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold">{config.label}</h4>
          <p className={cn("text-xs", selected ? "text-white/80" : "text-muted-foreground")}>
            {config.description}
          </p>
        </div>
      </div>
    </motion.button>
  );
};

const SetGoalsFlow = ({ onClose }: SetGoalsFlowProps) => {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [category, setCategory] = useState<Category | null>(null);
  const [frequency, setFrequency] = useState<Frequency | null>(null);
  const [goalTitle, setGoalTitle] = useState("");
  const [goalDescription, setGoalDescription] = useState("");

  const handleCategorySelect = (cat: Category) => {
    setCategory(cat);
    setTimeout(() => setStep(2), 300);
  };

  const handleFrequencySelect = (freq: Frequency) => {
    setFrequency(freq);
    setTimeout(() => setStep(3), 300);
  };

  const handleSaveAndContinue = () => {
    // Navigate to the appropriate goal page based on category
    if (category) {
      navigate(`/addgoals/${category}`);
    }
  };

  const handleGoToDashboard = () => {
    onClose();
  };

  const goBack = () => {
    if (step === 2) setStep(1);
    else if (step === 3) setStep(2);
    else if (step === 4) setStep(3);
    else onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background"
    >
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="flex items-center gap-3 p-4 max-w-lg mx-auto">
          <Button variant="ghost" size="icon" onClick={goBack} className="rounded-xl">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="font-display font-bold">Set Goals</h1>
            <p className="text-xs text-muted-foreground">
              Step {step} of 3 — Design your intent
            </p>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="h-1 bg-muted">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: "0%" }}
            animate={{ width: `${(step / 3) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </header>

      {/* Content */}
      <main className="p-4 max-w-lg mx-auto">
        <AnimatePresence mode="wait">
          {/* Step 1: Category Selection */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2 py-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto"
                >
                  <Sparkles className="w-8 h-8 text-primary" />
                </motion.div>
                <h2 className="text-xl font-display font-bold">Choose a Category</h2>
                <p className="text-muted-foreground text-sm">
                  Which area of your life would you like to focus on?
                </p>
              </div>

              <div className="space-y-3">
                <CategoryCard
                  category="personal"
                  selected={category === "personal"}
                  onClick={() => handleCategorySelect("personal")}
                  delay={0.1}
                />
                <CategoryCard
                  category="professional"
                  selected={category === "professional"}
                  onClick={() => handleCategorySelect("professional")}
                  delay={0.2}
                />
                <CategoryCard
                  category="fitness"
                  selected={category === "fitness"}
                  onClick={() => handleCategorySelect("fitness")}
                  delay={0.3}
                />
              </div>
            </motion.div>
          )}

          {/* Step 2: Frequency Selection */}
          {step === 2 && category && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2 py-4">
                <div
                  className={cn(
                    "w-16 h-16 rounded-full flex items-center justify-center mx-auto",
                    categoryConfig[category].gradient
                  )}
                >
                  {(() => {
                    const Icon = categoryConfig[category].icon;
                    return <Icon className="w-8 h-8 text-white" />;
                  })()}
                </div>
                <h2 className="text-xl font-display font-bold">
                  {categoryConfig[category].label} Goals
                </h2>
                <p className="text-muted-foreground text-sm">
                  How often do you want to check in on this goal?
                </p>
              </div>

              <div className="space-y-3">
                <FrequencyCard
                  frequency="daily"
                  selected={frequency === "daily"}
                  onClick={() => handleFrequencySelect("daily")}
                  delay={0.1}
                />
                <FrequencyCard
                  frequency="weekly"
                  selected={frequency === "weekly"}
                  onClick={() => handleFrequencySelect("weekly")}
                  delay={0.2}
                />
                <FrequencyCard
                  frequency="monthly"
                  selected={frequency === "monthly"}
                  onClick={() => handleFrequencySelect("monthly")}
                  delay={0.3}
                />
              </div>
            </motion.div>
          )}

          {/* Step 3: Goal Input */}
          {step === 3 && category && frequency && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2 py-4">
                <motion.div
                  initial={{ scale: 0, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto"
                >
                  <Target className="w-8 h-8 text-primary" />
                </motion.div>
                <h2 className="text-xl font-display font-bold">Define Your Goal</h2>
                <p className="text-muted-foreground text-sm">
                  {frequencyConfig[frequency].example}
                </p>
              </div>

              <div className="space-y-4 bg-card border border-border rounded-2xl p-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Goal Title</label>
                  <Input
                    value={goalTitle}
                    onChange={(e) => setGoalTitle(e.target.value)}
                    placeholder="What do you want to achieve?"
                    className="rounded-xl h-12"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Description <span className="text-muted-foreground">(optional)</span>
                  </label>
                  <Textarea
                    value={goalDescription}
                    onChange={(e) => setGoalDescription(e.target.value)}
                    placeholder="Why is this goal important to you?"
                    className="rounded-xl min-h-[100px] resize-none"
                  />
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="pt-2"
                >
                  <Button
                    onClick={handleSaveAndContinue}
                    className="w-full h-12 rounded-xl font-semibold"
                    disabled={!goalTitle.trim()}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Save & Continue
                  </Button>
                </motion.div>
              </div>

              {/* Motivational message */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-center text-sm text-muted-foreground italic"
              >
                "A goal properly set is halfway reached." — Zig Ziglar
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </motion.div>
  );
};

export default SetGoalsFlow;
