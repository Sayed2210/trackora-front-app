import { Component } from '@angular/core';

@Component({
  selector: 'app-tracking-feature',
  standalone: true,
  template: `<div class="tracking-feature"><h2>Tracking</h2><p>Tracking feature placeholder</p></div>`,
  styles: [`:host { display: block; padding: 2rem; }`],
})
export class TrackingFeatureComponent {}
