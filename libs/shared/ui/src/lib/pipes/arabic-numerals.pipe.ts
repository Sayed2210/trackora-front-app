import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'arabicNumerals',
  standalone: true,
})
export class ArabicNumeralsPipe implements PipeTransform {
  private readonly arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

  transform(value: number | string | null | undefined): string {
    if (value == null) return '';
    const str = String(value);
    return str.replace(/[0-9]/g, (w) => this.arabicDigits[+w]);
  }
}
