import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';

@Component({
  selector: 'app-courier-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  template: `
    <div class="courier-layout">
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
      <main class="main-content">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [`
    .courier-layout { height: 100vh; display: flex; flex-direction: column; }
    .main-content { flex: 1; padding: 0.5rem; padding-bottom: 4rem; background: var(--trackora-surface); overflow-y: auto; }
    .bottom-nav { position: fixed; bottom: 0; left: 0; right: 0; display: flex; justify-content: space-around; background: white; border-top: 1px solid var(--trackora-border); padding: 0.5rem 0; z-index: 100; }
    .bottom-nav a { display: flex; flex-direction: column; align-items: center; gap: 0.25rem; text-decoration: none; color: var(--trackora-text-secondary); font-size: 0.75rem; }
    .bottom-nav a.active { color: var(--trackora-primary); }
    .nav-icon { font-size: 1.25rem; }
    .nav-label { font-size: 0.625rem; }
  `],
})
export class CourierLayoutComponent {}
