import { Component, inject, Renderer2, effect } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AuthService } from '@trackora/core/auth';
import { layoutFeature } from '@trackora/core/state';

@Component({
  selector: 'app-courier-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="courier-layout">
      <header class="top-bar">
        <span class="app-title">Trackora Courier</span>
        <div class="user-actions">
          <span class="user-name">{{ authService.user()?.name || 'Courier' }}</span>
          <button class="logout-btn" (click)="logout()" data-testid="logout-button">Logout</button>
        </div>
      </header>
      <main id="main-content" class="main-content">
        <router-outlet />
      </main>
      <nav class="bottom-nav">
        <a routerLink="/tasks" routerLinkActive="active">
          <span class="nav-icon">📦</span>
          <span class="nav-label">Tasks</span>
        </a>
        <a routerLink="/cash-deposit" routerLinkActive="active">
          <span class="nav-icon">💰</span>
          <span class="nav-label">Cash</span>
        </a>
        <a routerLink="/performance" routerLinkActive="active">
          <span class="nav-icon">📊</span>
          <span class="nav-label">Stats</span>
        </a>
      </nav>
    </div>
  `,
  styles: [`
    .courier-layout { height: 100vh; display: flex; flex-direction: column; }
    .top-bar { display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 1rem; background: white; border-bottom: 1px solid var(--trackora-border); }
    .app-title { font-weight: 700; font-size: 1rem; color: var(--trackora-primary); }
    .user-actions { display: flex; align-items: center; gap: 0.75rem; }
    .user-name { font-size: 0.875rem; color: var(--trackora-text-secondary); }
    .logout-btn { padding: 0.375rem 0.75rem; background: transparent; border: 1px solid var(--trackora-border); border-radius: 6px; font-size: 0.75rem; cursor: pointer; color: var(--trackora-text); transition: all 0.2s; }
    .logout-btn:hover { background: #EF4444; color: white; border-color: #EF4444; }
    .main-content { flex: 1; padding: 0.5rem; padding-bottom: 4rem; background: var(--trackora-surface); overflow-y: auto; }
    .bottom-nav { position: fixed; bottom: 0; left: 0; right: 0; display: flex; justify-content: space-around; background: white; border-top: 1px solid var(--trackora-border); padding: 0.5rem 0; z-index: 100; }
    .bottom-nav a { display: flex; flex-direction: column; align-items: center; gap: 0.25rem; text-decoration: none; color: var(--trackora-text-secondary); font-size: 0.75rem; }
    .bottom-nav a.active { color: var(--trackora-primary); }
    .nav-icon { font-size: 1.25rem; }
    .nav-label { font-size: 0.625rem; }
  `],
})
export class CourierLayoutComponent {
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly store = inject(Store);
  private readonly renderer = inject(Renderer2);
  private readonly document = inject(DOCUMENT);

  constructor() {
    effect(() => {
      const direction = this.store.selectSignal(layoutFeature.selectDirection)();
      this.renderer.setAttribute(this.document.documentElement, 'dir', direction);
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
