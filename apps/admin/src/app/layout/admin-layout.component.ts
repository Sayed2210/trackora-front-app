import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '@trackora/core/auth';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="admin-layout">
      <aside class="sidebar">
        <div class="sidebar-header">
          <span class="logo">Trackora</span>
          <span class="badge">Admin</span>
        </div>
        <nav class="sidebar-nav">
          <a routerLink="/dashboard" routerLinkActive="active">
            <span class="icon">📊</span> Dashboard
          </a>
          <a routerLink="/shipments" routerLinkActive="active">
            <span class="icon">📦</span> Shipments
          </a>
          <a routerLink="/assignments" routerLinkActive="active">
            <span class="icon">🚚</span> Dispatch Board
          </a>
          <a routerLink="/couriers" routerLinkActive="active">
            <span class="icon">👤</span> Couriers
          </a>
          <a routerLink="/merchants" routerLinkActive="active">
            <span class="icon">🏪</span> Merchants
          </a>
          <a routerLink="/payouts" routerLinkActive="active">
            <span class="icon">💳</span> Payouts
          </a>
          <a routerLink="/wallets" routerLinkActive="active">
            <span class="icon">💰</span> Wallets
          </a>
          <a routerLink="/audit-logs" routerLinkActive="active">
            <span class="icon">🔒</span> Audit Logs
          </a>
          <a routerLink="/reports" routerLinkActive="active">
            <span class="icon">📈</span> Reports
          </a>
          <a routerLink="/analytics" routerLinkActive="active">
            <span class="icon">📉</span> Analytics
          </a>
        </nav>
      </aside>
      <div class="main-wrapper">
        <header class="top-bar">
          <div class="user-info">
            <span class="user-name">{{ authService.user()?.name || 'Admin' }}</span>
            <span class="user-role">{{ authService.user()?.role || 'Admin' }}</span>
          </div>
          <button class="logout-btn" (click)="logout()">Logout</button>
        </header>
        <main class="main-content">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
  styles: [`
    .admin-layout { display: flex; height: 100vh; }
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
export class AdminLayoutComponent {
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
