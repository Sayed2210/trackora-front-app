import { Injectable, Inject, InjectionToken } from '@angular/core';
import { RealTimeTransport } from './realtime-transport.interface';

export const REALTIME_TRANSPORT = new InjectionToken<RealTimeTransport>('REALTIME_TRANSPORT');

@Injectable({ providedIn: 'root' })
export class RealtimeService {
  constructor(
    @Inject(REALTIME_TRANSPORT) private readonly transport: RealTimeTransport
  ) {}

  subscribe<T>(event: string, handler: (data: T) => void): () => void {
    this.transport.on(event, handler);
    return () => this.transport.off(event, handler);
  }

  connect(): void {
    this.transport.connect();
  }

  disconnect(): void {
    this.transport.disconnect();
  }
}
