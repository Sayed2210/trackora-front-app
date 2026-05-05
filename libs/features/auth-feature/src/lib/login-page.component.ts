import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AuthRepository } from '@trackora/shared/data-access';
import { AuthService } from '@trackora/core/auth';
import { LanguageService } from '@trackora/core/config';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  template: `
    <div class="login-container" [dir]="languageService.dir()">
      <div class="login-card">
        <h1>{{ 'auth.loginTitle' | translate }}</h1>
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="field">
            <label>{{ 'auth.email' | translate }}</label>
            <input type="email" formControlName="email" class="p-inputtext" />
          </div>
          <div class="field">
            <label>{{ 'auth.password' | translate }}</label>
            <input type="password" formControlName="password" class="p-inputtext" />
          </div>
          <button type="submit" class="p-button p-button-primary" [disabled]="loginForm.invalid || loading()">
            {{ loading() ? ('common.loading' | translate) : ('auth.loginButton' | translate) }}
          </button>
          <div *ngIf="error()" class="error-message">{{ error() }}</div>
        </form>
        <div class="language-switcher">
          <button (click)="toggleLanguage()">
            {{ languageService.lang() === 'ar' ? 'English' : 'العربية' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: var(--trackora-surface);
    }
    .login-card {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      width: 100%;
      max-width: 400px;
    }
    .field { margin-bottom: 1rem; }
    label { display: block; margin-bottom: 0.5rem; font-weight: 600; }
    input { width: 100%; padding: 0.5rem; border: 1px solid var(--trackora-border); border-radius: 4px; }
    button { width: 100%; padding: 0.75rem; background: var(--trackora-primary); color: white; border: none; border-radius: 4px; cursor: pointer; }
    button:disabled { opacity: 0.6; }
    .error-message { color: var(--trackora-danger); margin-top: 0.5rem; }
    .language-switcher { margin-top: 1rem; text-align: center; }
    .language-switcher button { background: transparent; color: var(--trackora-primary); width: auto; }
  `],
})
export class LoginPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authRepo = inject(AuthRepository);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  readonly languageService = inject(LanguageService);

  loading = false;
  error = '';

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  onSubmit(): void {
    if (this.loginForm.invalid) return;
    this.loading = true;
    this.error = '';
    const { email, password } = this.loginForm.value;
    this.authRepo.login({ email: email!, password: password! }).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.message || 'Login failed';
      },
    });
  }

  toggleLanguage(): void {
    this.languageService.setLanguage(this.languageService.lang() === 'ar' ? 'en' : 'ar');
  }
}
