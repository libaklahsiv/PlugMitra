import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Zap,
  MapPin,
  Car,
  Shield,
  Wifi,
  Coffee,
  CheckCircle,
  Copy,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  ArrowRight,
  Building,
  ParkingCircle,
  AlertCircle,
  Camera,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { InteractiveMap } from './InteractiveMap';
import { PhotoUploader } from './PhotoUploader';
import { ChargerService } from '../services/chargerService';
import { useAuth } from '../context/AuthContext';
import {
  ChargerRegistrationFormData,
  ChargerType,
  PowerType,
  VehicleType,
  AccessType,
  LocalPhoto,
  CHENNAI_DEFAULT_COORDINATES
} from '../types/charger';

const CHARGER_TYPES: { type: ChargerType; defaultKw: number; powerType: PowerType }[] = [
  { type: 'Type 2 AC (Fast AC, up to 22 kW)', defaultKw: 7.4, powerType: 'AC' },
  { type: 'CCS2 (DC Fast Charger, 25-60+ kW)', defaultKw: 30.0, powerType: 'DC' },
  { type: '15A Standard 3-Pin (Slow AC, 3.3 kW)', defaultKw: 3.3, powerType: 'AC' },
  { type: 'Bharat AC-001 (Slow AC)', defaultKw: 10.0, powerType: 'AC' },
  { type: 'Bharat DC-001 (15 kW DC)', defaultKw: 15.0, powerType: 'DC' },
  { type: 'CHAdeMO', defaultKw: 50.0, powerType: 'DC' },
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

const STEPS = [
  { id: 1, title: 'Basic Info', desc: 'Host & Property' },
  { id: 2, title: 'Location', desc: 'Chennai Map Pin' },
  { id: 3, title: 'Technical', desc: 'Connector & Tariff' },
  { id: 4, title: 'Parking Slot', desc: 'Slot & Schedule' },
  { id: 5, title: 'Photos', desc: 'Local Previews' },
  { id: 6, title: 'Review', desc: 'Verify & Publish' },
];

interface AddChargerFormProps {
  onSuccessNavigate?: () => void;
}

export const AddChargerForm: React.FC<AddChargerFormProps> = ({ onSuccessNavigate }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlLat = searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : null;
  const urlLng = searchParams.get('lng') ? parseFloat(searchParams.get('lng')!) : null;

  const [currentStep, setCurrentStep] = useState(1);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedChargerId, setSubmittedChargerId] = useState<string | null>(null);

  const { user, openAuthModal, isConfigured } = useAuth();

  const [formData, setFormData] = useState<ChargerRegistrationFormData>({
    propertyName: 'Karpagam Gardens Residential',
    title: 'Adyar Green EV Charging Bay',
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
    powerType: 'AC',
    powerOutputKw: 7.4,
    compatibleVehicles: ['4-Wheeler', '2-Wheeler'],
    accessType: 'Independent House / Villa Driveway',
    operatingHours: '06:00 AM - 10:00 PM',
    pricePerKwh: '15.00',
    parkingFeePerHour: '0',
    amenities: ['cctv', 'covered', 'lit', 'wifi'],
    specialInstructions: 'Enter through the left metal gate. Ring the bell or call host upon arrival for gate opening.',
    photos: [],
  });

  const [copiedCoords, setCopiedCoords] = useState(false);

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

  const handleChargerTypeSelect = (selected: string) => {
    const found = CHARGER_TYPES.find((c) => c.type === selected);
    if (found) {
      setFormData((prev) => ({
        ...prev,
        chargerType: found.type,
        powerOutputKw: found.defaultKw,
        powerType: found.powerType,
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

  // Step Validation Logic
  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.title.trim()) errors.title = 'Please provide a listing title';
      if (!formData.propertyName.trim()) errors.propertyName = 'Please provide the building or property name';
      if (!formData.hostName.trim()) errors.hostName = 'Host name is required';
      if (!formData.phone.trim()) errors.phone = 'Contact phone number is required';
    } else if (step === 2) {
      if (!formData.address.trim()) errors.address = 'Physical address is required';
      if (!formData.area.trim()) errors.area = 'Locality / Area is required';
      if (!formData.pincode.trim()) errors.pincode = 'Chennai pincode is required';
      if (formData.latitude < 12.5 || formData.latitude > 13.5) {
        errors.latitude = 'Latitude must be within the greater Chennai region (12.5°N - 13.5°N)';
      }
      if (formData.longitude < 79.8 || formData.longitude > 80.5) {
        errors.longitude = 'Longitude must be within the greater Chennai region (79.8°E - 80.5°E)';
      }
    } else if (step === 3) {
      if (formData.powerOutputKw <= 0) errors.powerOutputKw = 'Power output must be greater than 0 kW';
      if (formData.compatibleVehicles.length === 0) {
        errors.compatibleVehicles = 'Please select at least one compatible vehicle type';
      }
    } else if (step === 4) {
      if (!formData.parkingSlotNumber.trim()) {
        errors.parkingSlotNumber = 'Dedicated parking slot number is required';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setValidationErrors({});
      setCurrentStep((prev) => Math.min(prev + 1, 6));
      window.scrollTo({ top: 100, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setValidationErrors({});
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 100, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!user) {
      openAuthModal('login');
      return;
    }

    if (!validateStep(1) || !validateStep(2) || !validateStep(3) || !validateStep(4)) {
      setSubmitError('Please review the form steps and correct the highlighted fields before submitting.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await ChargerService.registerCharger(formData, user);
      setIsSubmitting(false);

      if (error) {
        setSubmitError(error.message);
        return;
      }

      if (data) {
        setSubmittedChargerId(data.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err: unknown) {
      setIsSubmitting(false);
      setSubmitError((err as Error).message || 'An unexpected error occurred while saving the charger.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6">
      {/* ERROR BANNER */}
      {submitError && (
        <div className="mb-6 p-4 bg-rose-50 border-2 border-rose-300 rounded-2xl text-rose-900 text-xs sm:text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-rose-950">Registration Failed</h4>
            <p className="text-xs text-rose-800">{submitError}</p>
          </div>
        </div>
      )}

      {/* SUCCESS CONFIRMATION BANNER */}
      {submittedChargerId && (
        <div className="mb-8 p-6 sm:p-8 bg-emerald-50 border-2 border-emerald-500 rounded-3xl shadow-sm space-y-5 animate-slide-up">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shrink-0">
              <CheckCircle className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <div className="inline-block px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-bold">
                ⏳ Status: Pending Admin Approval
              </div>
              <h2 className="text-2xl font-extrabold text-emerald-950">
                Your Charger is Successfully Submitted!
              </h2>
              <p className="text-xs sm:text-sm text-emerald-900 leading-relaxed">
                <span className="font-bold">{formData.title}</span> at <span className="font-semibold">{formData.propertyName}</span> with Parking Slot{' '}
                <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-emerald-300">
                  {formData.parkingSlotNumber}
                </span>{' '}
                has been recorded in the database. In accordance with safety guidelines, listings require administrator approval before appearing in public searches.
              </p>
            </div>
          </div>

          <div className="p-4 bg-white/90 rounded-2xl border border-emerald-200 text-xs grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Location</span>
              <span className="font-bold text-slate-900">{formData.area}, Chennai</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Coordinates</span>
              <span className="font-bold text-slate-900 font-mono">{formData.latitude.toFixed(4)}°, {formData.longitude.toFixed(4)}°</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Connector</span>
              <span className="font-bold text-slate-900 truncate block">{formData.chargerType.split('(')[0]}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Tariff</span>
              <span className="font-bold text-slate-900 font-mono">
                {formData.pricePerKwh ? `₹${formData.pricePerKwh}/kWh` : 'Not set'}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => (onSuccessNavigate ? onSuccessNavigate() : navigate('/explore'))}
              className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5"
            >
              <span>View on Chennai Map</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-5 py-2.5 rounded-xl bg-white border border-emerald-300 text-emerald-900 font-bold text-xs hover:bg-emerald-100/50 transition"
            >
              Go to Host Dashboard
            </button>
            <button
              type="button"
              onClick={() => {
                setSubmittedChargerId(null);
                setCurrentStep(1);
              }}
              className="px-4 py-2 text-xs font-semibold text-emerald-800 hover:underline"
            >
              List Another Charger
            </button>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-forest-50 border border-forest-200 rounded-full text-xs font-semibold text-forest-800">
            <Zap className="w-3.5 h-3.5 text-forest-700" />
            <span>Host Onboarding Wizard</span>
          </div>
          {isConfigured ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              <span>Supabase Cloud Connected</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-medium">
              <span>Local Sandbox Mode (Configure .env.local for Cloud DB)</span>
            </span>
          )}
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          List Your EV Charger & Parking Slot
        </h1>
        <p className="text-slate-600 text-xs sm:text-sm mt-1 max-w-2xl">
          Monetize your residential driveway, apartment slot, or business charger in Chennai with verified coordinates and local photos.
        </p>
      </div>

      {/* STEP PROGRESS INDICATOR */}
      <div className="mb-8 p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between overflow-x-auto pb-1 gap-2">
          {STEPS.map((s) => {
            const isCompleted = currentStep > s.id;
            const isCurrent = currentStep === s.id;

            return (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  if (s.id < currentStep) setCurrentStep(s.id);
                }}
                disabled={s.id > currentStep}
                className={`flex items-center gap-2 text-left shrink-0 transition ${
                  isCurrent
                    ? 'text-forest-900 font-bold'
                    : isCompleted
                    ? 'text-forest-700 cursor-pointer'
                    : 'text-slate-400 opacity-60 cursor-not-allowed'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center shrink-0 ${
                    isCurrent
                      ? 'bg-forest-800 text-white shadow-xs'
                      : isCompleted
                      ? 'bg-forest-100 text-forest-800 border border-forest-300'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : s.id}
                </div>
                <div className="hidden sm:block">
                  <div className="text-xs leading-tight">{s.title}</div>
                  <div className="text-[10px] text-slate-400 font-normal">{s.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* FORM BODY */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* STEP 1: BASIC DETAILS */}
        {currentStep === 1 && (
          <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6 animate-fade-in">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Building className="w-5 h-5 text-forest-700" />
                Step 1: Property & Host Identification
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Provide the building name and primary host details for driver coordination.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Building / Property Name *
                </label>
                <input
                  type="text"
                  value={formData.propertyName}
                  onChange={(e) => setFormData({ ...formData, propertyName: e.target.value })}
                  placeholder="e.g. Karpagam Gardens Villa, Olympia Opaline"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-forest-600 ${
                    validationErrors.propertyName ? 'border-rose-400 bg-rose-50/40' : 'border-slate-300 bg-white'
                  }`}
                />
                {validationErrors.propertyName && (
                  <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {validationErrors.propertyName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Listing Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Adyar Green EV Charging Bay"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-forest-600 ${
                    validationErrors.title ? 'border-rose-400 bg-rose-50/40' : 'border-slate-300 bg-white'
                  }`}
                />
                {validationErrors.title && (
                  <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {validationErrors.title}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Host Full Name *
                </label>
                <input
                  type="text"
                  value={formData.hostName}
                  onChange={(e) => setFormData({ ...formData, hostName: e.target.value })}
                  placeholder="e.g. Kabilan V."
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-forest-600 ${
                    validationErrors.hostName ? 'border-rose-400 bg-rose-50/40' : 'border-slate-300 bg-white'
                  }`}
                />
                {validationErrors.hostName && (
                  <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {validationErrors.hostName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Host Mobile Phone (WhatsApp enabled) *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-forest-600 ${
                    validationErrors.phone ? 'border-rose-400 bg-rose-50/40' : 'border-slate-300 bg-white'
                  }`}
                />
                {validationErrors.phone && (
                  <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {validationErrors.phone}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Host Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="host@domain.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-forest-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Property Category
                </label>
                <select
                  value={formData.accessType}
                  onChange={(e) => setFormData({ ...formData, accessType: e.target.value as AccessType })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-forest-600"
                >
                  {ACCESS_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>
        )}

        {/* STEP 2: LOCATION & MAP */}
        {currentStep === 2 && (
          <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-forest-700" />
                  Step 2: Chennai Location & Draggable Map Pin
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Click the map or drag the green pin to mark the exact parking gate entrance.
                </p>
              </div>

              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 p-1.5 rounded-xl">
                <span className="text-xs font-mono font-bold text-slate-800">
                  {formData.latitude.toFixed(5)}, {formData.longitude.toFixed(5)}
                </span>
                <button
                  type="button"
                  onClick={copyCoordinates}
                  className="px-2 py-1 bg-white border border-slate-200 rounded text-[11px] font-semibold text-slate-700 hover:text-slate-950 flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedCoords ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Interactive Leaflet Map Centered on Chennai */}
            <div className="space-y-2">
              <InteractiveMap
                latitude={formData.latitude}
                longitude={formData.longitude}
                onLocationChange={handleLocationChange}
                isDraggable={true}
                heightClass="h-[360px] sm:h-[420px]"
                parkingSlot={formData.parkingSlotNumber}
                popupTitle={formData.title || 'Your Charger Entrance'}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Latitude
                </label>
                <input
                  type="number"
                  step="0.000001"
                  value={formData.latitude}
                  onChange={(e) => handleManualCoordChange('latitude', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-mono text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Longitude
                </label>
                <input
                  type="number"
                  step="0.000001"
                  value={formData.longitude}
                  onChange={(e) => handleManualCoordChange('longitude', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-mono text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Chennai Locality / Area *
                </label>
                <input
                  type="text"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  placeholder="e.g. Adyar, Anna Nagar"
                  className={`w-full px-3 py-2 rounded-xl border text-xs ${
                    validationErrors.area ? 'border-rose-400 bg-rose-50/40' : 'border-slate-300 bg-white'
                  }`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Pincode *
                </label>
                <input
                  type="text"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  placeholder="600020"
                  className={`w-full px-3 py-2 rounded-xl border text-xs font-mono ${
                    validationErrors.pincode ? 'border-rose-400 bg-rose-50/40' : 'border-slate-300 bg-white'
                  }`}
                />
              </div>

              <div className="sm:col-span-2 lg:col-span-3">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Full Physical Street Address *
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Door number, street name, residential layout..."
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs ${
                    validationErrors.address ? 'border-rose-400 bg-rose-50/40' : 'border-slate-300 bg-white'
                  }`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Landmark
                </label>
                <input
                  type="text"
                  value={formData.landmark}
                  onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                  placeholder="e.g. Behind Nilgiris"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs"
                />
              </div>
            </div>
          </section>
        )}

        {/* STEP 3: CONNECTOR & PRICING */}
        {currentStep === 3 && (
          <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6 animate-fade-in">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Zap className="w-5 h-5 text-forest-700" />
                Step 3: Connector Specs, Power Output & Tariff
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Set electrical connector type, power rating, and your charging tariff.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Connector Protocol *
                </label>
                <select
                  value={formData.chargerType}
                  onChange={(e) => handleChargerTypeSelect(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-forest-600"
                >
                  {CHARGER_TYPES.map((c) => (
                    <option key={c.type} value={c.type}>
                      {c.type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Rated Maximum Power (kW) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="150"
                    value={formData.powerOutputKw}
                    onChange={(e) => setFormData({ ...formData, powerOutputKw: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-forest-600"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-500 font-bold">kW</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Charging Tariff (₹ per kWh)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-500 font-bold">₹</span>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={formData.pricePerKwh}
                    onChange={(e) => setFormData({ ...formData, pricePerKwh: e.target.value })}
                    placeholder="e.g. 15.00"
                    className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-forest-600"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Leave blank if tariff is determined on site.</p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Parking Fee (₹ per hour during charge)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-500 font-bold">₹</span>
                  <input
                    type="number"
                    step="5"
                    min="0"
                    value={formData.parkingFeePerHour}
                    onChange={(e) => setFormData({ ...formData, parkingFeePerHour: e.target.value })}
                    placeholder="0 for free parking"
                    className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-forest-600"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Set to 0 if parking is free during charging.</p>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Compatible Vehicle Types *
                </label>
                <div className="flex flex-wrap gap-3">
                  {VEHICLE_OPTIONS.map((v) => {
                    const isSelected = formData.compatibleVehicles.includes(v);
                    return (
                      <button
                        type="button"
                        key={v}
                        onClick={() => handleVehicleToggle(v)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition border flex items-center gap-2 ${
                          isSelected
                            ? 'bg-forest-800 text-white border-forest-900 shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <CheckCircle2 className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-slate-300'}`} />
                        <span>{v}s</span>
                      </button>
                    );
                  })}
                </div>
                {validationErrors.compatibleVehicles && (
                  <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {validationErrors.compatibleVehicles}
                  </p>
                )}
              </div>
            </div>
          </section>
        )}

        {/* STEP 4: PARKING SLOT & ACCESS RULES */}
        {currentStep === 4 && (
          <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6 animate-fade-in">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <ParkingCircle className="w-5 h-5 text-forest-700" />
                Step 4: Parking Slot Details & Operating Rules
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Specify parking slot designation, roof coverage, schedule, and driver entry directions.
              </p>
            </div>

            <div className="space-y-5">
              {/* Parking slot designation - highlighted requirement */}
              <div className="p-4 bg-forest-50/70 rounded-2xl border-2 border-forest-300 space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-forest-950">
                  Dedicated Parking Slot Designation *
                </label>
                <input
                  type="text"
                  value={formData.parkingSlotNumber}
                  onChange={(e) => setFormData({ ...formData, parkingSlotNumber: e.target.value })}
                  placeholder="e.g. Slot P-04 (Ground Level), Slot #12 Basement, or Villa Driveway Bay 1"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-bold font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-forest-600 ${
                    validationErrors.parkingSlotNumber ? 'border-rose-400 bg-rose-50/40' : 'border-forest-300 bg-white'
                  }`}
                />
                {validationErrors.parkingSlotNumber && (
                  <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {validationErrors.parkingSlotNumber}
                  </p>
                )}
                <div className="pt-1">
                  <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.isCoveredParking}
                      onChange={(e) => setFormData({ ...formData, isCoveredParking: e.target.checked })}
                      className="w-4 h-4 text-forest-700 rounded border-slate-300 focus:ring-forest-600"
                    />
                    <span className="text-xs font-bold text-slate-800">
                      100% Covered Roof / Underground Parking Slot
                    </span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Operating Schedule
                  </label>
                  <input
                    type="text"
                    value={formData.operatingHours}
                    onChange={(e) => setFormData({ ...formData, operatingHours: e.target.value })}
                    placeholder="e.g. 06:00 AM - 10:00 PM or 24/7"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-forest-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Entry Access Instructions
                  </label>
                  <input
                    type="text"
                    value={formData.specialInstructions}
                    onChange={(e) => setFormData({ ...formData, specialInstructions: e.target.value })}
                    placeholder="e.g. Ring bell 2B or notify guard at entry gate"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-forest-600"
                  />
                </div>
              </div>

              {/* Amenities */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Select Available Amenities
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
                            ? 'border-forest-600 bg-forest-50 text-forest-900 font-bold'
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <Icon className={`w-4 h-4 shrink-0 ${isChecked ? 'text-forest-700' : 'text-slate-400'}`} />
                        <span className="truncate">{amenity.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* STEP 5: PHOTOS */}
        {currentStep === 5 && (
          <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6 animate-fade-in">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Camera className="w-5 h-5 text-forest-700" />
                Step 5: Local Photo Uploads & Previews
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Upload photos of your parking bay, socket type, and entrance landmark. Previews are generated instantly using local object URLs.
              </p>
            </div>

            <PhotoUploader
              photos={formData.photos}
              onPhotosChange={handlePhotosChange}
              maxPhotos={6}
            />
          </section>
        )}

        {/* STEP 6: FINAL REVIEW */}
        {currentStep === 6 && (
          <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6 animate-fade-in">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-forest-700" />
                Step 6: Review Listing Details & Publish
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Inspect your charger configuration before publishing to the Chennai community network.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-500">Property & Host</span>
                <div className="text-sm font-bold text-slate-900">{formData.title}</div>
                <div className="text-slate-600">Building: {formData.propertyName}</div>
                <div className="text-slate-600">Host: {formData.hostName} ({formData.phone})</div>
                <div className="text-slate-600">Category: {formData.accessType}</div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-500">Location & Coordinates</span>
                <div className="text-sm font-bold text-slate-900">{formData.area}, Chennai - {formData.pincode}</div>
                <div className="text-slate-600">{formData.address}</div>
                <div className="font-mono text-forest-800 font-bold">
                  {formData.latitude.toFixed(6)}° N, {formData.longitude.toFixed(6)}° E
                </div>
              </div>

              <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200 space-y-2">
                <span className="text-[10px] uppercase font-bold text-emerald-900">Parking Slot Allocation</span>
                <div className="text-sm font-bold text-slate-900 font-mono">{formData.parkingSlotNumber}</div>
                <div className="text-emerald-800 font-medium">
                  {formData.isCoveredParking ? '✓ 100% Covered Roof' : 'Open Sky Bay'}
                </div>
                <div className="text-slate-600">Schedule: {formData.operatingHours || 'Flexible'}</div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-500">Electrical & Tariff</span>
                <div className="text-sm font-bold text-slate-900">{formData.chargerType}</div>
                <div className="text-slate-700 font-bold font-mono">{formData.powerOutputKw} kW ({formData.powerType})</div>
                <div className="text-slate-900 font-bold font-mono">
                  Tariff: {formData.pricePerKwh ? `₹${formData.pricePerKwh} / kWh` : 'Not specified'}
                </div>
              </div>
            </div>

            {formData.photos.length > 0 && (
              <div>
                <span className="text-xs font-bold text-slate-700 block mb-2">
                  Attached Photos ({formData.photos.length})
                </span>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {formData.photos.map((p) => (
                    <img
                      key={p.id}
                      src={p.previewUrl}
                      alt=""
                      className="w-16 h-14 rounded-xl object-cover border border-slate-200"
                    />
                  ))}
                </div>
              </div>
            )}

            {!user && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <h4 className="font-bold text-amber-950">Host Authentication Required</h4>
                  <p className="text-amber-800 text-[11px] mt-0.5">
                    Sign in with your host account to link this listing to your owner profile in Supabase.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => openAuthModal('login')}
                  className="px-4 py-2 bg-amber-800 text-white font-bold rounded-xl text-xs hover:bg-amber-900 transition shrink-0"
                >
                  Sign In to Publish
                </button>
              </div>
            )}
          </section>
        )}

        {/* WIZARD NAVIGATION CONTROLS */}
        <div className="flex items-center justify-between gap-3 pt-4">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 flex items-center gap-1.5 transition"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {currentStep < 6 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 rounded-xl bg-forest-800 hover:bg-forest-900 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
            >
              <span>Next: {STEPS[currentStep].title}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 rounded-2xl bg-forest-800 hover:bg-forest-900 active:bg-forest-950 text-white font-bold text-sm shadow-md transition flex items-center gap-2 disabled:opacity-50"
            >
              <Zap className="w-4 h-4 text-emerald-300" />
              <span>{isSubmitting ? 'Publishing Listing...' : 'Publish Charger & Parking Slot'}</span>
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
