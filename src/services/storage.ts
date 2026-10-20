import {
  Charger,
  BookingRequest,
  UserProfile,
  ChargerRegistrationFormData
} from '../types/charger';

const STORAGE_KEYS = {
  CHARGERS: 'plugmitra_chargers_v2',
  SAVED_IDS: 'plugmitra_saved_ids',
  BOOKINGS: 'plugmitra_bookings',
  PROFILE: 'plugmitra_user_profile',
  REPORTS: 'plugmitra_reports',
};

// Initial realistic community chargers across Chennai with no invented reviews/ratings
const INITIAL_CHARGERS: Charger[] = [
  {
    id: 'ch-adyar-01',
    title: 'Adyar Green EV Charging Bay',
    propertyName: 'Karpagam Gardens Residential Enclave',
    hostName: 'Suresh Ramanathan',
    phone: '+91 94440 12345',
    email: 'suresh.r@plugmitra.host',
    area: 'Adyar',
    address: 'Plot 18, 2nd Main Road, Karpagam Gardens',
    landmark: 'Behind Adyar Bus Depot & Gandhi Nagar Circle',
    city: 'Chennai',
    pincode: '600020',
    latitude: 13.0035,
    longitude: 80.2558,
    parkingSlotNumber: 'Slot G-03 (Ground Floor, Covered)',
    isCoveredParking: true,
    chargerType: 'Type 2 AC (Fast AC, up to 22 kW)',
    powerType: 'AC',
    powerOutputKw: 7.4,
    compatibleVehicles: ['4-Wheeler', '2-Wheeler'],
    accessType: 'Independent House / Villa Driveway',
    operatingHours: '06:00 AM - 10:30 PM (Daily)',
    pricePerKwh: 14.5,
    parkingFeePerHour: 0,
    amenities: ['cctv', 'covered', 'lit', 'wifi', 'restroom'],
    specialInstructions: 'Enter through the left metal gate. Ground slot G-03 has a wall-mounted green box. Call host on arrival for switch toggle.',
    photos: [
      'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1558441719-8b489c63f7ce?auto=format&fit=crop&w=800&q=80'
    ],
    listingSource: 'Community Host',
    verificationStatus: 'Community Verified',
    createdAt: '2026-09-15T10:00:00Z',
    isResidential: true,
    isActive: true,
    isApproved: true,
  },
  {
    id: 'ch-omr-02',
    title: 'Thoraipakkam Tech Park Hub',
    propertyName: 'ASV Suntech Business Park',
    hostName: 'Facility Admin (Praveen K.)',
    phone: '+91 98841 87654',
    email: 'admin.infra@asvpark.in',
    area: 'OMR - Thoraipakkam',
    address: 'Survey 142/2, Old Mahabalipuram Road (OMR)',
    landmark: 'Opposite Cognizant Taramani Campus Link',
    city: 'Chennai',
    pincode: '600096',
    latitude: 12.9365,
    longitude: 80.2325,
    parkingSlotNumber: 'Basement Bay B2 - Slot 114',
    isCoveredParking: true,
    chargerType: 'CCS2 (DC Fast Charger, 25-60+ kW)',
    powerType: 'DC',
    powerOutputKw: 30.0,
    compatibleVehicles: ['4-Wheeler'],
    accessType: 'Commercial Shop / Complex',
    operatingHours: '24 Hours / 7 Days',
    pricePerKwh: 21.0,
    parkingFeePerHour: 20,
    amenities: ['cctv', 'covered', 'lit', 'cafe', 'restroom'],
    specialInstructions: 'Collect parking ticket at Ramp 2 entry. EV bays are painted green near Pillar B-18. Security will validate parking token.',
    photos: [
      'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=800&q=80'
    ],
    listingSource: 'PlugMitra Host Partner',
    verificationStatus: 'Community Verified',
    createdAt: '2026-09-20T11:30:00Z',
    isResidential: false,
    isActive: true,
    isApproved: true,
  },
  {
    id: 'ch-annanagar-03',
    title: 'Anna Nagar West Socket Bay',
    propertyName: 'Vasantham Residential Complex',
    hostName: 'Meenakshi Sundaram',
    phone: '+91 97910 33445',
    email: 'meenakshi.s@gmail.com',
    area: 'Anna Nagar',
    address: '15, 6th Avenue, Anna Nagar West Extension',
    landmark: 'Near Roundtana & Thirumangalam Metro Station',
    city: 'Chennai',
    pincode: '600040',
    latitude: 13.0862,
    longitude: 80.2085,
    parkingSlotNumber: 'Slot 4B (Open Stilt)',
    isCoveredParking: false,
    chargerType: '15A Standard 3-Pin (Slow AC, 3.3 kW)',
    powerType: 'AC',
    powerOutputKw: 3.3,
    compatibleVehicles: ['2-Wheeler', '3-Wheeler', '4-Wheeler'],
    accessType: 'Apartment / Gated Society Parking',
    operatingHours: '07:00 AM - 09:00 PM',
    pricePerKwh: 12.0,
    parkingFeePerHour: 0,
    amenities: ['cctv', 'lit', 'wifi'],
    specialInstructions: 'Inform guard at gate you are visiting Flat 4B for EV charging. Weatherproof 15A socket with MCB available.',
    photos: [
      'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80'
    ],
    listingSource: 'Community Host',
    verificationStatus: 'Host Self-Reported',
    createdAt: '2026-10-02T14:15:00Z',
    isResidential: true,
    isActive: true,
    isApproved: true,
  },
  {
    id: 'ch-velachery-04',
    title: 'Velachery Bypass Fast Point',
    propertyName: 'Phoenix Marketcity Outer Bay',
    hostName: 'Retail Fleet Manager',
    phone: '+91 98400 99881',
    email: 'charging@phoenixfleet.in',
    area: 'Velachery',
    address: '142, Velachery Main Road, Indira Gandhi Nagar',
    landmark: 'Next to Velachery MRTS Station Bridge',
    city: 'Chennai',
    pincode: '600042',
    latitude: 12.9772,
    longitude: 80.2225,
    parkingSlotNumber: 'Surface Bay P-1',
    isCoveredParking: false,
    chargerType: 'CCS2 (DC Fast Charger, 25-60+ kW)',
    powerType: 'DC',
    powerOutputKw: 60.0,
    compatibleVehicles: ['4-Wheeler'],
    accessType: 'Commercial Shop / Complex',
    operatingHours: '24 Hours / 7 Days',
    pricePerKwh: 23.5,
    parkingFeePerHour: 30,
    amenities: ['cctv', 'lit', 'cafe', 'restroom', 'wifi'],
    specialInstructions: 'Drive past entrance gate to designated EV charging lane on the right. Direct credit/UPI terminal enabled.',
    photos: [
      'https://images.unsplash.com/photo-1558441719-8b489c63f7ce?auto=format&fit=crop&w=800&q=80'
    ],
    listingSource: 'PlugMitra Host Partner',
    verificationStatus: 'Community Verified',
    createdAt: '2026-10-05T08:00:00Z',
    isResidential: false,
    isActive: true,
    isApproved: true,
  },
  {
    id: 'ch-besant-05',
    title: 'Besant Nagar Coastal Driveway Charger',
    propertyName: 'Blue Lagoon Residences',
    hostName: 'Arjun Swaminathan',
    phone: '+91 99620 44556',
    email: 'arjun.swami@gmail.com',
    area: 'Besant Nagar',
    address: '4th Avenue, Near Elliot’s Beach Promenade',
    landmark: '2 mins walk from Schmidt Memorial',
    city: 'Chennai',
    pincode: '600090',
    latitude: 13.0005,
    longitude: 80.2678,
    parkingSlotNumber: 'Driveway Bay A',
    isCoveredParking: true,
    chargerType: 'Type 2 AC (Fast AC, up to 22 kW)',
    powerType: 'AC',
    powerOutputKw: 11.0,
    compatibleVehicles: ['4-Wheeler', '2-Wheeler'],
    accessType: 'Independent House / Villa Driveway',
    operatingHours: null, // intentionally null to satisfy 'tariff / hours when known'
    pricePerKwh: null, // tariff not set by host yet
    parkingFeePerHour: 0,
    amenities: ['cctv', 'covered', 'lit'],
    specialInstructions: 'Wide gate accommodating SUVs. Host requests contacting via call 30 mins prior to ensure slot availability.',
    photos: [],
    listingSource: 'Community Host',
    verificationStatus: 'Awaiting First Checkin',
    createdAt: '2026-10-10T16:20:00Z',
    isResidential: true,
    isActive: true,
    isApproved: true,
  },
  {
    id: 'ch-tnagar-06',
    title: 'T. Nagar Commercial Plaza AC Hub',
    propertyName: 'Pondy Bazaar Retail Tower',
    hostName: 'Karthik N.',
    phone: '+91 98410 77112',
    email: 'karthik.ops@pondyplaza.com',
    area: 'T. Nagar',
    address: 'Pondy Bazaar, Near Panagal Park',
    landmark: 'Adjacent to T. Nagar Multilevel Parking',
    city: 'Chennai',
    pincode: '600017',
    latitude: 13.0425,
    longitude: 80.2355,
    parkingSlotNumber: 'P-Basement Slot 18',
    isCoveredParking: true,
    chargerType: 'Bharat AC-001 (Slow AC)',
    powerType: 'AC',
    powerOutputKw: 10.0,
    compatibleVehicles: ['2-Wheeler', '3-Wheeler', '4-Wheeler'],
    accessType: 'Commercial Shop / Complex',
    operatingHours: '09:00 AM - 11:00 PM',
    pricePerKwh: 16.0,
    parkingFeePerHour: 20,
    amenities: ['cctv', 'covered', 'lit', 'cafe', 'restroom'],
    specialInstructions: 'Enter through North Ramp. Dedicated three-phase AC socket box with individual meter display.',
    photos: [
      'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=800&q=80'
    ],
    listingSource: 'Community Host',
    verificationStatus: 'Host Self-Reported',
    createdAt: '2026-10-12T09:45:00Z',
    isResidential: false,
    isActive: true,
    isApproved: true,
  }
];

// Initial demo bookings clearly labelled
const INITIAL_BOOKINGS: BookingRequest[] = [
  {
    id: 'bk-demo-01',
    chargerId: 'ch-adyar-01',
    chargerTitle: 'Adyar Green EV Charging Bay',
    chargerArea: 'Adyar',
    parkingSlotNumber: 'Slot G-03 (Ground Floor, Covered)',
    requestedDate: '2026-10-22',
    requestedTimeSlot: '10:00 AM - 12:00 PM',
    estimatedHours: 2,
    vehicleModel: 'Tata Nexon EV Max',
    vehicleNumber: 'TN 07 CM 4521',
    status: 'Confirmed',
    createdAt: '2026-10-18T14:30:00Z',
    tariffPerKwh: 14.5,
    totalEstimatedAmount: 290,
    isDemo: true,
  },
  {
    id: 'bk-demo-02',
    chargerId: 'ch-omr-02',
    chargerTitle: 'Thoraipakkam Tech Park Hub',
    chargerArea: 'OMR - Thoraipakkam',
    parkingSlotNumber: 'Basement Bay B2 - Slot 114',
    requestedDate: '2026-10-24',
    requestedTimeSlot: '02:00 PM - 03:00 PM',
    estimatedHours: 1,
    vehicleModel: 'MG ZS EV',
    vehicleNumber: 'TN 09 BD 8872',
    status: 'Pending Host Approval',
    createdAt: '2026-10-19T08:15:00Z',
    tariffPerKwh: 21.0,
    totalEstimatedAmount: 350,
    isDemo: true,
  }
];

const INITIAL_PROFILE: UserProfile = {
  name: 'Vishal Kabilan',
  email: 'vishalkabil51@gmail.com',
  phone: '+91 98765 43210',
  vehicleMake: 'Tata Motors',
  vehicleModel: 'Nexon EV Long Range',
  vehicleRegNumber: 'TN 07 CK 9012',
  connectorPreference: 'CCS2 (DC Fast Charger, 25-60+ kW)',
  batteryCapacityKwh: 40.5,
  preferredArea: 'Adyar / OMR',
  isVerifiedDriver: true,
};

// Storage helper functions
export const StorageService = {
  getChargers(): Charger[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CHARGERS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.CHARGERS, JSON.stringify(INITIAL_CHARGERS));
        return INITIAL_CHARGERS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_CHARGERS;
    }
  },

  getChargerById(id: string): Charger | undefined {
    const list = this.getChargers();
    return list.find((c) => c.id === id);
  },

  saveNewCharger(formData: ChargerRegistrationFormData, isApproved: boolean = false, userId?: string): Charger {
    const chargers = this.getChargers();
    const newCharger: Charger = {
      id: `ch-user-${Date.now()}`,
      ownerId: userId || 'usr_anonymous',
      title: formData.title.trim() || `${formData.area} Community Point`,
      propertyName: formData.propertyName.trim() || formData.title,
      hostName: formData.hostName.trim() || 'Community Host',
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      area: formData.area.trim(),
      address: formData.address.trim(),
      landmark: formData.landmark.trim(),
      city: formData.city.trim() || 'Chennai',
      pincode: formData.pincode.trim(),
      latitude: formData.latitude,
      longitude: formData.longitude,
      parkingSlotNumber: formData.parkingSlotNumber.trim(),
      isCoveredParking: formData.isCoveredParking,
      chargerType: formData.chargerType,
      powerType: formData.powerType,
      powerOutputKw: formData.powerOutputKw,
      compatibleVehicles: formData.compatibleVehicles,
      accessType: formData.accessType,
      operatingHours: formData.operatingHours.trim() || null,
      pricePerKwh: formData.pricePerKwh ? parseFloat(formData.pricePerKwh) : null,
      parkingFeePerHour: formData.parkingFeePerHour ? parseFloat(formData.parkingFeePerHour) : 0,
      amenities: formData.amenities,
      specialInstructions: formData.specialInstructions.trim(),
      photos: formData.photos.map((p) => p.previewUrl),
      listingSource: 'Community Host',
      verificationStatus: isApproved ? 'Community Verified' : 'Host Self-Reported',
      createdAt: new Date().toISOString(),
      isUserCreated: true,
      isResidential: formData.accessType.includes('House') || formData.accessType.includes('Apartment'),
      isActive: isApproved,
      isApproved: isApproved,
      status: isApproved ? 'approved' : 'pending',
    };

    const updated = [newCharger, ...chargers];
    localStorage.setItem(STORAGE_KEYS.CHARGERS, JSON.stringify(updated));
    return newCharger;
  },

  updateChargerStatus(id: string, isActive: boolean): void {
    const list = this.getChargers().map((c) => {
      if (c.id === id) {
        return { ...c, isActive };
      }
      return c;
    });
    localStorage.setItem(STORAGE_KEYS.CHARGERS, JSON.stringify(list));
  },

  updateChargerApproval(id: string, status: 'approved' | 'rejected'): void {
    const list = this.getChargers().map((c) => {
      if (c.id === id) {
        const approved = status === 'approved';
        return {
          ...c,
          isApproved: approved,
          isActive: approved,
          status,
          verificationStatus: (approved ? 'Community Verified' : c.verificationStatus) as Charger['verificationStatus'],
        };
      }
      return c;
    });
    localStorage.setItem(STORAGE_KEYS.CHARGERS, JSON.stringify(list));
  },

  deleteCharger(id: string): void {
    const list = this.getChargers().filter((c) => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.CHARGERS, JSON.stringify(list));
  },

  // Saved / Bookmark IDs (scoped per user)
  getSavedIds(userId?: string): string[] {
    try {
      const key = userId ? `${STORAGE_KEYS.SAVED_IDS}_${userId}` : STORAGE_KEYS.SAVED_IDS;
      const data = localStorage.getItem(key);
      if (data) return JSON.parse(data);
      // For initial guest demo:
      if (!userId) {
        return ['ch-adyar-01'];
      }
      return [];
    } catch {
      return [];
    }
  },

  isSaved(id: string, userId?: string): boolean {
    return this.getSavedIds(userId).includes(id);
  },

  toggleSave(id: string, userId?: string): boolean {
    const key = userId ? `${STORAGE_KEYS.SAVED_IDS}_${userId}` : STORAGE_KEYS.SAVED_IDS;
    const ids = this.getSavedIds(userId);
    let updated: string[];
    let nowSaved = false;
    if (ids.includes(id)) {
      updated = ids.filter((item) => item !== id);
    } else {
      updated = [...ids, id];
      nowSaved = true;
    }
    localStorage.setItem(key, JSON.stringify(updated));
    return nowSaved;
  },

  getSavedChargers(userId?: string): Charger[] {
    const savedIds = this.getSavedIds(userId);
    return this.getChargers().filter((c) => savedIds.includes(c.id));
  },

  // Bookings (scoped per user)
  getBookings(userId?: string): BookingRequest[] {
    try {
      const key = userId ? `${STORAGE_KEYS.BOOKINGS}_${userId}` : STORAGE_KEYS.BOOKINGS;
      const data = localStorage.getItem(key);
      if (!data) {
        if (!userId) {
          localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(INITIAL_BOOKINGS));
          return INITIAL_BOOKINGS;
        }
        return [];
      }
      return JSON.parse(data);
    } catch {
      return !userId ? INITIAL_BOOKINGS : [];
    }
  },

  createBooking(booking: Omit<BookingRequest, 'id' | 'createdAt'>, userId?: string): BookingRequest {
    const key = userId ? `${STORAGE_KEYS.BOOKINGS}_${userId}` : STORAGE_KEYS.BOOKINGS;
    const list = this.getBookings(userId);
    const newBooking: BookingRequest = {
      ...booking,
      id: `bk-${Date.now()}`,
      createdAt: new Date().toISOString(),
      isDemo: false,
    };
    const updated = [newBooking, ...list];
    localStorage.setItem(key, JSON.stringify(updated));
    return newBooking;
  },

  updateBookingStatus(id: string, status: BookingRequest['status'], userId?: string): void {
    const key = userId ? `${STORAGE_KEYS.BOOKINGS}_${userId}` : STORAGE_KEYS.BOOKINGS;
    const list = this.getBookings(userId).map((b) => (b.id === id ? { ...b, status } : b));
    localStorage.setItem(key, JSON.stringify(list));
  },

  // User Profile (scoped per user)
  getUserProfile(userId?: string): UserProfile {
    try {
      if (userId) {
        const userSpecific = localStorage.getItem(`plugmitra_profile_${userId}`);
        if (userSpecific) {
          const parsed = JSON.parse(userSpecific);
          return {
            name: parsed.full_name || parsed.name || 'EV Driver',
            email: parsed.email || '',
            phone: parsed.phone || '',
            vehicleMake: parsed.vehicle_make || 'Tata Motors',
            vehicleModel: parsed.vehicle_model || 'Nexon EV Long Range',
            vehicleRegNumber: parsed.vehicle_reg_number || 'TN 07 CK 9012',
            connectorPreference: parsed.connector_preference || 'CCS2 (DC Fast Charger, 25-60+ kW)',
            batteryCapacityKwh: parsed.battery_capacity_kwh || 40.5,
            preferredArea: parsed.preferred_area || 'Chennai',
            isVerifiedDriver: true,
          };
        }
      }
      const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
      return data ? JSON.parse(data) : INITIAL_PROFILE;
    } catch {
      return INITIAL_PROFILE;
    }
  },

  saveUserProfile(profile: UserProfile, userId?: string): void {
    if (userId) {
      const userSpecific = {
        id: userId,
        email: profile.email,
        full_name: profile.name,
        phone: profile.phone,
        vehicle_make: profile.vehicleMake,
        vehicle_model: profile.vehicleModel,
        vehicle_reg_number: profile.vehicleRegNumber,
        connector_preference: profile.connectorPreference,
        battery_capacity_kwh: profile.batteryCapacityKwh,
        preferred_area: profile.preferredArea,
      };
      localStorage.setItem(`plugmitra_profile_${userId}`, JSON.stringify(userSpecific));
    }
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  },

  // Reports
  reportListing(chargerId: string, reason: string, details: string): void {
    try {
      const prev = JSON.parse(localStorage.getItem(STORAGE_KEYS.REPORTS) || '[]');
      prev.push({
        id: `rep-${Date.now()}`,
        chargerId,
        reason,
        details,
        reportedAt: new Date().toISOString(),
      });
      localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(prev));
    } catch {
      // ignore
    }
  },

  resetAllData(): void {
    localStorage.removeItem(STORAGE_KEYS.CHARGERS);
    localStorage.removeItem(STORAGE_KEYS.SAVED_IDS);
    localStorage.removeItem(STORAGE_KEYS.BOOKINGS);
    localStorage.removeItem(STORAGE_KEYS.PROFILE);
    localStorage.removeItem(STORAGE_KEYS.REPORTS);
  }
};
