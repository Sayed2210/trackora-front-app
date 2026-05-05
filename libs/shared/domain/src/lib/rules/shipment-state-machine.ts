import { ShipmentStatus } from '../enums/shipment-status.enum';

/**
 * Shipment state machine - mirrors backend transition matrix exactly
 */
export class ShipmentStateMachine {
  private static readonly ALLOWED_TRANSITIONS: Record<
    ShipmentStatus,
    ShipmentStatus[]
  > = {
    [ShipmentStatus.PENDING]: [
      ShipmentStatus.CONFIRMED,
      ShipmentStatus.CANCELLED,
    ],
    [ShipmentStatus.CONFIRMED]: [
      ShipmentStatus.OUT_FOR_DELIVERY,
      ShipmentStatus.CANCELLED,
    ],
    [ShipmentStatus.OUT_FOR_DELIVERY]: [
      ShipmentStatus.DELIVERED,
      ShipmentStatus.FAILED,
      ShipmentStatus.POSTPONED,
    ],
    [ShipmentStatus.DELIVERED]: [],
    [ShipmentStatus.FAILED]: [
      ShipmentStatus.OUT_FOR_DELIVERY,
      ShipmentStatus.RETURNED,
    ],
    [ShipmentStatus.POSTPONED]: [
      ShipmentStatus.OUT_FOR_DELIVERY,
      ShipmentStatus.FAILED,
    ],
    [ShipmentStatus.RETURNED]: [],
    [ShipmentStatus.CANCELLED]: [],
  };

  static canTransition(
    from: ShipmentStatus,
    to: ShipmentStatus
  ): boolean {
    return this.ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
  }

  static getAllowedTransitions(from: ShipmentStatus): ShipmentStatus[] {
    return this.ALLOWED_TRANSITIONS[from] ?? [];
  }

  static isTerminal(status: ShipmentStatus): boolean {
    return this.ALLOWED_TRANSITIONS[status]?.length === 0;
  }
}
