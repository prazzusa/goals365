import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Sparkles, Target, Briefcase, Dumbbell, Edit2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import VoiceInput from "@/components/VoiceInput";

const categoryConfig = {
  personal: {
    icon: Target,
    color: "text-rose-500",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
    suggestions: [
      "Improve overall health",
      "Build better relationships",
      "Read more books",
      "Practice mindfulness daily",
      "Learn a new skill",
    ],
  },
  professional: {
    icon: Briefcase,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    suggestions: [
      "Get a promotion",
      "Learn new technologies",
      "Build my network",
      "Start a side project",
      "Improve public speaking",
    ],
  },
  fitness: {
    icon: Dumbbell,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    suggestions: [
      "Build consistent exercise habits",
      "Run a 5K",
      "Improve flexibility",
      "Eat healthier meals",
      "Get better sleep",
    ],
  },
};

interface YearlyGoal {
  id: string;
  title: string;
  isEditing?: boolean;
}

interface YearlyGoalsStepProps {
  category: "personal" | "professional" | "fitness";
  goals: YearlyGoal[];
  onAddGoal: (title: string) => void;
  onUpdateGoal: (id: string, title: string) => void;
  onRemoveGoal: (id: string) => void;
  maxGoals?: number;
}

const YearlyGoalsStep = ({
  category,
  goals,
  onAddGoal,
  onUpdateGoal,
  onRemoveGoal,
  maxGoals = 5,
}: YearlyGoalsStepProps) => {
  const [newGoal, setNewGoal] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  
  const config = categoryConfig[category];
  const Icon = config.icon;
  const canAdd = goals.length < maxGoals;

  const handleAdd = (text: string) => {
    const trimmed = text.trim();
    if (trimmed && !goals.some(g => g.title.toLowerCase() === trimmed.toLowerCase())) {
      onAddGoal(trimmed);
      setNewGoal("");
    }
  };

  const startEdit = (goal: YearlyGoal) => {
    setEditingId(goal.id);
    setEditValue(goal.title);
  };

  const saveEdit = () => {
    if (editingId && editValue.trim()) {
      onUpdateGoal(editingId, editValue.trim());
    }
    setEditingId(null);
    setEditValue("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${config.bg} mb-2`}>
          <Icon className={`w-8 h-8 ${config.color}`} />
        </div>
        <h2 className="text-2xl font-display font-bold">
          What are your {category} goals for this year?
        </h2>
        <p className="text-muted-foreground">
          Define up to 5 high-level goals you want to achieve
        </p>
      </div>

      {/* Goals List */}
      <div className="space-y-3 max-w-lg mx-auto">
        <AnimatePresence mode="popLayout">
          {goals.map((goal, index) => (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: index * 0.05 }}
              className={`relative p-4 rounded-xl border ${config.border} bg-card group`}
            >
              <div className="flex items-center gap-3">
                <span className={`flex items-center justify-center w-7 h-7 rounded-lg ${config.bg} ${config.color} text-sm font-semibold`}>
                  {index + 1}
                </span>
                
                {editingId === goal.id ? (
                  <Input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && saveEdit()}
                    onBlur={saveEdit}
                    autoFocus
                    className="flex-1 h-9"
                  />
                ) : (
                  <span className="flex-1 font-medium">{goal.title}</span>
                )}
                
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {editingId === goal.id ? (
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={saveEdit}>
                      <Check className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEdit(goal)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => onRemoveGoal(goal.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Add Goal Input */}
        {canAdd && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            <VoiceInput 
              onTranscript={handleAdd}
              placeholder="Speak your goal..."
            />
            
            <div className="flex gap-2">
              <Input
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd(newGoal)}
                placeholder="Or type your goal here..."
                className="rounded-xl h-12"
              />
              <Button 
                onClick={() => handleAdd(newGoal)}
                disabled={!newGoal.trim()}
                className="rounded-xl h-12 px-6"
              >
                <Plus className="w-5 h-5" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* Goal count */}
        <p className="text-center text-sm text-muted-foreground">
          {goals.length}/{maxGoals} goals added
        </p>
      </div>

      {/* Suggestions */}
      {canAdd && (
        <div className="max-w-lg mx-auto">
          <p className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Need inspiration?
          </p>
          <div className="flex flex-wrap gap-2">
            {config.suggestions
              .filter(s => !goals.some(g => g.title.toLowerCase() === s.toLowerCase()))
              .map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => handleAdd(suggestion)}
                  className={`px-4 py-2 rounded-full text-sm ${config.bg} ${config.color} hover:opacity-80 transition-opacity`}
                >
                  {suggestion}
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default YearlyGoalsStep;
