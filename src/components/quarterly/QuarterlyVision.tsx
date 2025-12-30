import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ArrowRight, Plus, X, Mic } from "lucide-react";
import VoiceInput from "@/components/VoiceInput";
import { useState, useMemo, useEffect } from "react";

export interface AnnualGoal {
  id: string;
  title: string;
  description: string;
}

interface QuarterlyVisionProps {
  vision: string;
  annualGoals: AnnualGoal[];
  onVisionChange: (vision: string) => void;
  onAnnualGoalsChange: (goals: AnnualGoal[]) => void;
  onNext: () => void;
  onBack: () => void;
}

const QuarterlyVision = ({
  vision,
  annualGoals,
  onVisionChange,
  onAnnualGoalsChange,
  onNext,
  onBack,
}: QuarterlyVisionProps) => {
  const [showVoiceInput, setShowVoiceInput] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [placeholderGoalIds] = useState(() => 
    Array.from({ length: 4 }, () => crypto.randomUUID())
  );

  // Ensure at least 4 goals with stable IDs
  const displayGoals = useMemo(() => {
    if (annualGoals.length >= 4) {
      return annualGoals;
    }
    const needed = 4 - annualGoals.length;
    return [
      ...annualGoals,
      ...Array.from({ length: needed }, (_, i) => ({
        id: placeholderGoalIds[annualGoals.length + i] || crypto.randomUUID(),
        title: "",
        description: "",
      }))
    ];
  }, [annualGoals, placeholderGoalIds]);

  const handleVoiceTranscript = (transcript: string) => {
    onVisionChange(vision ? `${vision} ${transcript}` : transcript);
    setShowVoiceInput(false);
  };

  const handleAddGoal = () => {
    const newGoal: AnnualGoal = {
      id: crypto.randomUUID(),
      title: "",
      description: "",
    };
    onAnnualGoalsChange([...annualGoals, newGoal]);
    setEditingGoalId(newGoal.id);
  };

  const handleUpdateGoal = (id: string, updates: Partial<AnnualGoal>) => {
    const existingGoal = annualGoals.find((goal) => goal.id === id);
    if (existingGoal) {
      // Update existing goal
      onAnnualGoalsChange(
        annualGoals.map((goal) => (goal.id === id ? { ...goal, ...updates } : goal))
      );
    } else {
      // Add new placeholder goal to annualGoals (user started typing in a placeholder)
      const newGoal: AnnualGoal = {
        id,
        title: "",
        description: "",
        ...updates,
      };
      onAnnualGoalsChange([...annualGoals, newGoal]);
    }
  };

  const handleRemoveGoal = (id: string) => {
    if (annualGoals.length > 4) {
      onAnnualGoalsChange(annualGoals.filter((goal) => goal.id !== id));
    }
  };

  const canContinue = annualGoals.length >= 4 && 
    annualGoals.every((goal) => goal.title.trim().length > 0);

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
          <h1 className="text-2xl font-bold text-foreground">Define Your Annual Vision</h1>
          <p className="text-muted-foreground text-sm">Step 1 of 4</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full">
        {/* Annual Vision Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <label className="block text-sm font-medium text-foreground mb-2">
            Your Annual Vision (optional)
          </label>
          
          {showVoiceInput ? (
            <VoiceInput
              onTranscript={handleVoiceTranscript}
              placeholder="Speak your vision..."
              className="mb-4"
            />
          ) : (
            <div className="relative">
              <Textarea
                value={vision}
                onChange={(e) => onVisionChange(e.target.value)}
                placeholder="What does this year mean to you? What would make it meaningful?"
                className="min-h-[120px] text-base rounded-xl resize-none pr-12"
              />
              <div className="absolute right-2 bottom-2 z-10">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowVoiceInput(true)}
                  className="rounded-full hover:bg-primary/10"
                >
                  <Mic className="w-5 h-5 text-primary" />
                </Button>
              </div>
            </div>
          )}
        </motion.div>

        {/* Annual Goals Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex-1 space-y-4"
        >
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-medium text-foreground">
              Annual Goals (at least 4 required)
            </label>
            <span className="text-xs text-muted-foreground">
              {annualGoals.filter(g => g.title.trim()).length}/4+
            </span>
          </div>

          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {displayGoals.map((goal, index) => {
                const isEditing = editingGoalId === goal.id || !goal.title;
                const isRequired = index < 4;
                
                return (
                  <motion.div
                    key={goal.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-card rounded-xl p-4 border border-border shadow-sm"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-muted-foreground">
                            Goal {index + 1}
                            {isRequired && <span className="text-destructive ml-1">*</span>}
                          </span>
                          {!isRequired && (
                            <button
                              onClick={() => handleRemoveGoal(goal.id)}
                              className="ml-auto text-muted-foreground hover:text-destructive transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        
                        <Input
                          placeholder="Goal Title (required)"
                          value={goal.title}
                          onChange={(e) => handleUpdateGoal(goal.id, { title: e.target.value })}
                          onFocus={() => setEditingGoalId(goal.id)}
                          className="rounded-lg"
                        />
                        
                        <Textarea
                          placeholder="Description (optional)"
                          value={goal.description}
                          onChange={(e) => handleUpdateGoal(goal.id, { description: e.target.value })}
                          onFocus={() => setEditingGoalId(goal.id)}
                          className="rounded-lg resize-none min-h-[80px]"
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Add More Button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={handleAddGoal}
              className="w-full py-4 rounded-xl border-2 border-dashed border-muted-foreground/30 text-muted-foreground hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Another Goal
            </motion.button>
          </div>
        </motion.div>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 pb-8"
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
          {!canContinue && (
            <p className="text-center text-sm text-muted-foreground mt-3">
              Please complete at least 4 annual goals to continue
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default QuarterlyVision;
