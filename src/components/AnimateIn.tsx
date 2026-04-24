import { motion } from "framer-motion";
import { ReactNode } from "react";
import { fadeUpScroll } from "@/lib/motion";

interface AnimateInProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export const AnimateIn = ({ children, className, delay = 0 }: AnimateInProps) => (
  <motion.div
    {...fadeUpScroll}
    transition={{ ...fadeUpScroll.transition, delay }}
    className={className}
  >
    {children}
  </motion.div>
);
