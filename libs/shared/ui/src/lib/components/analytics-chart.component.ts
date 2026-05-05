import { Component, AfterViewInit, Input, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration } from 'chart.js';
import { auto } from 'chart.js/auto';

@Component({
  selector: 'app-analytics-chart',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="chart-wrapper"><canvas #chartCanvas></canvas></div>`,
  styles: [`
    .chart-wrapper { position: relative; height: 300px; width: 100%; }
    :host { display: block; }
  `],
})
export class AnalyticsChartComponent implements AfterViewInit, OnDestroy {
  @ViewChild('chartCanvas', { static: true }) chartCanvas!: ElementRef<HTMLCanvasElement>;
  @Input() type: 'line' | 'bar' | 'pie' | 'doughnut' = 'line';
  @Input() labels: string[] = [];
  @Input() datasets: Array<{ label: string; data: number[]; backgroundColor?: string | string[]; borderColor?: string }> = [];

  private chart?: Chart;

  ngAfterViewInit(): void {
    this.createChart();
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  private createChart(): void {
    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const config: ChartConfiguration = {
      type: this.type,
      data: {
        labels: this.labels,
        datasets: this.datasets.map((ds) => ({
          label: ds.label,
          data: ds.data,
          backgroundColor: ds.backgroundColor || 'rgba(0, 31, 63, 0.2)',
          borderColor: ds.borderColor || '#001F3F',
          borderWidth: 2,
          tension: 0.4,
          fill: this.type === 'line',
        })),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
          },
        },
        scales: this.type === 'pie' || this.type === 'doughnut' ? {} : {
          y: {
            beginAtZero: true,
          },
        },
      },
    };

    this.chart = new Chart(ctx, config);
  }

  updateChart(): void {
    if (!this.chart) return;
    this.chart.data.labels = this.labels;
    this.chart.data.datasets = this.datasets.map((ds) => ({
      label: ds.label,
      data: ds.data,
      backgroundColor: ds.backgroundColor || 'rgba(0, 31, 63, 0.2)',
      borderColor: ds.borderColor || '#001F3F',
      borderWidth: 2,
      tension: 0.4,
      fill: this.type === 'line',
    }));
    this.chart.update();
  }
}
