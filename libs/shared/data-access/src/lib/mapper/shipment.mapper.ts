import { Shipment, Address } from '@trackora/shared/domain';
import { ShipmentResponseDto } from '../dto/shipment.dto';

type ShipmentAddressDto = ShipmentResponseDto['address'] & {
  text?: string;
};

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
      address: ShipmentMapper.mapAddress(dto.address),
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

  private static mapAddress(dtoAddress?: ShipmentResponseDto['address']): Address {
    if (!dtoAddress) {
      return {
        id: '',
        street: '',
        building: '',
        governorate: '',
        city: '',
      };
    }

    const address = dtoAddress as ShipmentAddressDto;

    return {
      id: address.id ?? '',
      street: address.text ?? address.street ?? '',
      building: address.building ?? '',
      floor: address.floor,
      apartment: address.apartment,
      landmark: address.landmark,
      governorate: address.governorate,
      city: address.city,
      zone: address.zone,
      lat: address.lat,
      lng: address.lng,
      geocodingConfidence: address.geocodingConfidence,
    };
  }
}
