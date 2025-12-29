import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Briefcase, 
  X,
  ChevronLeft,
  Calendar,
  Loader2,
  Trash2,
  Pencil,
  Check,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface ProfessionalGoal {
  id: string;
  title: string;
  completed: boolean;
  isEditing?: boolean;
}

// Professional goal suggestions
const goalSuggestions = [
  "Complete project milestone",
  "Attend team meeting",
  "Review and respond to emails",
  "Learn a new skill",
  "Network with a colleague",
  "Update resume/portfolio",
  "Work on presentation",
  "Schedule important calls",
  "Organize workspace",
  "Set weekly priorities",
  "Document progress",
  "Prepare for interview",
];

const AddProfessionalGoals = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [goals, setGoals] = useState<ProfessionalGoal[]>([]);
  const [goalInput, setGoalInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editingValue, setEditingValue] = useState("");

  // Load existing goals for selected date
  const loadGoalsForDate = useCallback(async (date: Date) => {
    if (!user) return;
    
    setIsLoading(true);
    const dateStr = format(date, "yyyy-MM-dd");
    
    try {
      const { data, error } = await supabase
        .from("daily_goals")
        .select("*")
        .eq("user_id", user.id)
        .eq("date", dateStr)
        .eq("category", "professional");

      if (error) throw error;

      setGoals(
        (data || []).map((g) => ({
          id: g.id,
          title: g.title,
          completed: g.completed,
        }))
      );
    } catch (error) {
      console.error("Failed to load goals:", error);
      toast.error("Failed to load professional goals");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadGoalsForDate(selectedDate);
  }, [selectedDate, loadGoalsForDate]);

  // Filter suggestions for autocomplete
  const filteredSuggestions = useMemo(() => {
    if (!goalInput.trim()) return goalSuggestions.slice(0, 4);
    const query = goalInput.toLowerCase();
    return goalSuggestions.filter(s => 
      s.toLowerCase().includes(query)
    ).slice(0, 6);
  }, [goalInput]);

  const addGoal = async (title: string) => {
    if (!user || !title.trim()) return;
    
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    
    try {
      const { data, error } = await supabase
        .from("daily_goals")
        .insert({
          user_id: user.id,
          date: dateStr,
          title: title.trim(),
          category: "professional",
          completed: false,
          progress: 0,
        })
        .select()
        .single();

      if (error) throw error;

      const newGoal: ProfessionalGoal = {
        id: data.id,
        title: data.title,
        completed: data.completed,
      };
      
      setGoals([...goals, newGoal]);
      setGoalInput("");
      setShowSuggestions(false);
      toast.success("Goal added");
    } catch (error) {
      console.error("Failed to save goal:", error);
      toast.error("Failed to save goal");
    }
  };

  const removeGoal = async (id: string) => {
    try {
      const { error } = await supabase
        .from("daily_goals")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setGoals(goals.filter(g => g.id !== id));
      toast.success("Goal removed");
    } catch (error) {
      console.error("Failed to delete goal:", error);
      toast.error("Failed to remove goal");
    }
  };

  const toggleComplete = async (id: string) => {
    const goal = goals.find(g => g.id === id);
    if (!goal) return;

    try {
      const { error } = await supabase
        .from("daily_goals")
        .update({ completed: !goal.completed, progress: !goal.completed ? 100 : 0 })
        .eq("id", id);

      if (error) throw error;

      setGoals(goals.map(g => 
        g.id === id ? { ...g, completed: !g.completed } : g
      ));
    } catch (error) {
      console.error("Failed to update goal:", error);
      toast.error("Failed to update goal");
    }
  };

  const startEditing = (goal: ProfessionalGoal) => {
    setGoals(goals.map(g => 
      g.id === goal.id ? { ...g, isEditing: true } : { ...g, isEditing: false }
    ));
    setEditingValue(goal.title);
  };

  const saveEdit = async (id: string) => {
    if (!editingValue.trim()) return;

    try {
      const { error } = await supabase
        .from("daily_goals")
        .update({ title: editingValue.trim() })
        .eq("id", id);

      if (error) throw error;

      setGoals(goals.map(g => 
        g.id === id ? { ...g, title: editingValue.trim(), isEditing: false } : g
      ));
      setEditingValue("");
      toast.success("Goal updated");
    } catch (error) {
      console.error("Failed to update goal:", error);
      toast.error("Failed to update goal");
    }
  };

  const cancelEdit = (id: string) => {
    setGoals(goals.map(g => 
      g.id === id ? { ...g, isEditing: false } : g
    ));
    setEditingValue("");
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
          <h1 className="text-xl font-bold text-foreground flex-1">Professional Goals</h1>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6 pb-24 max-w-lg mx-auto relative">
        {isLoading && (
          <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

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

        {/* Add Goal Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-blue-500" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Add Professional Goals</h2>
          </div>

          <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
            <div className="relative">
              <div className="flex gap-2">
                <Input
                  value={goalInput}
                  onChange={(e) => {
                    setGoalInput(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder="What do you want to accomplish at work?"
                  className="flex-1 bg-muted border-0 rounded-xl h-11"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && goalInput.trim()) {
                      addGoal(goalInput);
                    }
                  }}
                />
                <Button
                  onClick={() => addGoal(goalInput)}
                  disabled={!goalInput.trim()}
                  className="h-11 px-4 rounded-xl"
                >
                  <Plus className="w-5 h-5" />
                </Button>
              </div>

              {/* Autocomplete Suggestions */}
              <AnimatePresence>
                {showSuggestions && filteredSuggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-20"
                  >
                    {filteredSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          addGoal(suggestion);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-muted transition-colors flex items-center gap-3"
                      >
                        <Sparkles className="w-4 h-4 text-blue-500" />
                        <span className="text-sm text-foreground">{suggestion}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Quick Suggestions */}
            <div className="flex flex-wrap gap-2">
              {goalSuggestions.slice(0, 3).map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => addGoal(suggestion)}
                  className="text-xs px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors"
                >
                  + {suggestion}
                </button>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Goals List */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          <h3 className="text-sm font-medium text-muted-foreground">Your Goals ({goals.length})</h3>
          
          {goals.length === 0 ? (
            <div className="bg-card border border-border rounded-2xl p-8 text-center">
              <Briefcase className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground text-sm">No professional goals for this day</p>
              <p className="text-muted-foreground/70 text-xs mt-1">Add your first goal above</p>
            </div>
          ) : (
            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {goals.map((goal) => (
                  <motion.div
                    key={goal.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className={cn(
                      "bg-card border rounded-xl p-4 flex items-center gap-3 group",
                      goal.completed ? "border-blue-200 bg-blue-50/50" : "border-border"
                    )}
                  >
                    <button
                      onClick={() => toggleComplete(goal.id)}
                      className={cn(
                        "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0",
                        goal.completed 
                          ? "bg-blue-500 border-blue-500" 
                          : "border-muted-foreground/30 hover:border-blue-500"
                      )}
                    >
                      {goal.completed && <Check className="w-3.5 h-3.5 text-white" />}
                    </button>

                    {goal.isEditing ? (
                      <div className="flex-1 flex gap-2">
                        <Input
                          value={editingValue}
                          onChange={(e) => setEditingValue(e.target.value)}
                          className="flex-1 h-8 text-sm"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveEdit(goal.id);
                            if (e.key === "Escape") cancelEdit(goal.id);
                          }}
                        />
                        <Button size="sm" onClick={() => saveEdit(goal.id)} className="h-8 px-2">
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => cancelEdit(goal.id)} className="h-8 px-2">
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <span className={cn(
                          "flex-1 text-sm",
                          goal.completed && "line-through text-muted-foreground"
                        )}>
                          {goal.title}
                        </span>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => startEditing(goal)}
                            className="p-1.5 hover:bg-muted rounded-lg transition-colors"
                          >
                            <Pencil className="w-4 h-4 text-muted-foreground" />
                          </button>
                          <button
                            onClick={() => removeGoal(goal.id)}
                            className="p-1.5 hover:bg-destructive/10 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </button>
                        </div>
                      </>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.section>

        {/* Click outside to close suggestions */}
        {showSuggestions && (
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setShowSuggestions(false)}
          />
        )}
      </div>

      {/* Save & Continue Button */}
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

export default AddProfessionalGoals;
