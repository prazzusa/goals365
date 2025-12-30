import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { X, Check, Edit2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

interface ReflectionDialogProps {
  open: boolean;
  onClose: () => void;
  onSave?: (reflection: ReflectionData) => void;
  type: "weekly" | "monthly";
  userId?: string;
  weekStart?: string;
  month?: number;
  year?: number;
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
}: ReflectionDialogProps) => {
  const [reflection, setReflection] = useState<ReflectionData>({
    achievements: "",
    distractions: "",
    whatDidNotHappen: "",
    howCanIImprove: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (onSave) {
        onSave(reflection);
      }
      toast.success("Reflection saved");
      onClose();
    } catch (error) {
      console.error("Error saving reflection:", error);
      toast.error("Failed to save reflection");
    } finally {
      setIsSaving(false);
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
          <DialogTitle className="text-xl font-bold">
            {type === "weekly" ? "Weekly Reflection" : "Monthly Reflection"}
          </DialogTitle>
        </DialogHeader>

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

        <div className="flex gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={onClose}
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
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReflectionDialog;
