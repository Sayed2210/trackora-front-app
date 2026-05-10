/** Real-time event interfaces for Socket.IO layer */

import { ShipmentStatus, ShipmentType } from './enums/shipment-status.enum';

export interface ShipmentStatusChangedEvent {
  shipmentId: string;
  trackingNumber: string;
  merchantId: string;
  courierId?: string;
  previousStatus: ShipmentStatus;
  newStatus: ShipmentStatus;
  codAmount: number;
  type: ShipmentType;
  updatedAt: string;
}

export interface ShipmentCreatedEvent {
  shipmentId: string;
  trackingNumber: string;
  merchantId: string;
  status: ShipmentStatus;
  codAmount: number;
  type: ShipmentType;
}

export interface AssignmentCreatedEvent {
  assignmentId: string;
  shipmentId: string;
  trackingNumber: string;
  customerName: string;
  addressText: string;
  codAmount: string;
  assignmentType: string;
}

export interface AssignmentCancelledEvent {
  assignmentId: string;
  trackingNumber: string;
  reason: string;
}

export interface WalletBalanceUpdatedEvent {
  walletId: string;
  merchantId: string;
  balance: number;
  transactionType: string;
  amount: number;
  runningBalance: number;
}

export interface AdminStatsUpdatedEvent {
  activeShipments: number;
  deliveredToday: number;
  failedToday: number;
  couriersAvailable: number;
  codCollectedToday: number;
}

export type ConnectionStatus = 'connected' | 'disconnected' | 'reconnecting';
