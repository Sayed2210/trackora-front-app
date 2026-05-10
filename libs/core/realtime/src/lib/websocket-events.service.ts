import { Injectable } from '@angular/core';
import { Observable, fromEventPattern } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { WebSocketService } from './websocket.service';
import {
  ShipmentStatusChangedEvent,
  ShipmentCreatedEvent,
  AssignmentCreatedEvent,
  AssignmentCancelledEvent,
  WalletBalanceUpdatedEvent,
  AdminStatsUpdatedEvent,
  ConnectionStatus,
} from '@trackora/shared/domain';

@Injectable({ providedIn: 'root' })
export class WebSocketEventsService {
  private readonly _shipmentStatusUpdated$: Observable<ShipmentStatusChangedEvent>;
  private readonly _shipmentCreated$: Observable<ShipmentCreatedEvent>;
  private readonly _assignmentCreated$: Observable<AssignmentCreatedEvent>;
  private readonly _assignmentCancelled$: Observable<AssignmentCancelledEvent>;
  private readonly _walletBalanceUpdated$: Observable<WalletBalanceUpdatedEvent>;
  private readonly _adminStatsUpdated$: Observable<AdminStatsUpdatedEvent>;

  constructor(private readonly ws: WebSocketService) {
    this._shipmentStatusUpdated$ = this.createEvent$('shipment:status_updated');
    this._shipmentCreated$ = this.createEvent$('shipment:created');
    this._assignmentCreated$ = this.createEvent$('assignment:created');
    this._assignmentCancelled$ = this.createEvent$('assignment:cancelled');
    this._walletBalanceUpdated$ = this.createEvent$('wallet:balance_updated');
    this._adminStatsUpdated$ = this.createEvent$('admin:stats_updated');
  }

  get shipmentStatusUpdated$(): Observable<ShipmentStatusChangedEvent> {
    return this._shipmentStatusUpdated$;
  }

  get shipmentCreated$(): Observable<ShipmentCreatedEvent> {
    return this._shipmentCreated$;
  }

  get assignmentCreated$(): Observable<AssignmentCreatedEvent> {
    return this._assignmentCreated$;
  }

  get assignmentCancelled$(): Observable<AssignmentCancelledEvent> {
    return this._assignmentCancelled$;
  }

  get walletBalanceUpdated$(): Observable<WalletBalanceUpdatedEvent> {
    return this._walletBalanceUpdated$;
  }

  get adminStatsUpdated$(): Observable<AdminStatsUpdatedEvent> {
    return this._adminStatsUpdated$;
  }

  get connectionStatus$(): Observable<ConnectionStatus> {
    return this.ws.status$;
  }

  subscribeToTracking(trackingNumber: string): void {
    this.ws.subscribeToTracking(trackingNumber);
  }

  unsubscribeFromTracking(trackingNumber: string): void {
    this.ws.unsubscribeFromTracking(trackingNumber);
  }

  private createEvent$<T>(eventName: string): Observable<T> {
    return fromEventPattern<T>(
      (handler) => this.ws.on(eventName, handler),
      (handler) => this.ws.off(eventName, handler)
    ).pipe(shareReplay({ bufferSize: 1, refCount: true }));
  }
}
