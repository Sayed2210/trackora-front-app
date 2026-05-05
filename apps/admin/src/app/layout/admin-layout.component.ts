import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="admin-layout">
      <aside class="sidebar">Admin Sidebar</aside>
      <main class="main-content">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [`
    .admin-layout { display: flex; height: 100vh; }
    .sidebar { width: 260px; background: var(--trackora-primary); color: white; }
    .main-content { flex: 1; padding: 1rem; background: var(--trackora-surface); }
  `],
})
export class AdminLayoutComponent {}
