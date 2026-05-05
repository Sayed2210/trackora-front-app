import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageService } from '@trackora/core/config';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button class="lang-btn" (click)="toggle()">
      {{ lang() === 'ar' ? 'EN' : 'AR' }}
    </button>
  `,
  styles: [`
    .lang-btn {
      background: transparent;
      border: 1px solid var(--trackora-border);
      color: var(--trackora-text);
      padding: 0.25rem 0.75rem;
      border-radius: 4px;
      cursor: pointer;
      font-family: var(--font-header);
      font-weight: 600;
    }
    .lang-btn:hover {
      background: var(--trackora-surface);
    }
  `],
})
export class LanguageSwitcherComponent {
  private readonly languageService = inject(LanguageService);
  readonly lang = this.languageService.lang;

  toggle(): void {
    this.languageService.setLanguage(this.lang() === 'ar' ? 'en' : 'ar');
  }
}
