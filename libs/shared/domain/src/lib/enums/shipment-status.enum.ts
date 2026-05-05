/**
 * Shipment status enum - mirrors backend exactly
 */
export enum ShipmentStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
  POSTPONED = 'POSTPONED',
  RETURNED = 'RETURNED',
  CANCELLED = 'CANCELLED',
}

/**
 * Shipment type enum
 */
export enum ShipmentType {
  COD = 'COD',
  PREPAID = 'PREPAID',
  EXCHANGE = 'EXCHANGE',
}

/**
 * Return reason enum
 */
export enum ReturnReason {
  CUSTOMER_REFUSED = 'CUSTOMER_REFUSED',
  DAMAGED = 'DAMAGED',
  WRONG_ADDRESS = 'WRONG_ADDRESS',
  NOT_AVAILABLE = 'NOT_AVAILABLE',
  OTHER = 'OTHER',
}
