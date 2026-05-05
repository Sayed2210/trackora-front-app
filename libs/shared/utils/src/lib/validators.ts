/**
 * Egyptian phone validator
 * Pattern: 11 digits, starts with 01
 */
export const EGYPTIAN_PHONE_REGEX = /^01[0125]\d{8}$/;

export function isValidEgyptianPhone(phone: string): boolean {
  const cleaned = phone.replace(/\s+/g, '').replace(/^\+?2/, '');
  return EGYPTIAN_PHONE_REGEX.test(cleaned);
}

export function formatEgyptianPhone(phone: string): string {
  const cleaned = phone.replace(/\s+/g, '').replace(/^\+?2/, '');
  return cleaned;
}
