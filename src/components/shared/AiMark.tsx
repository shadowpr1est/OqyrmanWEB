import { motion } from "framer-motion";
import { useId } from "react";

interface Props {
  size?: number;
  /** Enable ambient shimmer animation (subtle rotation on the accent sparkle). */
  animated?: boolean;
  className?: string;
  /** Use CSS `currentColor` instead of the brand gradient (for monochrome contexts). */
  mono?: boolean;
}

/**
 * Brand mark for AI features — a four-point sparkle with a smaller companion
 * sparkle orbiting it. Uses a gradient fill derived from the theme's primary
 * tokens so it lives naturally alongside the rest of the design system.
 */
export const AiMark = ({
  size = 20,
  animated = true,
  className,
  mono = false,
}: Props) => {
  const gradId = useId();

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {!mono && (
        <defs>
          <linearGradient
            id={`ai-mark-${gradId}`}
            x1="4"
            y1="3"
            x2="20"
            y2="21"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0" stopColor="hsl(var(--primary-light))" />
            <stop offset="1" stopColor="hsl(var(--primary))" />
          </linearGradient>
          <radialGradient
            id={`ai-glow-${gradId}`}
            cx="12"
            cy="12"
            r="10"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0" stopColor="hsl(var(--primary-light))" stopOpacity="0.18" />
            <stop offset="1" stopColor="hsl(var(--primary))" stopOpacity="0" />
          </radialGradient>
        </defs>
      )}

      {!mono && <circle cx="12" cy="12" r="10" fill={`url(#ai-glow-${gradId})`} />}

      {/* Main sparkle — a four-point star, curvy inner waist */}
      <motion.path
        d="M12 2 C 12.4 7.2 14.1 9.6 21 12 C 14.1 14.4 12.4 16.8 12 22 C 11.6 16.8 9.9 14.4 3 12 C 9.9 9.6 11.6 7.2 12 2 Z"
        fill={mono ? "currentColor" : `url(#ai-mark-${gradId})`}
        initial={false}
        animate={animated ? { scale: [1, 1.04, 1] } : undefined}
        transition={
          animated
            ? { duration: 2.6, repeat: Infinity, ease: "easeInOut" }
            : undefined
        }
        style={{ transformOrigin: "12px 12px" }}
      />

      {/* Accent sparkle — smaller companion */}
      <motion.path
        d="M18.5 3.4 C 18.65 4.9 19.25 5.6 21.1 6.1 C 19.25 6.6 18.65 7.3 18.5 8.8 C 18.35 7.3 17.75 6.6 15.9 6.1 C 17.75 5.6 18.35 4.9 18.5 3.4 Z"
        fill={mono ? "currentColor" : `url(#ai-mark-${gradId})`}
        opacity={mono ? 0.6 : 0.85}
        initial={false}
        animate={
          animated
            ? { rotate: [0, 20, 0], scale: [1, 1.15, 1] }
            : undefined
        }
        transition={
          animated
            ? { duration: 2.6, repeat: Infinity, ease: "easeInOut", delay: 0.4 }
            : undefined
        }
        style={{ transformOrigin: "18.5px 6.1px" }}
      />
    </svg>
  );
};
