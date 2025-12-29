import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Heart, Briefcase, Dumbbell, Check } from "lucide-react";
import { QuarterlyCategory } from "@/pages/QuarterlyPlanning";
import { cn } from "@/lib/utils";

interface QuarterlyCategoriesProps {
  selectedCategories: QuarterlyCategory[];
  onCategoriesChange: (categories: QuarterlyCategory[]) => void;
  onNext: () => void;
  onBack: () => void;
}

const categories: {
  id: QuarterlyCategory;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  gradient: string;
  shadowColor: string;
}[] = [
  {
    id: "personal",
    title: "Personal Growth",
    subtitle: "Relationships, mindset, hobbies",
    icon: Heart,
    gradient: "from-rose-500 to-pink-600",
    shadowColor: "shadow-rose-500/30",
  },
  {
    id: "professional",
    title: "Career Goals",
    subtitle: "Work, skills, achievements",
    icon: Briefcase,
    gradient: "from-blue-500 to-indigo-600",
    shadowColor: "shadow-blue-500/30",
  },
  {
    id: "fitness",
    title: "Fitness & Health",
    subtitle: "Exercise, nutrition, wellness",
    icon: Dumbbell,
    gradient: "from-emerald-500 to-teal-600",
    shadowColor: "shadow-emerald-500/30",
  },
];

const QuarterlyCategories = ({
  selectedCategories,
  onCategoriesChange,
  onNext,
  onBack,
}: QuarterlyCategoriesProps) => {
  const toggleCategory = (category: QuarterlyCategory) => {
    if (selectedCategories.includes(category)) {
      onCategoriesChange(selectedCategories.filter((c) => c !== category));
    } else if (selectedCategories.length < 3) {
      onCategoriesChange([...selectedCategories, category]);
    }
  };

  const canContinue = selectedCategories.length >= 1;

  return (
    <div className="min-h-screen flex flex-col px-6 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Choose Your Focus</h1>
          <p className="text-muted-foreground text-sm">Step 2 of 5</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center max-w-lg mx-auto w-full">
        {/* Instruction */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-muted-foreground mb-8"
        >
          Select 1-3 areas to focus on this quarter
        </motion.p>

        {/* Category Cards */}
        <div className="grid grid-cols-3 gap-4 w-full mb-12">
          {categories.map((category, index) => {
            const isSelected = selectedCategories.includes(category.id);
            const Icon = category.icon;

            return (
              <motion.button
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => toggleCategory(category.id)}
                className={cn(
                  "relative flex flex-col items-center p-4 rounded-2xl transition-all duration-300",
                  "aspect-square",
                  isSelected
                    ? `bg-gradient-to-br ${category.gradient} text-white shadow-lg ${category.shadowColor}`
                    : "bg-muted/50 hover:bg-muted text-foreground"
                )}
              >
                {/* Selection indicator */}
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center"
                  >
                    <Check className="w-4 h-4 text-primary" />
                  </motion.div>
                )}

                <div
                  className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center mb-3",
                    isSelected ? "bg-white/20" : "bg-background"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-6 h-6",
                      isSelected ? "text-white" : "text-muted-foreground"
                    )}
                  />
                </div>

                <span className="text-xs font-semibold text-center leading-tight">
                  {category.title}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Selected Summary */}
        {selectedCategories.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-sm text-muted-foreground mb-8"
          >
            {selectedCategories.length} area{selectedCategories.length > 1 ? "s" : ""}{" "}
            selected
          </motion.div>
        )}

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="w-full pb-8"
        >
          <Button
            onClick={onNext}
            disabled={!canContinue}
            size="lg"
            className="w-full h-14 text-lg font-semibold rounded-xl disabled:opacity-50"
          >
            Continue
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default QuarterlyCategories;
