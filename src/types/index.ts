export type ConnectorType = 'CCS2' | 'Type 2 AC' | 'Bharat AC-001' | 'CHAdeMO' | 'GB/T';

export type ChargerSpeed = 'Slow AC' | 'Fast AC' | 'Fast DC' | 'Ultra Fast DC';

export interface Connector {
  id: string;
  type: ConnectorType;
  powerKw: number;
  speed: ChargerSpeed;
  tariffPerKwh: number;
  availableCount: number;
  totalCount: number;
  status: 'available' | 'busy' | 'offline';
}

export type NetworkProvider =
  | 'Tata Power EZ Charge'
  | 'Jio-bp pulse'
  | 'Statiq'
  | 'Zeon Charging'
  | 'Ather Grid'
  | 'Fortum Charge & Drive'
  | 'Kazam'
  | 'Shell Recharge';

export interface StationAmenity {
  id: string;
  name: string;
  icon: string;
}

export interface Review {
  id: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  date: string;
  comment: string;
  vehicleModel?: string;
}

export interface ChargingStation {
  id: string;
  name: string;
  network: NetworkProvider;
  address: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  rating: number;
  reviewCount: number;
  isOpen24Hours: boolean;
  operatingHours?: string;
  phoneNumber?: string;
  connectors: Connector[];
  amenities: string[];
  pricingDescription: string;
  parkingFee: 'Free' | 'Paid';
  isVerified: boolean;
  images: string[];
  reviews: Review[];
  distanceKm?: number;
}

export interface EVVehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  batteryCapacityKwh: number;
  maxDcChargingRateKw: number;
  certifiedRangeKm: number;
  realWorldRangeKm: number;
  compatibleConnectors: ConnectorType[];
  color: string;
}

export interface Booking {
  id: string;
  stationId: string;
  stationName: string;
  stationAddress: string;
  network: NetworkProvider;
  connectorType: ConnectorType;
  powerKw: number;
  date: string;
  timeSlot: string;
  durationMinutes: number;
  estimatedUnitsKwh: number;
  estimatedCostInr: number;
  vehicleName: string;
  status: 'Confirmed' | 'Active' | 'Completed' | 'Cancelled';
  bookingCode: string;
  createdAt: string;
}

export interface FilterState {
  searchQuery: string;
  connectorTypes: ConnectorType[];
  networks: NetworkProvider[];
  minPowerKw: number;
  onlyAvailable: boolean;
  only24x7: boolean;
  onlyVerified: boolean;
  freeParkingOnly: boolean;
  maxDistanceKm?: number;
  city: string;
}

export interface RouteStop {
  station: ChargingStation;
  distanceFromStartKm: number;
  recommendedChargeMinutes: number;
  chargeFromPercent: number;
  chargeToPercent: number;
  estimatedCostInr: number;
}

export interface TripPlanResult {
  origin: string;
  destination: string;
  totalDistanceKm: number;
  estimatedDriveTimeHours: number;
  totalChargingTimeMinutes: number;
  stops: RouteStop[];
  totalCostInr: number;
  carbonSavedKg: number;
}
