import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ArrowRight, Clock, Zap, Heart, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface MidWeekRefinementProps {
  onComplete: () => void;
  onBack: () => void;
}

const blockerOptions = [
  { id: "time", label: "Time", icon: Clock },
  { id: "energy", label: "Energy", icon: Zap },
  { id: "motivation", label: "Motivation", icon: Heart },
  { id: "external", label: "External dependency", icon: Users },
];

const MidWeekRefinement = ({ onComplete, onBack }: MidWeekRefinementProps) => {
  const [working, setWorking] = useState("");
  const [blockers, setBlockers] = useState<string[]>([]);
  const [blockingNote, setBlockingNote] = useState("");

  const toggleBlocker = (id: string) => {
    setBlockers((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen flex flex-col px-6 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mid-Week Check</h1>
          <p className="text-muted-foreground text-sm">Step 4 of 4</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col max-w-lg mx-auto w-full">
        {/* What's Working */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <label className="block text-sm font-medium text-foreground mb-2">
            What's working?
          </label>
          <Textarea
            value={working}
            onChange={(e) => setWorking(e.target.value)}
            placeholder="Share what's going well..."
            className="min-h-[80px] resize-none"
          />
        </motion.div>

        {/* Blockers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <label className="block text-sm font-medium text-foreground mb-3">
            What's blocking you?
          </label>
          <div className="grid grid-cols-2 gap-2">
            {blockerOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = blockers.includes(option.id);
              return (
                <button
                  key={option.id}
                  onClick={() => toggleBlocker(option.id)}
                  className={cn(
                    "p-3 rounded-xl border flex items-center gap-2 transition-all",
                    isSelected
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-4 h-4",
                      isSelected ? "text-primary" : "text-muted-foreground"
                    )}
                  />
                  <span
                    className={cn(
                      "text-sm font-medium",
                      isSelected ? "text-primary" : "text-foreground"
                    )}
                  >
                    {option.label}
                  </span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Blocking Note */}
        {blockers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mb-6"
          >
            <label className="block text-sm font-medium text-foreground mb-2">
              Tell us more (optional)
            </label>
            <Textarea
              value={blockingNote}
              onChange={(e) => setBlockingNote(e.target.value)}
              placeholder="What specifically is getting in the way?"
              className="min-h-[60px] resize-none"
            />
          </motion.div>
        )}

        {/* Suggestions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex-1"
        >
          <div className="p-4 rounded-xl bg-muted/50 border border-dashed">
            <h3 className="font-medium text-foreground mb-2">
              Quick Adjustments
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {blockers.includes("time") && (
                <li>• Consider breaking larger tasks into smaller chunks</li>
              )}
              {blockers.includes("energy") && (
                <li>• Try tackling difficult tasks during peak energy hours</li>
              )}
              {blockers.includes("motivation") && (
                <li>• Revisit your "why" for each goal to reconnect with purpose</li>
              )}
              {blockers.includes("external") && (
                <li>• Follow up on dependencies or adjust timeline expectations</li>
              )}
              {blockers.length === 0 && (
                <li>Select blockers above to see personalized suggestions</li>
              )}
            </ul>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 pt-4"
        >
          <Button
            onClick={onComplete}
            size="lg"
            className="w-full h-14 text-lg font-semibold rounded-xl"
          >
            Complete Check-In
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default MidWeekRefinement;
