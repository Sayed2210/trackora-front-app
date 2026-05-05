/**
 * Egyptian phone number value object
 * Validates and formats Egyptian mobile numbers
 */
export class PhoneNumber {
  private static readonly EGYPTIAN_MOBILE_REGEX = /^01[0125]\d{8}$/;
  private readonly raw: string;

  constructor(phone: string) {
    const cleaned = phone.replace(/\s+/g, '').replace(/^\+?2/, '');
    if (!PhoneNumber.EGYPTIAN_MOBILE_REGEX.test(cleaned)) {
      throw new Error(`Invalid Egyptian phone number: ${phone}`);
    }
    this.raw = cleaned;
  }

  static isValid(phone: string): boolean {
    const cleaned = phone.replace(/\s+/g, '').replace(/^\+?2/, '');
    return PhoneNumber.EGYPTIAN_MOBILE_REGEX.test(cleaned);
  }

  toString(): string {
    return this.raw;
  }

  toInternational(): string {
    return `+20${this.raw}`;
  }

  mask(): string {
    return `${this.raw.slice(0, 4)}*****${this.raw.slice(-2)}`;
  }
}
