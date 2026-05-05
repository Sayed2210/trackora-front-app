import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-tracking-feature',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet />`,
})
export class TrackingFeatureComponent {}
