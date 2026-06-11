import { Component, inject, Renderer2, effect } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AuthService } from '@trackora/core/auth';
import { layoutFeature } from '@trackora/core/state';

@Component({
  selector: 'app-merchant-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="merchant-layout">
      <aside class="sidebar">
        <div class="sidebar-header">
          <span class="logo">Trackora</span>
          <span class="badge">Merchant</span>
        </div>
        <nav class="sidebar-nav">
          <a routerLink="/dashboard" routerLinkActive="active">
            <span class="icon">📊</span> Dashboard
          </a>
          <a routerLink="/shipments" routerLinkActive="active">
            <span class="icon">📦</span> Shipments
          </a>
          <a routerLink="/wallet" routerLinkActive="active">
            <span class="icon">💰</span> Wallet
          </a>
          <a routerLink="/payouts" routerLinkActive="active">
            <span class="icon">💳</span> Payouts
          </a>
        </nav>
      </aside>
      <div class="main-wrapper">
        <header class="top-bar">
          <div class="user-info">
            <span class="user-name">{{ authService.user()?.name || 'Merchant' }}</span>
            <span class="user-role">{{ authService.user()?.roles?.join(', ') || 'Merchant' }}</span>
          </div>
          <button class="logout-btn" (click)="logout()" data-testid="logout-button">Logout</button>
        </header>
        <main id="main-content" class="main-content">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
  styles: [`
    .merchant-layout { display: flex; height: 100vh; }
    .sidebar { width: 260px; background: var(--trackora-primary); color: white; display: flex; flex-direction: column; flex-shrink: 0; }
    .sidebar-header { padding: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.1); display: flex; align-items: center; gap: 0.5rem; }
    .logo { font-size: 1.25rem; font-weight: 700; }
    .badge { font-size: 0.625rem; padding: 0.125rem 0.375rem; background: rgba(255,255,255,0.2); border-radius: 4px; text-transform: uppercase; }
    .sidebar-nav { display: flex; flex-direction: column; padding: 1rem 0; }
    .sidebar-nav a { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1.5rem; color: rgba(255,255,255,0.8); text-decoration: none; font-size: 0.875rem; transition: all 0.2s; }
    .sidebar-nav a:hover, .sidebar-nav a.active { color: white; background: rgba(255,255,255,0.1); }
    .sidebar-nav a .icon { font-size: 1rem; }
    .main-wrapper { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
    .top-bar { display: flex; align-items: center; justify-content: flex-end; gap: 1rem; padding: 0.75rem 1.5rem; background: white; border-bottom: 1px solid var(--trackora-border); }
    .user-info { display: flex; flex-direction: column; align-items: flex-end; }
    .user-name { font-weight: 600; font-size: 0.875rem; }
    .user-role { font-size: 0.75rem; color: var(--trackora-text-secondary); text-transform: capitalize; }
    .logout-btn { padding: 0.375rem 0.875rem; background: transparent; border: 1px solid var(--trackora-border); border-radius: 6px; font-size: 0.875rem; cursor: pointer; color: var(--trackora-text); transition: all 0.2s; }
    .logout-btn:hover { background: #EF4444; color: white; border-color: #EF4444; }
    .main-content { flex: 1; padding: 1rem; background: var(--trackora-surface); overflow-y: auto; }
  `],
})
export class MerchantLayoutComponent {
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
