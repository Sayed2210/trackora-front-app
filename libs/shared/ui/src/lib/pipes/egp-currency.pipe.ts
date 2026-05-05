import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'egpCurrency',
  standalone: true,
})
export class EgpCurrencyPipe implements PipeTransform {
  transform(value: number | null | undefined, locale: 'en' | 'ar' = 'ar'): string {
    if (value == null) return '-';
    return new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-US', {
      style: 'currency',
      currency: 'EGP',
    }).format(value);
  }
}
