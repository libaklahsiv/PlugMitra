import React, { useState, useEffect } from 'react';
import {
  User,
  Car,
  Save,
  CheckCircle2,
  RotateCcw,
  ShieldCheck,
  AlertTriangle,
  LogIn,
  Database
} from 'lucide-react';
import { StorageService } from '../services/storage';
import { UserProfile, ChargerType } from '../types/charger';
import { useAuth } from '../context/AuthContext';

const EV_MODELS = [
  { make: 'Tata Motors', model: 'Nexon EV (Long Range)', defaultBattery: 40.5, connector: 'CCS2 (DC Fast Charger, 25-60+ kW)' },
  { make: 'Tata Motors', model: 'Tiago EV', defaultBattery: 24.0, connector: 'CCS2 (DC Fast Charger, 25-60+ kW)' },
  { make: 'Tata Motors', model: 'Punch.ev', defaultBattery: 35.0, connector: 'CCS2 (DC Fast Charger, 25-60+ kW)' },
  { make: 'MG Motor', model: 'ZS EV', defaultBattery: 50.3, connector: 'CCS2 (DC Fast Charger, 25-60+ kW)' },
  { make: 'Mahindra', model: 'XUV400 EV', defaultBattery: 39.4, connector: 'CCS2 (DC Fast Charger, 25-60+ kW)' },
  { make: 'Ather Energy', model: '450X Gen 3', defaultBattery: 3.7, connector: '15A Standard 3-Pin (Slow AC, 3.3 kW)' },
  { make: 'Ola Electric', model: 'S1 Pro Gen 2', defaultBattery: 4.0, connector: '15A Standard 3-Pin (Slow AC, 3.3 kW)' },
  { make: 'TVS Motor', model: 'iQube Electric', defaultBattery: 3.04, connector: '15A Standard 3-Pin (Slow AC, 3.3 kW)' },
  { make: 'Hyundai', model: 'Ioniq 5', defaultBattery: 72.6, connector: 'CCS2 (DC Fast Charger, 25-60+ kW)' },
  { make: 'BYD', model: 'Atto 3', defaultBattery: 60.48, connector: 'CCS2 (DC Fast Charger, 25-60+ kW)' },
];

export const ProfilePage: React.FC = () => {
  const { user, profile: authProfile, updateProfile, openAuthModal, isConfigured } = useAuth();
  const [profile, setProfile] = useState<UserProfile>(StorageService.getUserProfile());
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    if (authProfile) {
      setProfile((prev) => ({
        ...prev,
        name: authProfile.full_name || prev.name,
        email: authProfile.email || user?.email || prev.email,
        phone: authProfile.phone || prev.phone,
        vehicleMake: authProfile.vehicle_make || prev.vehicleMake,
        vehicleModel: authProfile.vehicle_model || prev.vehicleModel,
        vehicleRegNumber: authProfile.vehicle_reg_number || prev.vehicleRegNumber,
        connectorPreference: (authProfile.connector_preference as ChargerType) || prev.connectorPreference,
        batteryCapacityKwh: authProfile.battery_capacity_kwh || prev.batteryCapacityKwh,
        preferredArea: authProfile.preferred_area || prev.preferredArea,
      }));
    }
  }, [authProfile, user]);

  const handleModelPreset = (preset: (typeof EV_MODELS)[0]) => {
    setProfile((prev) => ({
      ...prev,
      vehicleMake: preset.make,
      vehicleModel: preset.model,
      batteryCapacityKwh: preset.defaultBattery,
      connectorPreference: preset.connector as ChargerType,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    StorageService.saveUserProfile(profile);

    if (user) {
      await updateProfile({
        full_name: profile.name,
        phone: profile.phone,
        vehicle_make: profile.vehicleMake,
        vehicle_model: profile.vehicleModel,
        vehicle_reg_number: profile.vehicleRegNumber,
        connector_preference: profile.connectorPreference,
        battery_capacity_kwh: profile.batteryCapacityKwh,
        preferred_area: profile.preferredArea,
      });
    }

    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleResetData = () => {
    StorageService.resetAllData();
    setShowResetConfirm(false);
    window.location.reload();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-50 text-forest-800 text-xs font-semibold mb-2 border border-forest-200">
          <User className="w-3.5 h-3.5 text-forest-700" />
          <span>Driver Preferences</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          User & Vehicle Profile
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Configure your electric vehicle specifications to personalize charger compatibility and parking slot recommendations.
        </p>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-900 text-xs font-semibold flex items-center gap-2 animate-slide-up">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Vehicle profile and charging preferences updated successfully.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* EV Vehicle Specifications */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Car className="w-5 h-5 text-forest-700" />
                Electric Vehicle Specifications
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Helps hosts verify socket compatibility with your EV.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-forest-50 text-forest-800 border border-forest-200 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-forest-700" />
              <span>Verified Driver</span>
            </span>
          </div>

          {/* Quick EV Presets */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Popular Chennai EV Presets (Click to autofill)
            </label>
            <div className="flex flex-wrap gap-2">
              {EV_MODELS.map((preset) => (
                <button
                  type="button"
                  key={preset.model}
                  onClick={() => handleModelPreset(preset)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition ${
                    profile.vehicleModel === preset.model
                      ? 'bg-forest-800 text-white border-forest-900 font-bold shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {preset.make} {preset.model}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Vehicle Make / Brand *
              </label>
              <input
                type="text"
                value={profile.vehicleMake}
                onChange={(e) => setProfile({ ...profile, vehicleMake: e.target.value })}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Vehicle Model *
              </label>
              <input
                type="text"
                value={profile.vehicleModel}
                onChange={(e) => setProfile({ ...profile, vehicleModel: e.target.value })}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Registration Plate Number *
              </label>
              <input
                type="text"
                value={profile.vehicleRegNumber}
                onChange={(e) => setProfile({ ...profile, vehicleRegNumber: e.target.value })}
                required
                placeholder="e.g. TN 07 CM 4521"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 font-mono uppercase font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Battery Pack Capacity (kWh)
              </label>
              <input
                type="number"
                step="0.1"
                value={profile.batteryCapacityKwh}
                onChange={(e) => setProfile({ ...profile, batteryCapacityKwh: parseFloat(e.target.value) || 0 })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 font-mono font-bold"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Default Charging Connector
              </label>
              <select
                value={profile.connectorPreference}
                onChange={(e) => setProfile({ ...profile, connectorPreference: e.target.value as ChargerType })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 font-mono"
              >
                <option value="Type 2 AC (Fast AC, up to 22 kW)">Type 2 AC (Fast AC, up to 22 kW)</option>
                <option value="CCS2 (DC Fast Charger, 25-60+ kW)">CCS2 (DC Fast Charger, 25-60+ kW)</option>
                <option value="15A Standard 3-Pin (Slow AC, 3.3 kW)">15A Standard 3-Pin (Slow AC, 3.3 kW)</option>
                <option value="Bharat AC-001 (Slow AC)">Bharat AC-001 (Slow AC)</option>
                <option value="Bharat DC-001 (15 kW DC)">Bharat DC-001 (15 kW DC)</option>
              </select>
            </div>
          </div>
        </section>

        {/* User Contact Details */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <User className="w-5 h-5 text-forest-700" />
              Contact Details
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Shared with hosts only when you confirm a slot booking.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Email Address *
              </label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Phone / WhatsApp *
              </label>
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 font-mono"
              />
            </div>
          </div>
        </section>

        {/* Save Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="text-xs text-rose-600 hover:text-rose-800 flex items-center gap-1.5 order-2 sm:order-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data & Clear Storage</span>
          </button>

          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-forest-800 hover:bg-forest-900 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-2 order-1 sm:order-2"
          >
            <Save className="w-4 h-4 text-emerald-300" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>

      {/* RESET CONFIRMATION MODAL */}
      {showResetConfirm && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setShowResetConfirm(false)}
        >
          <div
            className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-base">Reset Demo Data?</h4>
            <p className="text-xs text-slate-600">
              This will restore all default Chennai chargers and clear any custom listings or bookings saved in your browser.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResetData}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs"
              >
                Reset Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
