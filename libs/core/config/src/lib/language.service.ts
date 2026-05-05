import { Injectable, signal, computed } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly _lang = signal<'en' | 'ar'>('ar');
  readonly lang = this._lang.asReadonly();
  readonly isRtl = computed(() => this._lang() === 'ar');
  readonly dir = computed(() => (this.isRtl() ? 'rtl' : 'ltr'));

  constructor(private readonly translate: TranslateService) {
    translate.setDefaultLang('ar');
    translate.use('ar');
  }

  setLanguage(lang: 'en' | 'ar'): void {
    this._lang.set(lang);
    this.translate.use(lang);
    document.documentElement.dir = this.dir();
    document.documentElement.lang = lang;
  }
}
