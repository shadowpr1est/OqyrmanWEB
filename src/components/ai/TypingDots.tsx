import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function TypingDots({ small }: { small?: boolean }) {
  const size = small ? "h-1 w-1" : "h-1.5 w-1.5";
  return (
    <span className="inline-flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className={cn(size, "rounded-full bg-primary/50")}
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.85, 1.1, 0.85] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }}
        />
      ))}
    </span>
  );
}
