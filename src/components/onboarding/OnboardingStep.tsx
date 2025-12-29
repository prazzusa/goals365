import { motion, AnimatePresence } from "framer-motion";
import { ReactNode } from "react";

interface OnboardingStepProps {
  children: ReactNode;
  stepKey: string | number;
}

export const OnboardingStep = ({ children, stepKey }: OnboardingStepProps) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={stepKey}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="w-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};