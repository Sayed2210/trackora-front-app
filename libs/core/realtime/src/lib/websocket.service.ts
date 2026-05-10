import { Injectable, OnDestroy } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from '@trackora/core/auth';
import { AuthRepository } from '@trackora/shared/data-access';
import { TokenStorageService } from '@trackora/core/auth';

@Injectable({ providedIn: 'root' })
export class WebSocketService implements OnDestroy {
  private socket: Socket | null = null;
  private readonly _status$ = new BehaviorSubject<'connected' | 'disconnected' | 'reconnecting'>('disconnected');
  readonly status$ = this._status$.asObservable();

  private lastEventId: string | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private readonly authService: AuthService,
    private readonly authRepo: AuthRepository,
    private readonly tokenStorage: TokenStorageService
  ) {}

  connect(): void {
    if (this.socket?.connected) return;

    const token = this.tokenStorage.getAccessToken();
    if (!token) {
      console.warn('[WS] No token available, skipping connection');
      return;
    }

    this.socket = io('/ws', {
      transports: ['websocket'],
      auth: { token: `Bearer ${token}` },
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 10000,
    });

    this.socket.on('connect', () => {
      this._status$.next('connected');
      this.requestMissedEvents();
    });

    this.socket.on('disconnect', (reason) => {
      this._status$.next('disconnected');
      if (reason === 'io server disconnect') {
        // Server forced disconnect — may need token refresh
        this.handleServerDisconnect();
      }
    });

    this.socket.on('reconnecting', () => {
      this._status$.next('reconnecting');
    });

    this.socket.on('connection:established', ({ userId, role }: { userId: string; role: string }) => {
      console.log(`[WS] Connected as ${role} (${userId})`);
    });

    this.socket.on('error', ({ message }: { message: string }) => {
      console.error('[WS] Server error:', message);
      if (message === 'Invalid or expired token') {
        this.refreshAndReconnect();
      }
    });
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
    this._status$.next('disconnected');
  }

  emit(event: string, data: unknown): void {
    this.socket?.emit(event, data);
  }

  on<T>(event: string, handler: (data: T) => void): void {
    this.socket?.on(event, handler as (data: unknown) => void);
  }

  off<T>(event: string, handler: (data: T) => void): void {
    this.socket?.off(event, handler as (data: unknown) => void);
  }

  subscribeToTracking(trackingNumber: string): void {
    this.emit('subscribe:tracking', { trackingNumber });
  }

  unsubscribeFromTracking(trackingNumber: string): void {
    this.emit('unsubscribe:tracking', { trackingNumber });
  }

  private requestMissedEvents(): void {
    if (!this.lastEventId) return;
    this.emit('sync:missed', { lastEventId: this.lastEventId });
  }

  private handleServerDisconnect(): void {
    this.reconnectTimer = setTimeout(() => this.connect(), 3000);
  }

  private refreshAndReconnect(): void {
    this.authRepo.refreshToken().subscribe({
      next: () => this.connect(),
      error: () => this.authService.logout(),
    });
  }

  updateLastEventId(eventId: string): void {
    this.lastEventId = eventId;
    localStorage.setItem('ws:lastEventId', eventId);
  }

  ngOnDestroy(): void {
    this.disconnect();
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
  }
}
