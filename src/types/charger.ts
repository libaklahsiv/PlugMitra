export type ChargerType =
  | 'Type 2 AC (Fast AC, up to 22 kW)'
  | 'CCS2 (DC Fast Charger, 25-60+ kW)'
  | '15A Standard 3-Pin (Slow AC, 3.3 kW)'
  | 'Bharat AC-001 (Slow AC)'
  | 'Bharat DC-001 (15 kW DC)'
  | 'CHAdeMO';

export type PowerType = 'AC' | 'DC';

export type VehicleType = '2-Wheeler' | '3-Wheeler' | '4-Wheeler';

export type AccessType =
  | 'Independent House / Villa Driveway'
  | 'Apartment / Gated Society Parking'
  | 'Commercial Shop / Complex'
  | 'Office / IT Tech Park'
  | 'Open Dedicated Parking Lot';

export type ListingSource = 'Community Host' | 'Public Utility' | 'PlugMitra Host Partner';

export type VerificationStatus = 'Host Self-Reported' | 'Community Verified' | 'Awaiting First Checkin';

export interface LocalPhoto {
  id: string;
  name: string;
  previewUrl: string;
  size: number;
  file?: File;
  isPrivate?: boolean;
}

export interface Charger {
  id: string;
  ownerId?: string;
  title: string;
  propertyName: string;
  hostName: string;
  phone?: string;
  email?: string;
  area: string;
  address: string;
  landmark?: string;
  city: string;
  pincode: string;
  latitude: number;
  longitude: number;
  parkingSlotNumber: string;
  isCoveredParking: boolean;
  chargerType: ChargerType;
  powerType: PowerType;
  powerOutputKw: number;
  compatibleVehicles: VehicleType[];
  accessType: AccessType;
  operatingHours: string | null;
  pricePerKwh: number | null;
  parkingFeePerHour: number | null;
  amenities: string[];
  specialInstructions: string;
  photos: string[];
  listingSource: ListingSource;
  verificationStatus: VerificationStatus;
  createdAt: string;
  isUserCreated?: boolean;
  isResidential: boolean;
  isActive: boolean;
  isApproved: boolean;
  status?: 'pending' | 'approved' | 'rejected';
}

export interface ChargerRegistrationFormData {
  propertyName: string;
  title: string;
  hostName: string;
  phone: string;
  email: string;
  address: string;
  landmark: string;
  area: string;
  city: string;
  pincode: string;
  latitude: number;
  longitude: number;
  parkingSlotNumber: string;
  isCoveredParking: boolean;
  chargerType: ChargerType;
  powerType: PowerType;
  powerOutputKw: number;
  compatibleVehicles: VehicleType[];
  accessType: AccessType;
  operatingHours: string;
  pricePerKwh: string;
  parkingFeePerHour: string;
  amenities: string[];
  specialInstructions: string;
  photos: LocalPhoto[];
}

export interface BookingRequest {
  id: string;
  chargerId: string;
  chargerTitle: string;
  chargerArea: string;
  parkingSlotNumber: string;
  requestedDate: string;
  requestedTimeSlot: string;
  estimatedHours: number;
  vehicleModel: string;
  vehicleNumber: string;
  status: 'Pending Host Approval' | 'Confirmed' | 'Rejected' | 'Completed';
  createdAt: string;
  tariffPerKwh: number | null;
  totalEstimatedAmount?: number;
  isDemo?: boolean;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleRegNumber: string;
  connectorPreference: ChargerType;
  batteryCapacityKwh: number;
  preferredArea: string;
  isVerifiedDriver: boolean;
}

export const CHENNAI_DEFAULT_COORDINATES: { lat: number; lng: number } = {
  lat: 13.0827,
  lng: 80.2707,
};

export const CHENNAI_NEIGHBORHOODS = [
  { name: 'Adyar', lat: 13.0012, lng: 80.2565 },
  { name: 'Anna Nagar', lat: 13.0850, lng: 80.2101 },
  { name: 'T. Nagar', lat: 13.0418, lng: 80.2341 },
  { name: 'OMR - Thoraipakkam', lat: 12.9352, lng: 80.2312 },
  { name: 'Velachery', lat: 12.9759, lng: 80.2212 },
  { name: 'Besant Nagar', lat: 13.0001, lng: 80.2667 },
  { name: 'Nungambakkam', lat: 13.0569, lng: 80.2425 },
  { name: 'Guindy', lat: 13.0067, lng: 80.2021 },
  { name: 'Mylapore', lat: 13.0368, lng: 80.2676 },
  { name: 'Porur', lat: 13.0382, lng: 80.1565 },
  { name: 'Tambaram', lat: 12.9249, lng: 80.1000 },
  { name: 'Perungudi (OMR)', lat: 12.9654, lng: 80.2461 },
  { name: 'ECR - Kottivakkam', lat: 12.9650, lng: 80.2580 },
  { name: 'Alwarpet', lat: 13.0333, lng: 80.2500 },
];
