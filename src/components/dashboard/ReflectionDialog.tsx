import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { X, Check, Edit2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, startOfWeek, getMonth, getYear } from "date-fns";

interface ReflectionDialogProps {
  open: boolean;
  onClose: () => void;
  onSave?: (reflection: ReflectionData) => void;
  type: "weekly" | "monthly";
  userId?: string;
  weekStart?: string; // For weekly reflections (YYYY-MM-DD)
  month?: number; // For monthly reflections (1-12)
  year?: number; // For monthly reflections
}

export interface ReflectionData {
  achievements: string;
  distractions: string;
  whatDidNotHappen: string;
  howCanIImprove: string;
}

const ReflectionDialog = ({ 
  open, 
  onClose, 
  onSave, 
  type,
  userId,
  weekStart,
  month,
  year,
}: ReflectionDialogProps) => {
  const [reflection, setReflection] = useState<ReflectionData>({
    achievements: "",
    distractions: "",
    whatDidNotHappen: "",
    howCanIImprove: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasExistingReflection, setHasExistingReflection] = useState(false);

  // Load existing reflection when dialog opens
  useEffect(() => {
    if (open && userId) {
      loadReflection();
    } else if (open && !hasExistingReflection) {
      setIsEditing(true);
    }
  }, [open, userId, weekStart, month, year]);

  const loadReflection = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      let query = supabase
        .from("reflections")
        .select("*")
        .eq("user_id", userId)
        .eq("type", type);

      if (type === "weekly" && weekStart) {
        query = query.eq("week_start", weekStart);
      } else if (type === "monthly" && month && year) {
        query = query.eq("month", month).eq("year", year);
      }

      const { data, error } = await query.single();

      if (error && error.code !== "PGRST116") { // PGRST116 = no rows returned
        throw error;
      }

      if (data) {
        setReflection({
          achievements: data.achievements || "",
          distractions: data.distractions || "",
          whatDidNotHappen: data.what_did_not_happen || "",
          howCanIImprove: data.how_can_i_improve || "",
        });
        setHasExistingReflection(true);
        setIsEditing(false);
      } else {
        setReflection({
          achievements: "",
          distractions: "",
          whatDidNotHappen: "",
          howCanIImprove: "",
        });
        setHasExistingReflection(false);
        setIsEditing(true);
      }
    } catch (error) {
      console.error("Error loading reflection:", error);
      setHasExistingReflection(false);
      setIsEditing(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!userId) {
      // Fallback to callback if no userId provided
      if (onSave) {
        onSave(reflection);
      }
      onClose();
      return;
    }

    setIsSaving(true);
    try {
      const reflectionData: any = {
        user_id: userId,
        type,
        achievements: reflection.achievements.trim() || null,
        distractions: reflection.distractions.trim() || null,
        what_did_not_happen: reflection.whatDidNotHappen.trim() || null,
        how_can_i_improve: reflection.howCanIImprove.trim() || null,
      };

      if (type === "weekly" && weekStart) {
        reflectionData.week_start = weekStart;
      } else if (type === "monthly" && month && year) {
        reflectionData.month = month;
        reflectionData.year = year;
      }

      // Check if reflection exists
      let query = supabase
        .from("reflections")
        .select("id")
        .eq("user_id", userId)
        .eq("type", type);

      if (type === "weekly" && weekStart) {
        query = query.eq("week_start", weekStart);
      } else if (type === "monthly" && month && year) {
        query = query.eq("month", month).eq("year", year);
      }

      const { data: existing } = await query.single();

      if (existing) {
        // Update existing reflection
        const { error } = await supabase
          .from("reflections")
          .update(reflectionData)
          .eq("id", existing.id);

        if (error) throw error;
      } else {
        // Insert new reflection
        const { error } = await supabase
          .from("reflections")
          .insert(reflectionData);

        if (error) throw error;
      }

      toast.success("Reflection saved");
      setHasExistingReflection(true);
      setIsEditing(false);
      
      if (onSave) {
        onSave(reflection);
      }
    } catch (error) {
      console.error("Error saving reflection:", error);
      toast.error("Failed to save reflection");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (hasExistingReflection) {
      setIsEditing(false);
      loadReflection(); // Reload to reset changes
    } else {
      onClose();
    }
  };

  const isAllFieldsCompleted = () => {
    return (
      reflection.achievements.trim() !== "" &&
      reflection.distractions.trim() !== "" &&
      reflection.whatDidNotHappen.trim() !== "" &&
      reflection.howCanIImprove.trim() !== ""
    );
  };

  const sections = [
    {
      key: "achievements" as const,
      label: "Achievements",
      placeholder: "What did you accomplish? What went well?",
      icon: "🎉",
    },
    {
      key: "distractions" as const,
      label: "Distractions",
      placeholder: "What pulled you away from your goals?",
      icon: "⚠️",
    },
    {
      key: "whatDidNotHappen" as const,
      label: "What Did Not Happen",
      placeholder: "What didn't go as planned? What obstacles did you face?",
      icon: "❌",
    },
    {
      key: "howCanIImprove" as const,
      label: "How Can I Improve",
      placeholder: "What can you do differently next time?",
      icon: "💡",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center justify-between">
            <span>{type === "weekly" ? "Weekly Reflection" : "Monthly Reflection"}</span>
            {hasExistingReflection && !isEditing && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEdit}
                className="rounded-lg gap-2"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : isEditing || !hasExistingReflection ? (
          // Edit/Input Mode
          <div className="space-y-6 py-4">
            {sections.map((section, index) => (
              <motion.div
                key={section.key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="space-y-2"
              >
                <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <span className="text-lg">{section.icon}</span>
                  {section.label}
                </label>
                <Textarea
                  value={reflection[section.key]}
                  onChange={(e) =>
                    setReflection((prev) => ({ ...prev, [section.key]: e.target.value }))
                  }
                  placeholder={section.placeholder}
                  className="min-h-[100px] resize-none rounded-xl"
                />
              </motion.div>
            ))}
          </div>
        ) : (
          // Summary View
          <div className="space-y-6 py-4">
            {sections.map((section, index) => {
              const value = reflection[section.key];
              if (!value || value.trim() === "") return null;

              return (
                <motion.div
                  key={section.key}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="space-y-2"
                >
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <span className="text-lg">{section.icon}</span>
                    {section.label}
                  </label>
                  <div className="bg-muted/50 rounded-xl p-4 text-sm text-foreground whitespace-pre-wrap">
                    {value}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        <div className="flex gap-3 pt-4 border-t">
          {isEditing || !hasExistingReflection ? (
            <>
              <Button
                variant="outline"
                onClick={handleCancel}
                className="flex-1 rounded-xl"
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="flex-1 rounded-xl"
                disabled={isSaving || !isAllFieldsCompleted()}
              >
                <Check className="w-4 h-4 mr-2" />
                {isSaving ? "Saving..." : "Save Reflection"}
              </Button>
            </>
          ) : (
            <Button
              onClick={onClose}
              className="flex-1 rounded-xl"
            >
              Close
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReflectionDialog;

