import { Injectable } from '@angular/core';
import { RealTimeTransport } from './realtime-transport.interface';

@Injectable({ providedIn: 'root' })
export class SseTransport implements RealTimeTransport {
  private eventSource: EventSource | null = null;
  private handlers = new Map<string, Set<(data: unknown) => void>>();

  connect(): void {
    if (this.eventSource) return;
    this.eventSource = new EventSource('/v1/events/stream', {
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
    const handlers = this.handlers.get(event) ?? new Set<(data: unknown) => void>();
    handlers.add(handler as (data: unknown) => void);
    this.handlers.set(event, handlers);
  }

  off<T>(event: string, handler: (data: T) => void): void {
    this.handlers.get(event)?.delete(handler as (data: unknown) => void);
  }
}
