import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  placeholder?: string;
  className?: string;
}

const VoiceInput = ({ onTranscript, placeholder = "Speak your goal...", className }: VoiceInputProps) => {
  const { transcript, isListening, isSupported, startListening, stopListening, resetTranscript } = useSpeechRecognition();

  useEffect(() => {
    if (transcript && !isListening) {
      onTranscript(transcript);
    }
  }, [transcript, isListening, onTranscript]);

  if (!isSupported) {
    return null;
  }

  return (
    <div className={className}>
      <AnimatePresence mode="wait">
        {isListening ? (
          <motion.div
            key="listening"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex items-center gap-3 p-4 rounded-2xl bg-primary/10 border-2 border-primary"
          >
            <div className="relative">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center"
              >
                <Mic className="w-6 h-6 text-primary" />
              </motion.div>
              <motion.div
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="absolute inset-0 rounded-full bg-primary/30"
              />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-primary">Listening...</p>
              <p className="text-sm text-muted-foreground min-h-[20px]">
                {transcript || placeholder}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                stopListening();
                resetTranscript();
              }}
              className="rounded-full"
            >
              <X className="w-5 h-5" />
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="idle"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <Button
              variant="outline"
              onClick={startListening}
              className="w-full rounded-xl h-14 gap-3 border-dashed border-2 hover:border-primary hover:bg-primary/5"
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Mic className="w-4 h-4 text-primary" />
              </div>
              <span className="text-muted-foreground">Tap to speak your goal</span>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VoiceInput;
