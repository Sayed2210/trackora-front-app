import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-courier-layout',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="courier-layout">
      <main class="main-content">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [`
    .courier-layout { height: 100vh; display: flex; flex-direction: column; }
    .main-content { flex: 1; padding: 0.5rem; background: var(--trackora-surface); }
  `],
})
export class CourierLayoutComponent {}
