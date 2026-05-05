import { Injectable } from '@angular/core';
import { RealTimeTransport } from './realtime-transport.interface';

@Injectable({ providedIn: 'root' })
export class SseTransport implements RealTimeTransport {
  private eventSource: EventSource | null = null;
  private handlers = new Map<string, Set<Function>>();

  connect(): void {
    if (this.eventSource) return;
    this.eventSource = new EventSource('/api/v1/events/stream', {
      withCredentials: true,
    });
    this.eventSource.onmessage = (msg) => {
      try {
        const { event, data } = JSON.parse(msg.data);
        this.handlers.get(event)?.forEach((h) => h(data));
      } catch {
        // ignore malformed messages
      }
    };
  }

  disconnect(): void {
    this.eventSource?.close();
    this.eventSource = null;
  }

  on<T>(event: string, handler: (data: T) => void): void {
    if (!this.handlers.has(event)) this.handlers.set(event, new Set());
    this.handlers.get(event)!.add(handler);
  }

  off<T>(event: string, handler: (data: T) => void): void {
    this.handlers.get(event)?.delete(handler);
  }
}
