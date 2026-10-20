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
  Camera,
  ShieldCheck
} from 'lucide-react';
import { CHENNAI_NEIGHBORHOODS } from '../types/charger';

export const HomePage: React.FC = () => {
  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-white pt-10 pb-16 md:pt-16 md:pb-20 border-b border-slate-200/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Hero Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-50 border border-forest-200 text-forest-900 text-xs font-semibold shadow-2xs">
                <span className="flex h-2 w-2 rounded-full bg-forest-700" />
                <span>Chennai Community EV Charging & Parking Network</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight font-display">
                Charge at neighborhood parking slots across <span className="text-forest-800">Chennai</span>
              </h1>

              <p className="text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
                Connect your EV with verified residential driveways, apartment parking bays, and commercial charging hubs in Adyar, OMR, Anna Nagar, and beyond.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                <Link
                  to="/explore"
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-forest-800 hover:bg-forest-900 active:bg-forest-950 text-white font-bold text-sm shadow-xs transition flex items-center justify-center gap-2"
                >
                  <Compass className="w-4 h-4 text-emerald-300" />
                  <span>Explore Chennai Chargers</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>

                <Link
                  to="/add-charger"
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 font-bold text-sm transition flex items-center justify-center gap-2 shadow-2xs"
                >
                  <PlusCircle className="w-4 h-4 text-forest-700" />
                  <span>Host Your Charger</span>
                </Link>
              </div>

              {/* Badges */}
              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-center lg:justify-start gap-5 text-xs text-slate-600 font-medium">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-forest-700" />
                  <span>Verified Chennai Coordinates</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ParkingCircle className="w-4 h-4 text-forest-700" />
                  <span>Designated Parking Slot Numbers</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-forest-700" />
                  <span>Local Photo Previews</span>
                </div>
              </div>
            </div>

            {/* Hero Right Visual Card */}
            <div className="lg:col-span-5">
              <div className="bg-slate-50 rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-forest-800 text-white flex items-center justify-center shadow-xs">
                      <Zap className="w-5 h-5 fill-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">Adyar Green Charging Bay</h4>
                      <p className="text-xs text-slate-500">Karpagam Gardens, Chennai</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-forest-100 text-forest-900 text-xs font-bold font-mono border border-forest-200">
                    ₹14.50 / kWh
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-white rounded-xl border border-slate-200/80">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Parking Slot</span>
                    <span className="font-bold text-slate-900 font-mono text-xs">Slot G-03 (Covered)</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200/80">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Power Rating</span>
                    <span className="font-bold text-forest-800 font-mono text-xs">7.4 kW (Type 2 AC)</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200/80">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Coordinates</span>
                    <span className="font-bold text-slate-800 font-mono text-xs">13.0035° N, 80.2558° E</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200/80">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Listing Source</span>
                    <span className="font-bold text-slate-800 text-xs">Community Host</span>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-2xl border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-forest-700 shrink-0" />
                    <span className="text-xs font-medium text-slate-700">Explore on Leaflet map</span>
                  </div>
                  <Link
                    to="/explore"
                    className="text-xs font-bold text-forest-800 hover:text-forest-950 flex items-center gap-1"
                  >
                    Open Map →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* THREE PILLARS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-forest-800 bg-forest-50 px-3 py-1 rounded-full border border-forest-200">
            Why PlugMitra
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">
            Designed for Practical Chennai Mobility
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm mt-1">
            Verified parking spots and local community chargers instead of crowded highway stations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-forest-50 text-forest-800 flex items-center justify-center border border-forest-200">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Draggable Street Pinning</h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              Pin your exact driveway or stilt parking gate coordinates so drivers arrive at the correct entrance without circling the block.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-forest-50 text-forest-800 flex items-center justify-center border border-forest-200">
              <ParkingCircle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Designated Parking Bays</h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              Every listing includes an exact parking slot number, covered roof indicator, and gate access code or bell directions.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-forest-50 text-forest-800 flex items-center justify-center border border-forest-200">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Residential Privacy Shield</h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              Exact residential flat and door numbers are masked for homeowner safety, unlocking only when a booking is confirmed.
            </p>
          </div>
        </div>
      </section>

      {/* CHENNAI LOCALITIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Explore Chennai EV Localities</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Quick jump to active charging corridors across Chennai:
              </p>
            </div>
            <Link
              to="/explore"
              className="text-xs font-bold text-forest-800 hover:text-forest-950 flex items-center gap-1"
            >
              <span>View All on Map</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
            {CHENNAI_NEIGHBORHOODS.map((hood) => (
              <Link
                key={hood.name}
                to={`/explore?lat=${hood.lat}&lng=${hood.lng}`}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-forest-600 hover:bg-forest-50/50 transition text-center group"
              >
                <div className="font-semibold text-xs text-slate-800 group-hover:text-forest-900 truncate">
                  {hood.name}
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                  {hood.lat.toFixed(2)}°, {hood.lng.toFixed(2)}°
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
