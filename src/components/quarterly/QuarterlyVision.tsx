import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ArrowRight, Mic, Lightbulb } from "lucide-react";
import VoiceInput from "@/components/VoiceInput";
import { useState } from "react";

interface QuarterlyVisionProps {
  vision: string;
  onVisionChange: (vision: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const prompts = [
  "What do you want this quarter to feel like?",
  "What would meaningful progress look like?",
  "What's one thing you'd love to accomplish?",
];

const QuarterlyVision = ({
  vision,
  onVisionChange,
  onNext,
  onBack,
}: QuarterlyVisionProps) => {
  const [showVoiceInput, setShowVoiceInput] = useState(false);

  const handleVoiceTranscript = (transcript: string) => {
    onVisionChange(vision ? `${vision} ${transcript}` : transcript);
    setShowVoiceInput(false);
  };

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
          <h1 className="text-2xl font-bold text-foreground">Define Your Vision</h1>
          <p className="text-muted-foreground text-sm">Step 1 of 5</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col max-w-lg mx-auto w-full">
        {/* Prompts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            <span className="text-sm font-medium text-muted-foreground">
              Reflective Prompts
            </span>
          </div>
          <div className="space-y-3">
            {prompts.map((prompt, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-muted/50 rounded-xl p-4 text-foreground/80 italic"
              >
                "{prompt}"
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Input Area */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex-1"
        >
          <label className="block text-sm font-medium text-foreground mb-2">
            Your Vision (optional)
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
                placeholder="What does this quarter mean to you? What would make it meaningful?"
                className="min-h-[200px] text-base rounded-xl resize-none pr-12"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowVoiceInput(true)}
                className="absolute right-2 bottom-2 rounded-full hover:bg-primary/10"
              >
                <Mic className="w-5 h-5 text-primary" />
              </Button>
            </div>
          )}
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
            size="lg"
            className="w-full h-14 text-lg font-semibold rounded-xl"
          >
            Continue
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <p className="text-center text-sm text-muted-foreground mt-3">
            You can skip this step if you prefer
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default QuarterlyVision;
