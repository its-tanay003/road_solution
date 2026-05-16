/**
 * Utility for generating standardized ARIA labels and attributes
 */

export const getAriaLabel = (text: string, context?: string) => {
  if (context) return `${text} - ${context}`;
  return text;
};

export const getAriaDescribedBy = (id: string) => {
  return `${id}-description`;
};

export const getAriaErrorMessage = (id: string) => {
  return `${id}-error`;
};

/**
 * Standardizes button roles and attributes
 */
export const buttonAria = (label: string, pressed?: boolean) => ({
  role: 'button' as const,
  'aria-label': label,
  ...(pressed !== undefined && { 'aria-pressed': pressed ? ('true' as const) : ('false' as const) }),
});

export const switchAria = (checked: boolean) => ({
  role: 'switch' as const,
  'aria-checked': checked ? ('true' as const) : ('false' as const),
});

export const getAriaExpanded = (expanded: boolean) => ({
  'aria-expanded': expanded ? ('true' as const) : ('false' as const),
});

/**
 * Standardizes image alt text
 */
export const imageAlt = (description: string) => ({
  alt: description,
  role: 'img',
});

/**
 * Standardizes modal attributes
 */
export const modalAria = (labelId: string) => ({
  role: 'dialog',
  'aria-modal': true,
  'aria-labelledby': labelId,
});
