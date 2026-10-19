import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Zap,
  MapPin,
  Car,
  Clock,
  Shield,
  Wifi,
  Coffee,
  CheckCircle,
  Copy,
  Info,
  ChevronRight,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { InteractiveMap } from './InteractiveMap';
import { PhotoUploader } from './PhotoUploader';
import {
  ChargerRegistrationFormData,
  ChargerType,
  VehicleType,
  AccessType,
  LocalPhoto,
  CHENNAI_DEFAULT_COORDINATES
} from '../types/charger';

const CHARGER_TYPES: ChargerType[] = [
  'Type 2 AC (Fast AC, up to 22 kW)',
  'CCS2 (DC Fast Charger, 25-60+ kW)',
  '15A Standard 3-Pin (Slow AC, 3.3 kW)',
  'Bharat AC-001 (Slow AC)',
  'Bharat DC-001 (15 kW DC)',
  'CHAdeMO',
];

const ACCESS_TYPES: AccessType[] = [
  'Independent House / Villa Driveway',
  'Apartment / Gated Society Parking',
  'Commercial Shop / Complex',
  'Office / IT Tech Park',
  'Open Dedicated Parking Lot',
];

const VEHICLE_OPTIONS: VehicleType[] = ['2-Wheeler', '3-Wheeler', '4-Wheeler'];

const AMENITY_OPTIONS = [
  { id: 'cctv', label: 'CCTV / Security Guard', icon: Shield },
  { id: 'wifi', label: 'Free Wi-Fi', icon: Wifi },
  { id: 'cafe', label: 'Cafe / Eatery Nearby', icon: Coffee },
  { id: 'covered', label: '100% Covered Roof', icon: Car },
  { id: 'restroom', label: 'Clean Restroom Available', icon: CheckCircle },
  { id: 'lit', label: 'Well-lit at Night', icon: Sparkles },
];

interface AddChargerFormProps {
  onSuccessNavigate?: () => void;
}

export const AddChargerForm: React.FC<AddChargerFormProps> = ({ onSuccessNavigate }) => {
  const [searchParams] = useSearchParams();
  const urlLat = searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : null;
  const urlLng = searchParams.get('lng') ? parseFloat(searchParams.get('lng')!) : null;
  const [formData, setFormData] = useState<ChargerRegistrationFormData>({
    title: 'Adyar Green EV Hub',
    hostName: 'Kabilan V.',
    phone: '+91 98765 43210',
    email: 'kabilan@plugmitra.in',
    address: 'No. 42, 3rd Cross Street, Gandhinagar',
    landmark: 'Opposite Adyar Ananda Bhavan',
    area: 'Adyar',
    city: 'Chennai',
    pincode: '600020',
    latitude: CHENNAI_DEFAULT_COORDINATES.lat,
    longitude: CHENNAI_DEFAULT_COORDINATES.lng,
    parkingSlotNumber: 'Slot P-04 (Ground Level)',
    isCoveredParking: true,
    chargerType: 'Type 2 AC (Fast AC, up to 22 kW)',
    powerOutputKw: 7.4,
    compatibleVehicles: ['4-Wheeler', '2-Wheeler'],
    accessType: 'Independent House / Villa Driveway',
    operatingHours: '24 Hours / 7 Days',
    pricePerKwh: '15',
    parkingFeePerHour: '0',
    amenities: ['cctv', 'covered', 'lit', 'wifi'],
    specialInstructions: 'Ring the bell or call host upon arrival for gate opening. Auto-cut off enabled.',
    photos: [],
  });

  const [copiedCoords, setCopiedCoords] = useState(false);
  const [submittedData, setSubmittedData] = useState<ChargerRegistrationFormData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (urlLat !== null && !isNaN(urlLat) && urlLng !== null && !isNaN(urlLng)) {
      setFormData((prev) => ({
        ...prev,
        latitude: urlLat,
        longitude: urlLng,
      }));
    }
  }, [urlLat, urlLng]);

  const handleLocationChange = (lat: number, lng: number) => {
    setFormData((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lng,
    }));
  };

  const handleManualCoordChange = (field: 'latitude' | 'longitude', value: string) => {
    const num = parseFloat(value);
    if (!isNaN(num)) {
      setFormData((prev) => ({
        ...prev,
        [field]: num,
      }));
    }
  };

  const handleVehicleToggle = (v: VehicleType) => {
    setFormData((prev) => {
      const exists = prev.compatibleVehicles.includes(v);
      return {
        ...prev,
        compatibleVehicles: exists
          ? prev.compatibleVehicles.filter((item) => item !== v)
          : [...prev.compatibleVehicles, v],
      };
    });
  };

  const handleAmenityToggle = (amenityId: string) => {
    setFormData((prev) => {
      const exists = prev.amenities.includes(amenityId);
      return {
        ...prev,
        amenities: exists
          ? prev.amenities.filter((item) => item !== amenityId)
          : [...prev.amenities, amenityId],
      };
    });
  };

  const handlePhotosChange = (photos: LocalPhoto[]) => {
    setFormData((prev) => ({ ...prev, photos }));
  };

  const copyCoordinates = () => {
    navigator.clipboard.writeText(`${formData.latitude}, ${formData.longitude}`);
    setCopiedCoords(true);
    setTimeout(() => setCopiedCoords(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmittedData({ ...formData });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 400);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6">
      {/* Submission Success Banner */}
      {submittedData && (
        <div className="mb-8 p-6 bg-emerald-50 border-2 border-emerald-500 rounded-3xl shadow-soft animate-slide-up">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-3 bg-emerald-600 text-white rounded-2xl shadow-sm shrink-0">
                <CheckCircle className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-emerald-950">
                  Charger Registered Successfully!
                </h3>
                <p className="text-sm text-emerald-800 mt-1">
                  Your listing for <span className="font-semibold">{submittedData.title}</span> at Parking Slot{' '}
                  <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-emerald-300">
                    {submittedData.parkingSlotNumber}
                  </span>{' '}
                  has been verified locally.
                </p>
                <div className="mt-2 text-xs text-emerald-700 flex flex-wrap gap-2">
                  <span className="bg-emerald-100/80 px-2.5 py-1 rounded-full font-mono">
                    Lat: {submittedData.latitude.toFixed(6)}, Lng: {submittedData.longitude.toFixed(6)}
                  </span>
                  <span className="bg-emerald-100/80 px-2.5 py-1 rounded-full">
                    {submittedData.photos.length} photo(s) attached
                  </span>
                  <span className="bg-emerald-100/80 px-2.5 py-1 rounded-full">
                    ₹{submittedData.pricePerKwh}/kWh
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-stretch md:self-auto shrink-0">
              <button
                type="button"
                onClick={() => setSubmittedData(null)}
                className="px-4 py-2.5 rounded-xl bg-white text-emerald-800 border border-emerald-300 font-medium text-sm hover:bg-emerald-100/50 transition"
              >
                Edit Listing
              </button>
              {onSuccessNavigate && (
                <button
                  type="button"
                  onClick={onSuccessNavigate}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 transition flex items-center gap-1.5 shadow-sm"
                >
                  <span>Explore on Map</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-50 border border-brand-200 rounded-full text-xs font-semibold text-brand-700 mb-3">
          <Zap className="w-3.5 h-3.5 fill-brand-600 text-brand-600" />
          <span>Host a Charging Point in Chennai</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-navy-950 tracking-tight">
          List Your EV Charger & Parking Slot
        </h1>
        <p className="text-slate-600 mt-2 max-w-2xl text-base">
          Monetize your unused parking slot or home EV charger. Pin your exact location on the Chennai map, set your slot number and charging rates, and welcome neighborhood EV drivers.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* SECTION 1: Map & Geographic Coordinates */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-soft">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-brand-600" />
                1. Exact Location on Chennai Map
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Click on the map or drag the green marker pin to specify your charger's parking entrance.
              </p>
            </div>

            {/* Coordinates Badge */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 p-2 rounded-2xl">
              <div className="text-xs font-mono font-semibold text-slate-800 px-1">
                {formData.latitude.toFixed(5)}, {formData.longitude.toFixed(5)}
              </div>
              <button
                type="button"
                onClick={copyCoordinates}
                className="px-2 py-1 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 text-xs font-medium flex items-center gap-1 transition"
                title="Copy coordinates"
              >
                {copiedCoords ? <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCoords ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Interactive Leaflet Map Centered on Chennai */}
          <div className="mb-6">
            <InteractiveMap
              latitude={formData.latitude}
              longitude={formData.longitude}
              onLocationChange={handleLocationChange}
              isDraggable={true}
              heightClass="h-[380px] sm:h-[460px]"
              parkingSlot={formData.parkingSlotNumber}
              popupTitle={formData.title || 'Your Proposed Charger'}
            />
          </div>

          {/* Latitude and Longitude Display & Manual Input */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200/70">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Latitude (Auto-updated from Map)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.000001"
                  value={formData.latitude}
                  onChange={(e) => handleManualCoordChange('latitude', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-mono text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 font-semibold"
                  required
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-mono">° N</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Longitude (Auto-updated from Map)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.000001"
                  value={formData.longitude}
                  onChange={(e) => handleManualCoordChange('longitude', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-mono text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 font-semibold"
                  required
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-mono">° E</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Area / Chennai Locality
              </label>
              <input
                type="text"
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                placeholder="e.g. Adyar, Anna Nagar, OMR"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Pincode
              </label>
              <input
                type="text"
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                placeholder="600020"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
                required
              />
            </div>
          </div>
        </section>

        {/* SECTION 2: Parking Slot & Charger Specifications */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-soft">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Car className="w-5 h-5 text-brand-600" />
            2. Parking Slot & Charger Technical Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Parking Slot Number - Prominently emphasized as requested */}
            <div className="md:col-span-2 p-5 bg-gradient-to-r from-emerald-50/70 to-teal-50/70 rounded-2xl border-2 border-emerald-300/80">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <label className="text-sm font-bold text-emerald-950 flex items-center gap-2">
                  <span className="p-1 bg-emerald-600 text-white rounded-md text-xs">CRITICAL</span>
                  Dedicated Parking Slot Number / Designation *
                </label>
                <span className="text-xs text-emerald-700">Helps EV drivers park in the exact spot</span>
              </div>
              <input
                type="text"
                value={formData.parkingSlotNumber}
                onChange={(e) => setFormData({ ...formData, parkingSlotNumber: e.target.value })}
                placeholder="e.g. Slot B-04 (Ground Level), Slot #12 Basement, or Driveway Bay 1"
                className="w-full px-4 py-3 rounded-xl border border-emerald-400 bg-white text-base font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
                required
              />
              <div className="mt-3 flex items-center gap-3">
                <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.isCoveredParking}
                    onChange={(e) => setFormData({ ...formData, isCoveredParking: e.target.checked })}
                    className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
                  />
                  <span className="text-xs font-semibold text-slate-800">
                    Covered / Roof-protected Parking Slot
                  </span>
                </label>
              </div>
            </div>

            {/* Listing Title */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Charging Hub / Point Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. GreenHaven Fast Charge Point"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                required
              />
            </div>

            {/* Access Type */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Property / Parking Access Type *
              </label>
              <select
                value={formData.accessType}
                onChange={(e) => setFormData({ ...formData, accessType: e.target.value as AccessType })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {ACCESS_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Charger Connector Type */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Charger Connector Protocol *
              </label>
              <select
                value={formData.chargerType}
                onChange={(e) => setFormData({ ...formData, chargerType: e.target.value as ChargerType })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {CHARGER_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Power Output in kW */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Rated Power Output (kW) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="350"
                  value={formData.powerOutputKw}
                  onChange={(e) => setFormData({ ...formData, powerOutputKw: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono font-semibold"
                  required
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-500 font-medium">kW</span>
              </div>
            </div>

            {/* Vehicle Compatibility */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                Compatible Vehicle Types *
              </label>
              <div className="flex flex-wrap gap-3">
                {VEHICLE_OPTIONS.map((v) => {
                  const selected = formData.compatibleVehicles.includes(v);
                  return (
                    <button
                      type="button"
                      key={v}
                      onClick={() => handleVehicleToggle(v)}
                      className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition border flex items-center gap-2 ${
                        selected
                          ? 'bg-brand-600 text-white border-brand-700 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <CheckCircle className={`w-4 h-4 ${selected ? 'text-white' : 'text-slate-300'}`} />
                      <span>{v}s</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: Pricing, Hours, and Address */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-soft">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-brand-600" />
            3. Pricing, Timings & Address Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Charging Price (₹ per kWh) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-sm text-slate-500 font-bold">₹</span>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={formData.pricePerKwh}
                  onChange={(e) => setFormData({ ...formData, pricePerKwh: e.target.value })}
                  placeholder="15"
                  className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono font-semibold"
                  required
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Typical Chennai home rate: ₹12 - ₹18/kWh</p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Parking Fee (₹ per hour)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-sm text-slate-500 font-bold">₹</span>
                <input
                  type="number"
                  min="0"
                  value={formData.parkingFeePerHour}
                  onChange={(e) => setFormData({ ...formData, parkingFeePerHour: e.target.value })}
                  placeholder="0 for free parking"
                  className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono font-semibold"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Enter 0 if parking is free during charge</p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Operating Hours *
              </label>
              <input
                type="text"
                value={formData.operatingHours}
                onChange={(e) => setFormData({ ...formData, operatingHours: e.target.value })}
                placeholder="e.g. 24/7 or 6:00 AM - 10:00 PM"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Full Physical Address *
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Door number, building name, street..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Landmark
              </label>
              <input
                type="text"
                value={formData.landmark}
                onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                placeholder="e.g. Behind Nilgiris, Near Metro Pillar 124"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            {/* Host Details */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Host / Contact Person Name *
              </label>
              <input
                type="text"
                value={formData.hostName}
                onChange={(e) => setFormData({ ...formData, hostName: e.target.value })}
                placeholder="Your full name"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Contact Phone / WhatsApp *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Host Email Address *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="name@domain.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                required
              />
            </div>

            {/* Amenities Checklist */}
            <div className="sm:col-span-2 lg:col-span-3 pt-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                Available Amenities for Drivers
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {AMENITY_OPTIONS.map((amenity) => {
                  const Icon = amenity.icon;
                  const isChecked = formData.amenities.includes(amenity.id);
                  return (
                    <button
                      type="button"
                      key={amenity.id}
                      onClick={() => handleAmenityToggle(amenity.id)}
                      className={`p-3 rounded-xl border text-left text-xs font-medium flex items-center gap-2.5 transition ${
                        isChecked
                          ? 'border-brand-500 bg-brand-50/60 text-brand-900'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isChecked ? 'text-brand-600' : 'text-slate-400'}`} />
                      <span className="truncate">{amenity.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Special Entry Instructions */}
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Entry / Gate Instructions for Drivers
              </label>
              <textarea
                rows={2}
                value={formData.specialInstructions}
                onChange={(e) => setFormData({ ...formData, specialInstructions: e.target.value })}
                placeholder="e.g. Inform security guard you are visiting Slot P-04 for EV charging. Ring bell 2B if gate is locked."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>
        </section>

        {/* SECTION 4: Local Photo Previews */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-soft">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-600" />
              4. Local Photo Previews (Parking Slot & Charger)
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Select or drop photos of your parking bay, socket type, and driveway. Photos are previewed locally with zero remote upload.
            </p>
          </div>

          <PhotoUploader
            photos={formData.photos}
            onPhotosChange={handlePhotosChange}
            maxPhotos={6}
          />
        </section>

        {/* Submit Bar */}
        <div className="bg-navy-950 text-white rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center shrink-0 border border-brand-500/30">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Ready to register your charger?</p>
              <p className="text-xs text-slate-400">
                Positioned at <span className="font-mono text-emerald-400">{formData.latitude.toFixed(4)}°N, {formData.longitude.toFixed(4)}°E</span> · Slot <span className="text-white font-semibold">{formData.parkingSlotNumber || 'Unassigned'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white font-bold text-sm shadow-lg shadow-brand-500/30 transition transform hover:-translate-y-0.5 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4 fill-white" />
              <span>{isSubmitting ? 'Registering...' : 'Register Charger & Parking Slot'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
