import { Pipe, PipeTransform } from '@angular/core';

/**
 * Arabic pluralization pipe using MessageFormat-like logic.
 * Handles Arabic plural rules (zero, one, two, few, many, other).
 */
@Pipe({
  name: 'arabicPlural',
  standalone: true,
})
export class ArabicPluralPipe implements PipeTransform {
  transform(count: number, forms: { zero?: string; one: string; two?: string; few?: string; many?: string; other: string }): string {
    const form = this.getArabicPluralForm(count);
    const template = forms[form] || forms.other;
    return template.replace(/\{count\}/g, String(count));
  }

  private getArabicPluralForm(count: number): keyof ArabicPluralPipe['transform'] extends (count: number, forms: infer R) => string ? keyof R : never {
    if (count === 0) return 'zero' as any;
    if (count === 1) return 'one' as any;
    if (count === 2) return 'two' as any;
    const mod100 = count % 100;
    if (mod100 >= 3 && mod100 <= 10) return 'few' as any;
    if (mod100 >= 11 && mod100 <= 99) return 'many' as any;
    return 'other' as any;
  }
}
