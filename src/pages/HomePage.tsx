import React from 'react';
import { Link } from 'react-router-dom';
import {
  Zap,
  MapPin,
  ArrowRight,
  PlusCircle,
  Compass,
  CheckCircle2,
  ParkingCircle,
  Camera
} from 'lucide-react';
import { CHENNAI_NEIGHBORHOODS } from '../types/charger';

export const HomePage: React.FC = () => {
  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/60 via-slate-50 to-white pt-12 pb-16 md:pt-20 md:pb-24 border-b border-slate-200/60">
        <div className="absolute inset-0 bg-[radial-gradient(#16a34a_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.06] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Hero Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-100 text-brand-800 text-xs sm:text-sm font-semibold shadow-2xs">
                <span className="flex h-2 w-2 rounded-full bg-brand-600 animate-pulse" />
                <span>Chennai's Community EV Charging Network</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-navy-950 tracking-tight leading-[1.1] font-display">
                Plug in anywhere with <span className="text-brand-600">PlugMitra</span> Chennai
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
                Connect your electric vehicle with verified residential parking slots, independent driveways, and neighborhood chargers across Chennai. Host your charger or find one nearby in seconds.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/explore"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white font-bold text-sm sm:text-base shadow-lg shadow-brand-500/25 transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5"
                >
                  <Compass className="w-5 h-5" />
                  <span>Explore Chennai Map</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>

                <Link
                  to="/add-charger"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-navy-900 border-2 border-slate-300 hover:border-slate-400 font-bold text-sm sm:text-base transition-all flex items-center justify-center gap-2 shadow-2xs"
                >
                  <PlusCircle className="w-5 h-5 text-brand-600" />
                  <span>List Your Charger</span>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="pt-6 border-t border-slate-200/80 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-600 font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-600" />
                  <span>Accurate Chennai Coordinates</span>
                </div>
                <div className="flex items-center gap-2">
                  <ParkingCircle className="w-4 h-4 text-brand-600" />
                  <span>Exact Parking Slot Numbers</span>
                </div>
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-brand-600" />
                  <span>Local Photo Previews</span>
                </div>
              </div>
            </div>

            {/* Hero Right Visual Card */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-brand-400 via-teal-400 to-navy-500 opacity-20 blur-xl"></div>
                <div className="relative bg-white rounded-3xl p-6 sm:p-7 shadow-card border border-slate-200 space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-brand-500 text-white flex items-center justify-center shadow-sm">
                        <Zap className="w-5 h-5 fill-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">Adyar Green Park Point</h4>
                        <p className="text-xs text-slate-500">Gandhi Nagar, Chennai</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold font-mono">
                      ₹15 / kWh
                    </span>
                  </div>

                  {/* Spec Row */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Parking Slot</span>
                      <span className="font-bold text-navy-950 font-mono text-sm">Slot #P-04 (Covered)</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Power Rating</span>
                      <span className="font-bold text-brand-700 font-mono text-sm">7.4 kW (Type 2)</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Coordinates</span>
                      <span className="font-bold text-slate-800 font-mono text-xs">13.0012° N, 80.2565° E</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Access Type</span>
                      <span className="font-bold text-slate-800 text-xs">Villa Driveway</span>
                    </div>
                  </div>

                  {/* Interactive Quick Pin Prompt */}
                  <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="text-xs font-medium text-emerald-900">Draggable Leaflet Chennai Pin</span>
                    </div>
                    <Link
                      to="/explore"
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
                    >
                      View on Map →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURE PILLARS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
            Why PlugMitra
          </span>
          <h2 className="text-3xl font-extrabold text-navy-950 mt-3 tracking-tight">
            Built for Chennai's EV Owners & Hosts
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-2">
            No more range anxiety on OMR, Anna Nagar traffic, or finding occupied commercial chargers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-soft hover:shadow-card transition duration-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Precision Location Mapping</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Draggable Leaflet marker lets you designate the exact parking bay entrance on the Chennai street grid, preventing driver confusion.
            </p>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-soft hover:shadow-card transition duration-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-navy-100 text-navy-700 flex items-center justify-center">
              <ParkingCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Dedicated Parking Slots</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Specify your exact slot designation (e.g. Basement B-12, Ground Slot #3), covered roof availability, and driveway entry instructions.
            </p>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-soft hover:shadow-card transition duration-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-accent-100 text-amber-700 flex items-center justify-center">
              <Camera className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Instant Local Photo Previews</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Upload local photos of your charger plug, gate landmark, and parking spot with immediate thumbnail previews and zero wait time.
            </p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-navy-950 text-white rounded-3xl p-8 sm:p-12 lg:p-16 shadow-card overflow-hidden relative">
          <div className="max-w-3xl mb-12">
            <span className="text-brand-400 text-xs font-bold uppercase tracking-wider">Simple 3-Step Process</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">
              How PlugMitra Works in Chennai
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-brand-500 text-white font-bold flex items-center justify-center text-lg">
                1
              </div>
              <h4 className="text-lg font-bold text-white">Pin Your Location</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Open the interactive Chennai map, search or drag the pin to your exact building or parking lot gate in Adyar, Anna Nagar, or OMR.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-brand-500 text-white font-bold flex items-center justify-center text-lg">
                2
              </div>
              <h4 className="text-lg font-bold text-white">Enter Slot & Charger Details</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Add your designated parking slot number, connector type (Type 2, CCS2, 15A), power rating, and your price per kWh.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-brand-500 text-white font-bold flex items-center justify-center text-lg">
                3
              </div>
              <h4 className="text-lg font-bold text-white">Preview Photos & Publish</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Preview photos of the parking spot locally, check the auto-calculated coordinates, and register your charger for neighbors.
              </p>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-navy-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-300">
              Own an EV charger at home, office, or apartment in Chennai?
            </p>
            <Link
              to="/add-charger"
              className="px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm transition flex items-center gap-2 shadow-sm"
            >
              <span>List Your Charger Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CHENNAI LOCALITIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-100 rounded-3xl p-8 border border-slate-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Supported Chennai Hubs</h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Pin your charger in any of Chennai's premier residential & commercial neighborhoods:
              </p>
            </div>
            <Link
              to="/explore"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-700 hover:text-brand-800"
            >
              <span>Explore All on Map</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {CHENNAI_NEIGHBORHOODS.map((hood) => (
              <Link
                key={hood.name}
                to={`/explore?lat=${hood.lat}&lng=${hood.lng}`}
                className="bg-white p-3 rounded-xl border border-slate-200/80 hover:border-brand-400 hover:shadow-xs transition text-center group"
              >
                <div className="font-semibold text-xs text-slate-800 group-hover:text-brand-700">
                  {hood.name}
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                  {hood.lat.toFixed(3)}°, {hood.lng.toFixed(3)}°
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
