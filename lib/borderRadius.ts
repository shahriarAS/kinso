/**
 * Consistent Border Radius Utility
 *
 * This file provides consistent rounded corner classes and utilities
 * to maintain design consistency across the entire application.
 */

export const BORDER_RADIUS = {
  xs: "var(--radius-xs)", // 4px - Small elements like badges, chips
  sm: "var(--radius-sm)", // 6px - Buttons, form inputs
  md: "var(--radius-md)", // 8px - Cards, dropdowns, modals
  lg: "var(--radius-lg)", // 12px - Larger cards, containers
  xl: "var(--radius-xl)", // 16px - Large containers, panels
  "2xl": "var(--radius-2xl)", // 24px - Drawers, large modals
  full: "var(--radius-full)", // 9999px - Fully rounded elements
} as const;

/**
 * Tailwind CSS classes for consistent rounded corners
 */
export const ROUNDED_CLASSES = {
  xs: "rounded-xs", // For badges, chips, small tags
  sm: "rounded-sm", // For buttons, form inputs
  md: "rounded-md", // For cards, dropdowns, modals
  lg: "rounded-lg", // For larger cards, containers
  xl: "rounded-xl", // For large containers, panels
  "2xl": "rounded-2xl", // For drawers, large modals
  full: "rounded-full", // For fully rounded elements
} as const;

/**
 * Component-specific rounded corner recommendations
 */
export const COMPONENT_ROUNDS = {
  // Form elements
  button: ROUNDED_CLASSES.sm,
  input: ROUNDED_CLASSES.sm,
  select: ROUNDED_CLASSES.sm,
  textarea: ROUNDED_CLASSES.sm,

  // UI containers
  card: ROUNDED_CLASSES.lg,
  modal: ROUNDED_CLASSES.md,
  dropdown: ROUNDED_CLASSES.md,
  drawer: ROUNDED_CLASSES["2xl"],

  // Interactive elements
  badge: ROUNDED_CLASSES.xs,
  chip: ROUNDED_CLASSES.xs,
  tag: ROUNDED_CLASSES.xs,
  avatar: ROUNDED_CLASSES.full,

  // Layout containers
  panel: ROUNDED_CLASSES.xl,
  section: ROUNDED_CLASSES.lg,
  container: ROUNDED_CLASSES.lg,
} as const;

/**
 * Helper function to get consistent rounded corner class
 */
export const getRoundedClass = (
  component: keyof typeof COMPONENT_ROUNDS,
): string => {
  return COMPONENT_ROUNDS[component];
};

/**
 * CSS-in-JS style object for programmatic use
 */
export const getRoundedStyle = (
  size: keyof typeof BORDER_RADIUS,
): { borderRadius: string } => {
  return {
    borderRadius: BORDER_RADIUS[size],
  };
};

/**
 * Usage Examples:
 *
 * // In JSX:
 * <div className={getRoundedClass('card')}>Card content</div>
 * <button className={getRoundedClass('button')}>Button</button>
 *
 * // With custom classes:
 * <div className={`bg-white ${ROUNDED_CLASSES.lg} border border-gray-200`}>Content</div>
 *
 * // With CSS-in-JS:
 * <div style={{...getRoundedStyle('lg'), backgroundColor: 'white'}}>Content</div>
 */
