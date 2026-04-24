/**
 * Shared Framer Motion animation presets.
 * Spread onto motion.* elements: <motion.div {...fadeUp} />
 * Add delay via: <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.1 }} />
 */

const ease = "easeOut";

/** Fade + slide up 20px — page sections, content blocks */
export const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease },
} as const;

/** Fade + slide up 15px — detail sub-sections, stacked rows */
export const fadeUpSm = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease },
} as const;

/** Fade + slide up 30px, scroll-triggered — landing sections */
export const fadeUpScroll = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: 0.6, ease },
} as const;

/** Fade + slide from left */
export const fadeLeft = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.4, ease },
} as const;

/** Fade + slide from right */
export const fadeRight = {
  initial: { opacity: 0, x: 30 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.5, ease },
} as const;

/** Scale + fade — modals, popovers */
export const scaleFade = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.2, ease },
} as const;

/** Pure fade — backdrops */
export const backdropFade = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.2 },
} as const;

/** Slide down from top — dropdown panels */
export const slideDown = {
  initial: { opacity: 0, y: -8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.2, ease },
} as const;

/** Staggered list — apply to the container */
export const staggerContainer = {
  animate: { transition: { staggerChildren: 0.06 } },
} as const;

/** Staggered list — apply to each child item */
export const staggerItem = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, ease },
} as const;
