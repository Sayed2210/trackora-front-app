export interface ShipmentBuilderData {
  customerName: string;
  customerPhone: string;
  customerPhone2?: string;
  type: string;
  codAmount: number;
  governorate: string;
  city: string;
  street: string;
  building: string;
  addressText: string;
  zoneId?: string;
  productDescription: string;
  productValue: number;
  weight: number;
  pieces: number;
  notes?: string;
}

let shipmentCounter = 0;

export function buildValidShipment(runId?: string): ShipmentBuilderData {
  shipmentCounter++;
  const id = runId || `e2e-${Date.now()}-${shipmentCounter}`;
  return {
    customerName: `Test Customer ${id}`,
    customerPhone: '01012345678',
    type: 'DELIVERY',
    codAmount: 250,
    governorate: 'Cairo',
    city: 'Nasr City',
    street: 'Abbas El Akkad',
    building: '42',
    addressText: 'Near City Stars mall, building 42 floor 3',
    productDescription: `Test product ${id}`,
    productValue: 200,
    weight: 1,
    pieces: 1,
  };
}

export function buildInvalidShipment(): Partial<ShipmentBuilderData> {
  return {
    customerName: '',
    customerPhone: 'invalid',
    codAmount: -10,
    governorate: '',
    city: '',
    street: '',
    building: '',
    addressText: '',
    productDescription: '',
  };
}

export interface PlanBuilderData {
  name: string;
  code: string;
  price: number;
  billingCycle: string;
  currency: string;
  active: boolean;
  isPublic: boolean;
  description: string;
  monthlyShipments: number;
  maxAdmins: number;
  maxMerchants: number;
  maxCouriers: number;
}

let planCounter = 0;

export function buildValidPlan(runId?: string): PlanBuilderData {
  planCounter++;
  const id = runId || `e2e-${Date.now()}-${planCounter}`;
  return {
    name: `E2E Plan ${id}`,
    code: `e2e-plan-${id}`,
    price: 499.99,
    billingCycle: 'monthly',
    currency: 'EGP',
    active: true,
    isPublic: false,
    description: `Automated test plan ${id}`,
    monthlyShipments: 1000,
    maxAdmins: 5,
    maxMerchants: 10,
    maxCouriers: 20,
  };
}

export function buildInvalidPlan(): Partial<PlanBuilderData> {
  return {
    name: '',
    code: '',
    price: -1,
    billingCycle: '',
    monthlyShipments: 0,
    maxAdmins: 0,
  };
}
