import { Injectable, signal, effect } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class RtlService {
  private readonly _isRtl = signal(false);
  readonly isRtl = this._isRtl.asReadonly();

  constructor() {
    effect(() => {
      const dir = this._isRtl() ? 'rtl' : 'ltr';
      document.documentElement.dir = dir;
      document.documentElement.lang = this._isRtl() ? 'ar' : 'en';
      document.body.classList.toggle('rtl', this._isRtl());
    });
  }

  setRtl(value: boolean): void {
    this._isRtl.set(value);
  }

  toggle(): void {
    this._isRtl.update((v) => !v);
  }
}
