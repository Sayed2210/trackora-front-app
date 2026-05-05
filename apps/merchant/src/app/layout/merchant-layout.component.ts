import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-merchant-layout',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="merchant-layout">
      <aside class="sidebar">Merchant Sidebar</aside>
      <main class="main-content">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [`
    .merchant-layout { display: flex; height: 100vh; }
    .sidebar { width: 260px; background: var(--trackora-primary); color: white; }
    .main-content { flex: 1; padding: 1rem; background: var(--trackora-surface); }
  `],
})
export class MerchantLayoutComponent {}
