import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Search, 
  Dumbbell, 
  Apple, 
  Coffee, 
  Sun, 
  Moon, 
  X,
  ChevronLeft,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";

type MealType = "breakfast" | "lunch" | "dinner" | "snack";

interface Exercise {
  id: string;
  name: string;
  duration?: string;
  sets?: number;
  reps?: number;
}

interface FoodItem {
  id: string;
  name: string;
  calories?: number;
  mealType: MealType;
}

const mealConfig: Record<MealType, { label: string; icon: typeof Coffee; bgColor: string; borderColor: string }> = {
  breakfast: { 
    label: "Breakfast", 
    icon: Coffee, 
    bgColor: "bg-amber-50", 
    borderColor: "border-amber-200" 
  },
  lunch: { 
    label: "Lunch", 
    icon: Sun, 
    bgColor: "bg-emerald-50", 
    borderColor: "border-emerald-200" 
  },
  dinner: { 
    label: "Dinner", 
    icon: Moon, 
    bgColor: "bg-indigo-50", 
    borderColor: "border-indigo-200" 
  },
  snack: { 
    label: "Snack", 
    icon: Apple, 
    bgColor: "bg-pink-50", 
    borderColor: "border-pink-200" 
  },
};

const suggestedExercises = [
  "Walking", "Running", "Push-ups", "Squats", "Yoga", 
  "Swimming", "Cycling", "Plank", "Jumping Jacks", "Stretching"
];

const suggestedFoods = [
  { name: "Oatmeal", calories: 150 },
  { name: "Eggs", calories: 140 },
  { name: "Chicken Breast", calories: 165 },
  { name: "Salad", calories: 100 },
  { name: "Rice", calories: 200 },
  { name: "Banana", calories: 105 },
  { name: "Apple", calories: 95 },
  { name: "Greek Yogurt", calories: 120 },
];

const AddFitnessGoals = () => {
  const navigate = useNavigate();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [exerciseInput, setExerciseInput] = useState("");
  const [foodSearch, setFoodSearch] = useState("");
  const [activeMeal, setActiveMeal] = useState<MealType | null>(null);

  const addExercise = (name: string) => {
    if (!name.trim()) return;
    const newExercise: Exercise = {
      id: Date.now().toString(),
      name: name.trim(),
    };
    setExercises([...exercises, newExercise]);
    setExerciseInput("");
  };

  const removeExercise = (id: string) => {
    setExercises(exercises.filter(e => e.id !== id));
  };

  const addFood = (name: string, mealType: MealType, calories?: number) => {
    const newFood: FoodItem = {
      id: Date.now().toString(),
      name,
      calories,
      mealType,
    };
    setFoods([...foods, newFood]);
    setFoodSearch("");
    setActiveMeal(null);
  };

  const removeFood = (id: string) => {
    setFoods(foods.filter(f => f.id !== id));
  };

  const filteredSuggestions = suggestedFoods.filter(f => 
    f.name.toLowerCase().includes(foodSearch.toLowerCase())
  );

  const getFoodsForMeal = (mealType: MealType) => {
    return foods.filter(f => f.mealType === mealType);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-muted rounded-xl transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-xl font-bold text-foreground">Fitness Goals</h1>
        </div>
      </div>

      <div className="px-4 py-6 space-y-8 pb-24 max-w-lg mx-auto">
        {/* Exercise Tracking Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Exercise Tracking</h2>
          </div>

          {/* Add Exercise Input */}
          <div className="bg-card border border-border rounded-2xl p-4 space-y-4">
            <div className="flex gap-2">
              <Input
                value={exerciseInput}
                onChange={(e) => setExerciseInput(e.target.value)}
                placeholder="Add exercise..."
                onKeyDown={(e) => e.key === "Enter" && addExercise(exerciseInput)}
                className="flex-1 h-12 rounded-xl border-0 bg-muted text-base"
              />
              <Button
                onClick={() => addExercise(exerciseInput)}
                size="icon"
                className="h-12 w-12 rounded-xl shrink-0"
                disabled={!exerciseInput.trim()}
              >
                <Plus className="w-5 h-5" />
              </Button>
            </div>

            {/* Quick Add Suggestions */}
            <div className="flex flex-wrap gap-2">
              {suggestedExercises.slice(0, 5).map((exercise) => (
                <motion.button
                  key={exercise}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => addExercise(exercise)}
                  className="px-3 py-1.5 bg-muted hover:bg-muted/80 rounded-full text-sm font-medium text-foreground transition-colors"
                >
                  + {exercise}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Exercise List */}
          <AnimatePresence>
            {exercises.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-2"
              >
                {exercises.map((exercise) => (
                  <motion.div
                    key={exercise.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-3"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <span className="flex-1 font-medium text-foreground">{exercise.name}</span>
                    <button
                      onClick={() => removeExercise(exercise.id)}
                      className="p-1.5 hover:bg-emerald-100 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>

        {/* Food Tracking Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <Apple className="w-5 h-5 text-amber-600" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Food Tracking</h2>
          </div>

          {/* Meal Categories */}
          <div className="space-y-3">
            {(Object.keys(mealConfig) as MealType[]).map((mealType) => {
              const config = mealConfig[mealType];
              const mealFoods = getFoodsForMeal(mealType);
              const Icon = config.icon;

              return (
                <motion.div
                  key={mealType}
                  layout
                  className={`${config.bgColor} ${config.borderColor} border rounded-2xl overflow-hidden`}
                >
                  {/* Meal Header */}
                  <button
                    onClick={() => setActiveMeal(activeMeal === mealType ? null : mealType)}
                    className="w-full flex items-center gap-3 p-4"
                  >
                    <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center">
                      <Icon className="w-5 h-5 text-foreground" />
                    </div>
                    <span className="flex-1 text-left font-semibold text-foreground">
                      {config.label}
                    </span>
                    {mealFoods.length > 0 && (
                      <span className="px-2 py-1 bg-background rounded-lg text-xs font-medium text-muted-foreground">
                        {mealFoods.length} items
                      </span>
                    )}
                    <Plus className={`w-5 h-5 text-muted-foreground transition-transform ${activeMeal === mealType ? "rotate-45" : ""}`} />
                  </button>

                  {/* Meal Foods */}
                  <AnimatePresence>
                    {mealFoods.length > 0 && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        className="px-4 pb-2 space-y-2"
                      >
                        {mealFoods.map((food) => (
                          <div
                            key={food.id}
                            className="flex items-center gap-2 bg-background rounded-lg px-3 py-2"
                          >
                            <span className="flex-1 text-sm font-medium text-foreground">{food.name}</span>
                            {food.calories && (
                              <span className="text-xs text-muted-foreground">{food.calories} cal</span>
                            )}
                            <button
                              onClick={() => removeFood(food.id)}
                              className="p-1 hover:bg-muted rounded transition-colors"
                            >
                              <X className="w-3 h-3 text-muted-foreground" />
                            </button>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Add Food Panel */}
                  <AnimatePresence>
                    {activeMeal === mealType && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 space-y-3">
                          {/* Search Input */}
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              value={foodSearch}
                              onChange={(e) => setFoodSearch(e.target.value)}
                              placeholder="Search or add food..."
                              className="pl-10 h-11 rounded-xl border-0 bg-background text-base"
                            />
                          </div>

                          {/* Food Suggestions */}
                          <div className="space-y-1 max-h-40 overflow-y-auto">
                            {(foodSearch ? filteredSuggestions : suggestedFoods.slice(0, 4)).map((food) => (
                              <motion.button
                                key={food.name}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => addFood(food.name, mealType, food.calories)}
                                className="w-full flex items-center gap-3 p-2 hover:bg-background/50 rounded-lg transition-colors text-left"
                              >
                                <Plus className="w-4 h-4 text-primary" />
                                <span className="flex-1 text-sm font-medium text-foreground">{food.name}</span>
                                <span className="text-xs text-muted-foreground">{food.calories} cal</span>
                              </motion.button>
                            ))}
                            {foodSearch && !filteredSuggestions.some(f => f.name.toLowerCase() === foodSearch.toLowerCase()) && (
                              <motion.button
                                whileTap={{ scale: 0.98 }}
                                onClick={() => addFood(foodSearch, mealType)}
                                className="w-full flex items-center gap-3 p-2 hover:bg-background/50 rounded-lg transition-colors text-left"
                              >
                                <Plus className="w-4 h-4 text-primary" />
                                <span className="flex-1 text-sm font-medium text-foreground">Add "{foodSearch}"</span>
                              </motion.button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* Summary */}
        {(exercises.length > 0 || foods.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-2xl p-5 space-y-3"
          >
            <h3 className="font-semibold text-foreground">Today's Summary</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-emerald-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-emerald-600">{exercises.length}</p>
                <p className="text-xs text-muted-foreground">Exercises</p>
              </div>
              <div className="bg-amber-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-amber-600">
                  {foods.reduce((acc, f) => acc + (f.calories || 0), 0)}
                </p>
                <p className="text-xs text-muted-foreground">Calories</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Save Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-sm border-t border-border">
        <Button
          onClick={() => navigate("/goals?dashboard=true")}
          className="w-full h-14 rounded-2xl text-lg font-semibold max-w-lg mx-auto block"
        >
          Save & Continue
        </Button>
      </div>
    </div>
  );
};

export default AddFitnessGoals;
