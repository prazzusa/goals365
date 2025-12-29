import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProgressDotsProps {
  total: number;
  current: number;
}

export const ProgressDots = ({ total, current }: ProgressDotsProps) => {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: total }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: index * 0.05 }}
          className={cn(
            "h-2 rounded-full transition-all duration-300",
            index < current
              ? "bg-primary w-2"
              : index === current
              ? "bg-primary w-8"
              : "bg-muted w-2"
          )}
        />
      ))}
    </div>
  );
};