import type { Variants, Transition } from 'framer-motion';

/** Standard ease curve matching --ease-out in NEXUS DARK */
const ease: [number, number, number, number] = [0.0, 0.0, 0.2, 1.0];
const easeSpring: [number, number, number, number] = [0.34, 1.56, 0.64, 1.0];

/** Primary page transition — slide up + fade + subtle scale */
export const pageVariants: Variants = {
  initial: { opacity: 0, y: 20, scale: 0.98 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.3, ease } as Transition,
  },
  exit: {
    opacity: 0,
    y: -16,
    scale: 0.98,
    transition: { duration: 0.2, ease } as Transition,
  },
};

/** Modal / overlay transition — scale in */
export const modalVariants: Variants = {
  initial: { opacity: 0, scale: 0.92, y: 16 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.35, ease: easeSpring } as Transition,
  },
  exit: {
    opacity: 0,
    scale: 0.94,
    y: 8,
    transition: { duration: 0.2, ease } as Transition,
  },
};

/** Bottom sheet / SOS panel — slide up from bottom */
export const bottomSheetVariants: Variants = {
  initial: { y: '100%', opacity: 0 },
  animate: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.4, ease: easeSpring } as Transition,
  },
  exit: {
    y: '100%',
    opacity: 0,
    transition: { duration: 0.3, ease } as Transition,
  },
};

/** Toast notification — slide in from right */
export const toastVariants: Variants = {
  initial: { x: '110%', opacity: 0 },
  animate: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.35, ease: easeSpring } as Transition,
  },
  exit: {
    x: '110%',
    opacity: 0,
    transition: { duration: 0.25, ease } as Transition,
  },
};

/** Stagger container — children animate in sequence */
export const staggerContainer: Variants = {
  animate: {
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

/** Individual stagger item */
export const staggerItem: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease } as Transition,
  },
};

/** Fade only — for overlays / backdrops */
export const fadeVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.25, ease } as Transition },
  exit:    { opacity: 0, transition: { duration: 0.2,  ease } as Transition },
};
