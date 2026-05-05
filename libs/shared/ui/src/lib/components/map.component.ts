import { Component, AfterViewInit, Input, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  template: `<div #mapContainer class="map-container"></div>`,
  styles: [`
    .map-container { width: 100%; height: 100%; min-height: 300px; border-radius: 8px; }
    :host { display: block; }
  `],
})
export class MapComponent implements AfterViewInit {
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef<HTMLDivElement>;
  @Input() lat = 30.0444;
  @Input() lng = 31.2357;
  @Input() zoom = 13;
  @Input() markers: Array<{ lat: number; lng: number; title?: string }> = [];

  private map?: L.Map;

  ngAfterViewInit(): void {
    this.initMap();
  }

  private initMap(): void {
    this.map = L.map(this.mapContainer.nativeElement).setView([this.lat, this.lng], this.zoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.map);

    this.markers.forEach((m) => {
      L.marker([m.lat, m.lng]).addTo(this.map!).bindPopup(m.title || '');
    });
  }
}
