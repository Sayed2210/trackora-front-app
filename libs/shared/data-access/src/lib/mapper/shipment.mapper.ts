import { Shipment, Address, TimelineEvent } from '@trackora/shared/domain';
import { ShipmentResponseDto } from '../dto/shipment.dto';

export class ShipmentMapper {
  static toDomain(dto: ShipmentResponseDto): Shipment {
    return {
      id: dto.id,
      trackingNumber: dto.trackingNumber,
      merchantId: dto.merchantId,
      merchantName: dto.merchantName,
      customerName: dto.customerName,
      customerPhone: dto.customerPhone,
      customerPhoneMasked: dto.customerPhone
        ? `${dto.customerPhone.slice(0, 4)}*****${dto.customerPhone.slice(-2)}`
        : undefined,
      address: this.mapAddress(dto.address),
      status: dto.status,
      type: dto.type,
      codAmount: dto.codAmount,
      deliveryFee: dto.deliveryFee,
      weight: dto.weight,
      notes: dto.notes,
      returnReason: dto.returnReason,
      assignedCourierId: dto.assignedCourierId,
      assignedCourierName: dto.assignedCourierName,
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
      estimatedDelivery: dto.estimatedDelivery,
    };
  }

  private static mapAddress(dtoAddress: ShipmentResponseDto['address']): Address {
    return {
      id: (dtoAddress as any).id ?? '',
      street: (dtoAddress as any).text ?? (dtoAddress as any).street ?? '',
      building: (dtoAddress as any).building ?? '',
      floor: (dtoAddress as any).floor,
      apartment: (dtoAddress as any).apartment,
      landmark: dtoAddress.landmark,
      governorate: dtoAddress.governorate,
      city: dtoAddress.city,
      zone: dtoAddress.zone,
      lat: (dtoAddress as any).lat,
      lng: (dtoAddress as any).lng,
      geocodingConfidence: (dtoAddress as any).geocodingConfidence,
    };
  }
}
