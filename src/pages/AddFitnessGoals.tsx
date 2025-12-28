import { useState, useEffect, useMemo } from "react";
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
  Check,
  Calendar,
  Loader2,
  Timer,
  Flame
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

type MealType = "breakfast" | "lunch" | "dinner" | "snack";
type ExerciseType = "strength" | "cardio" | "flexibility";

interface ExerciseClassification {
  type: ExerciseType;
  requiresSets: boolean;
  requiresReps: boolean;
  requiresDuration: boolean;
  suggestedCaloriesPerMinute: number;
}

interface Exercise {
  id: string;
  name: string;
  type: ExerciseType;
  duration?: number;
  sets?: number;
  reps?: number;
  caloriesBurned?: number;
}

interface FoodItem {
  id: string;
  name: string;
  calories?: number;
  mealType: MealType;
}

interface PendingExercise {
  name: string;
  classification: ExerciseClassification;
  sets?: number;
  reps?: number;
  duration?: number;
  caloriesBurned?: number;
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

// Comprehensive exercise database for autocomplete
const exerciseDatabase = [
  // Strength
  { name: "Bicep Curl", type: "strength" },
  { name: "Tricep Dip", type: "strength" },
  { name: "Bench Press", type: "strength" },
  { name: "Shoulder Press", type: "strength" },
  { name: "Deadlift", type: "strength" },
  { name: "Squat", type: "strength" },
  { name: "Lunges", type: "strength" },
  { name: "Leg Press", type: "strength" },
  { name: "Pull-ups", type: "strength" },
  { name: "Push-ups", type: "strength" },
  { name: "Lat Pulldown", type: "strength" },
  { name: "Rows", type: "strength" },
  { name: "Chest Fly", type: "strength" },
  { name: "Calf Raises", type: "strength" },
  { name: "Plank", type: "strength" },
  // Cardio
  { name: "Running", type: "cardio" },
  { name: "Walking", type: "cardio" },
  { name: "Cycling", type: "cardio" },
  { name: "Swimming", type: "cardio" },
  { name: "Jump Rope", type: "cardio" },
  { name: "Jumping Jacks", type: "cardio" },
  { name: "Burpees", type: "cardio" },
  { name: "Stair Climbing", type: "cardio" },
  { name: "Rowing", type: "cardio" },
  { name: "HIIT", type: "cardio" },
  { name: "Elliptical", type: "cardio" },
  { name: "Boxing", type: "cardio" },
  // Flexibility
  { name: "Yoga", type: "flexibility" },
  { name: "Pilates", type: "flexibility" },
  { name: "Stretching", type: "flexibility" },
  { name: "Tai Chi", type: "flexibility" },
  { name: "Foam Rolling", type: "flexibility" },
];

// Comprehensive food database for autocomplete
const foodDatabase = [
  { name: "Oatmeal", calories: 150 },
  { name: "Eggs", calories: 140 },
  { name: "Chicken Breast", calories: 165 },
  { name: "Salmon", calories: 200 },
  { name: "Salad", calories: 100 },
  { name: "Rice", calories: 200 },
  { name: "Brown Rice", calories: 215 },
  { name: "Quinoa", calories: 220 },
  { name: "Banana", calories: 105 },
  { name: "Apple", calories: 95 },
  { name: "Orange", calories: 62 },
  { name: "Greek Yogurt", calories: 120 },
  { name: "Almonds", calories: 160 },
  { name: "Avocado", calories: 240 },
  { name: "Sweet Potato", calories: 103 },
  { name: "Broccoli", calories: 55 },
  { name: "Spinach", calories: 23 },
  { name: "Tofu", calories: 144 },
  { name: "Protein Shake", calories: 200 },
  { name: "Whole Wheat Bread", calories: 80 },
  { name: "Pasta", calories: 220 },
  { name: "Steak", calories: 271 },
  { name: "Turkey", calories: 135 },
  { name: "Cottage Cheese", calories: 98 },
  { name: "Milk", calories: 103 },
  { name: "Smoothie", calories: 180 },
];

const AddFitnessGoals = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [exerciseInput, setExerciseInput] = useState("");
  const [foodSearch, setFoodSearch] = useState("");
  const [activeMeal, setActiveMeal] = useState<MealType | null>(null);
  const [isClassifying, setIsClassifying] = useState(false);
  const [pendingExercise, setPendingExercise] = useState<PendingExercise | null>(null);
  const [showExerciseSuggestions, setShowExerciseSuggestions] = useState(false);

  // Filter exercises for autocomplete
  const filteredExercises = useMemo(() => {
    if (!exerciseInput.trim()) return [];
    const query = exerciseInput.toLowerCase();
    return exerciseDatabase.filter(e => 
      e.name.toLowerCase().includes(query)
    ).slice(0, 6);
  }, [exerciseInput]);

  // Filter foods for autocomplete
  const filteredFoods = useMemo(() => {
    if (!foodSearch.trim()) return foodDatabase.slice(0, 4);
    const query = foodSearch.toLowerCase();
    return foodDatabase.filter(f => 
      f.name.toLowerCase().includes(query)
    ).slice(0, 6);
  }, [foodSearch]);

  const classifyExercise = async (name: string) => {
    setIsClassifying(true);
    try {
      const { data, error } = await supabase.functions.invoke('classify-exercise', {
        body: { exerciseName: name }
      });

      if (error) throw error;

      const classification = data as ExerciseClassification;
      setPendingExercise({
        name,
        classification,
        sets: classification.requiresSets ? 3 : undefined,
        reps: classification.requiresReps ? 10 : undefined,
        duration: classification.requiresDuration ? 30 : undefined,
        caloriesBurned: classification.suggestedCaloriesPerMinute * 30,
      });
    } catch (error) {
      console.error("Failed to classify exercise:", error);
      // Default to cardio if classification fails
      setPendingExercise({
        name,
        classification: {
          type: "cardio",
          requiresSets: false,
          requiresReps: false,
          requiresDuration: true,
          suggestedCaloriesPerMinute: 5,
        },
        duration: 30,
        caloriesBurned: 150,
      });
    } finally {
      setIsClassifying(false);
      setExerciseInput("");
      setShowExerciseSuggestions(false);
    }
  };

  const handleExerciseSubmit = (name: string) => {
    if (!name.trim()) return;
    classifyExercise(name.trim());
  };

  const confirmExercise = () => {
    if (!pendingExercise) return;
    
    const newExercise: Exercise = {
      id: Date.now().toString(),
      name: pendingExercise.name,
      type: pendingExercise.classification.type,
      sets: pendingExercise.sets,
      reps: pendingExercise.reps,
      duration: pendingExercise.duration,
      caloriesBurned: pendingExercise.caloriesBurned,
    };
    
    setExercises([...exercises, newExercise]);
    setPendingExercise(null);
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

  const getFoodsForMeal = (mealType: MealType) => {
    return foods.filter(f => f.mealType === mealType);
  };

  const getExerciseTypeColor = (type: ExerciseType) => {
    switch (type) {
      case "strength": return { bg: "bg-purple-50", border: "border-purple-200", icon: "text-purple-600" };
      case "cardio": return { bg: "bg-red-50", border: "border-red-200", icon: "text-red-600" };
      case "flexibility": return { bg: "bg-blue-50", border: "border-blue-200", icon: "text-blue-600" };
    }
  };

  const getExerciseTypeLabel = (type: ExerciseType) => {
    switch (type) {
      case "strength": return "Strength";
      case "cardio": return "Cardio";
      case "flexibility": return "Flexibility";
    }
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
          <h1 className="text-xl font-bold text-foreground flex-1">Fitness Goals</h1>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6 pb-24 max-w-lg mx-auto">
        {/* Date Picker */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Popover>
            <PopoverTrigger asChild>
              <button className="w-full flex items-center gap-3 bg-card border border-border rounded-2xl p-4 hover:bg-muted/50 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-xs text-muted-foreground">Tracking for</p>
                  <p className="font-semibold text-foreground">{format(selectedDate, "EEEE, MMM d, yyyy")}</p>
                </div>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </motion.section>

        {/* Exercise Tracking Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Exercise Tracking</h2>
          </div>

          {/* Add Exercise Input with Autocomplete */}
          <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
            <div className="relative">
              <div className="flex gap-2">
                <Input
                  value={exerciseInput}
                  onChange={(e) => {
                    setExerciseInput(e.target.value);
                    setShowExerciseSuggestions(true);
                  }}
                  onFocus={() => setShowExerciseSuggestions(true)}
                  placeholder="Add exercise (e.g., Bicep Curl)..."
                  onKeyDown={(e) => e.key === "Enter" && handleExerciseSubmit(exerciseInput)}
                  className="flex-1 h-12 rounded-xl border-0 bg-muted text-base"
                  disabled={isClassifying}
                />
                <Button
                  onClick={() => handleExerciseSubmit(exerciseInput)}
                  size="icon"
                  className="h-12 w-12 rounded-xl shrink-0"
                  disabled={!exerciseInput.trim() || isClassifying}
                >
                  {isClassifying ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Plus className="w-5 h-5" />
                  )}
                </Button>
              </div>

              {/* Autocomplete Dropdown */}
              <AnimatePresence>
                {showExerciseSuggestions && filteredExercises.length > 0 && exerciseInput.trim() && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-20"
                  >
                    {filteredExercises.map((exercise) => {
                      const colors = getExerciseTypeColor(exercise.type as ExerciseType);
                      return (
                        <button
                          key={exercise.name}
                          onClick={() => handleExerciseSubmit(exercise.name)}
                          className="w-full flex items-center gap-3 p-3 hover:bg-muted transition-colors text-left"
                        >
                          <span className="flex-1 font-medium text-foreground">{exercise.name}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs ${colors.bg} ${colors.icon}`}>
                            {getExerciseTypeLabel(exercise.type as ExerciseType)}
                          </span>
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Quick Add */}
            <div className="flex flex-wrap gap-2">
              {exerciseDatabase.slice(0, 5).map((exercise) => (
                <motion.button
                  key={exercise.name}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleExerciseSubmit(exercise.name)}
                  className="px-3 py-1.5 bg-muted hover:bg-muted/80 rounded-full text-sm font-medium text-foreground transition-colors"
                  disabled={isClassifying}
                >
                  + {exercise.name}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Pending Exercise Form */}
          <AnimatePresence>
            {pendingExercise && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`border rounded-2xl p-4 space-y-4 ${getExerciseTypeColor(pendingExercise.classification.type).bg} ${getExerciseTypeColor(pendingExercise.classification.type).border}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">{pendingExercise.name}</h3>
                    <span className={`text-xs ${getExerciseTypeColor(pendingExercise.classification.type).icon}`}>
                      {getExerciseTypeLabel(pendingExercise.classification.type)}
                    </span>
                  </div>
                  <button
                    onClick={() => setPendingExercise(null)}
                    className="p-1.5 hover:bg-white/50 rounded-lg"
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {pendingExercise.classification.requiresSets && (
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">Sets</label>
                      <Input
                        type="number"
                        value={pendingExercise.sets || ""}
                        onChange={(e) => setPendingExercise({
                          ...pendingExercise,
                          sets: parseInt(e.target.value) || undefined
                        })}
                        className="h-11 rounded-xl bg-white border-0"
                        min={1}
                      />
                    </div>
                  )}
                  {pendingExercise.classification.requiresReps && (
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">Reps</label>
                      <Input
                        type="number"
                        value={pendingExercise.reps || ""}
                        onChange={(e) => setPendingExercise({
                          ...pendingExercise,
                          reps: parseInt(e.target.value) || undefined
                        })}
                        className="h-11 rounded-xl bg-white border-0"
                        min={1}
                      />
                    </div>
                  )}
                  {pendingExercise.classification.requiresDuration && (
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                        <Timer className="w-3 h-3" /> Duration (min)
                      </label>
                      <Input
                        type="number"
                        value={pendingExercise.duration || ""}
                        onChange={(e) => {
                          const duration = parseInt(e.target.value) || 0;
                          setPendingExercise({
                            ...pendingExercise,
                            duration,
                            caloriesBurned: duration * pendingExercise.classification.suggestedCaloriesPerMinute
                          });
                        }}
                        className="h-11 rounded-xl bg-white border-0"
                        min={1}
                      />
                    </div>
                  )}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                      <Flame className="w-3 h-3" /> Calories Burned
                    </label>
                    <Input
                      type="number"
                      value={pendingExercise.caloriesBurned || ""}
                      onChange={(e) => setPendingExercise({
                        ...pendingExercise,
                        caloriesBurned: parseInt(e.target.value) || undefined
                      })}
                      className="h-11 rounded-xl bg-white border-0"
                      min={0}
                    />
                  </div>
                </div>

                <Button
                  onClick={confirmExercise}
                  className="w-full h-11 rounded-xl"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Add Exercise
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Exercise List */}
          <AnimatePresence>
            {exercises.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-2"
              >
                {exercises.map((exercise) => {
                  const colors = getExerciseTypeColor(exercise.type);
                  return (
                    <motion.div
                      key={exercise.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className={`flex items-center gap-3 ${colors.bg} ${colors.border} border rounded-xl p-3`}
                    >
                      <div className={`w-8 h-8 rounded-lg bg-background flex items-center justify-center`}>
                        <Check className={`w-4 h-4 ${colors.icon}`} />
                      </div>
                      <div className="flex-1">
                        <span className="font-medium text-foreground">{exercise.name}</span>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {exercise.sets && exercise.reps && (
                            <span>{exercise.sets}×{exercise.reps}</span>
                          )}
                          {exercise.duration && (
                            <span>{exercise.duration} min</span>
                          )}
                          {exercise.caloriesBurned && (
                            <span className="flex items-center gap-0.5">
                              <Flame className="w-3 h-3" />
                              {exercise.caloriesBurned} cal
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => removeExercise(exercise.id)}
                        className="p-1.5 hover:bg-white/50 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>

        {/* Food Tracking Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
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

                          {/* Food Suggestions with Autocomplete */}
                          <div className="space-y-1 max-h-40 overflow-y-auto">
                            {filteredFoods.map((food) => (
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
                            {foodSearch && !filteredFoods.some(f => f.name.toLowerCase() === foodSearch.toLowerCase()) && (
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
            <h3 className="font-semibold text-foreground">
              {format(selectedDate, "MMM d")} Summary
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-emerald-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-emerald-600">{exercises.length}</p>
                <p className="text-xs text-muted-foreground">Exercises</p>
              </div>
              <div className="bg-red-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-red-600">
                  {exercises.reduce((acc, e) => acc + (e.caloriesBurned || 0), 0)}
                </p>
                <p className="text-xs text-muted-foreground">Burned</p>
              </div>
              <div className="bg-amber-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-amber-600">
                  {foods.reduce((acc, f) => acc + (f.calories || 0), 0)}
                </p>
                <p className="text-xs text-muted-foreground">Eaten</p>
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
