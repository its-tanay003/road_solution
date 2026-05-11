/**
 * inputSanitizer.ts
 * Strips dangerous characters and protocols from user input.
 */
export function sanitizeInput(input: string, maxLength = 500): string {
  if (!input) return '';
  return input
    .replace(/[<>"'`]/g, '') // strip HTML injection chars
    .replace(/javascript:/gi, '') // strip JS protocol
    .replace(/on\w+=/gi, '') // strip event handlers
    .trim()
    .slice(0, maxLength);
}
