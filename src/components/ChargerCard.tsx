import React from 'react';
import {
  Zap,
  MapPin,
  Clock,
  Bookmark,
  ArrowRight,
  ShieldCheck,
  Info,
  Building,
  ParkingCircle
} from 'lucide-react';
import { Charger } from '../types/charger';

interface ChargerCardProps {
  charger: Charger;
  onViewDetails: (charger: Charger) => void;
  isSaved?: boolean;
  onToggleSave?: (id: string) => void;
  isSelected?: boolean;
  onHover?: (charger: Charger | null) => void;
}

export const ChargerCard: React.FC<ChargerCardProps> = ({
  charger,
  onViewDetails,
  isSaved = false,
  onToggleSave,
  isSelected = false,
  onHover,
}) => {
  const coverPhoto = charger.photos && charger.photos.length > 0 ? charger.photos[0] : null;

  return (
    <article
      onMouseEnter={() => onHover && onHover(charger)}
      onMouseLeave={() => onHover && onHover(null)}
      className={`group relative rounded-2xl bg-white border transition-all duration-200 overflow-hidden flex flex-col ${
        isSelected
          ? 'border-forest-600 ring-2 ring-forest-500/30 shadow-md'
          : 'border-slate-200/90 hover:border-slate-300 hover:shadow-sm'
      }`}
    >
      {/* Top Banner / Image & Badges */}
      <div className="relative h-40 w-full bg-slate-100 overflow-hidden shrink-0">
        {coverPhoto ? (
          <img
            src={coverPhoto}
            alt={charger.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400 p-4 text-center">
            <Zap className="w-8 h-8 text-slate-300 mb-1" />
            <span className="text-xs font-medium text-slate-500">No photo uploaded yet</span>
            <span className="text-[10px] text-slate-400">Host provided location coordinates</span>
          </div>
        )}

        {/* Source & Verification Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 items-center max-w-[85%]">
          <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold tracking-tight bg-slate-900/80 backdrop-blur-xs text-white border border-slate-700/60 shadow-xs">
            {charger.listingSource}
          </span>

          {charger.verificationStatus === 'Community Verified' ? (
            <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-800/90 backdrop-blur-xs text-emerald-100 border border-emerald-600/50 shadow-xs flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-300" />
              <span>Verified Host</span>
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-amber-900/90 backdrop-blur-xs text-amber-100 border border-amber-600/50 shadow-xs flex items-center gap-1">
              <Info className="w-3 h-3 text-amber-300" />
              <span>{charger.verificationStatus}</span>
            </span>
          )}
        </div>

        {/* Save / Bookmark Button */}
        {onToggleSave && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(charger.id);
            }}
            aria-label={isSaved ? 'Remove from saved' : 'Save charger'}
            className={`absolute top-2.5 right-2.5 p-2 rounded-xl backdrop-blur-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-forest-600 ${
              isSaved
                ? 'bg-forest-800 text-white shadow-sm'
                : 'bg-white/80 hover:bg-white text-slate-700 hover:text-slate-950 shadow-xs'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-white' : ''}`} />
          </button>
        )}

        {/* Power Badge Floating on Bottom Left of Image */}
        <div className="absolute bottom-2.5 left-2.5 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-slate-200/80 shadow-xs flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${charger.powerType === 'DC' ? 'bg-amber-500' : 'bg-forest-600'}`} />
          <span className="text-xs font-bold text-slate-900 font-mono">
            {charger.powerOutputKw} kW
          </span>
          <span className="text-[10px] font-semibold text-slate-500">
            ({charger.powerType})
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Locality & Property Name */}
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="flex items-center gap-1 font-medium text-forest-800">
              <MapPin className="w-3.5 h-3.5 text-forest-700 shrink-0" />
              {charger.area}
            </span>
            <span className="text-[11px] truncate max-w-[140px] text-slate-400">
              {charger.propertyName || charger.accessType}
            </span>
          </div>

          {/* Charger Name */}
          <h3 className="font-bold text-base text-slate-900 leading-snug line-clamp-1 group-hover:text-forest-800 transition-colors">
            {charger.title}
          </h3>

          {/* Connector Protocol */}
          <div className="mt-2 text-xs font-medium text-slate-700 bg-slate-50 p-2 rounded-xl border border-slate-100 flex items-center justify-between">
            <span className="truncate pr-2 font-mono text-[11px]">{charger.chargerType}</span>
            <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
              {charger.powerType}
            </span>
          </div>

          {/* Parking Slot & Access Type */}
          <div className="mt-2.5 space-y-1 text-xs text-slate-600">
            <div className="flex items-center gap-1.5 text-slate-700">
              <ParkingCircle className="w-3.5 h-3.5 text-forest-700 shrink-0" />
              <span className="font-semibold text-slate-900">Slot:</span>
              <span className="truncate font-mono">{charger.parkingSlotNumber || 'Assigned on arrival'}</span>
              {charger.isCoveredParking && (
                <span className="shrink-0 text-[10px] font-semibold bg-emerald-50 text-emerald-800 px-1 rounded border border-emerald-200">
                  Covered
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
              <Building className="w-3.5 h-3.5 shrink-0 text-slate-400" />
              <span className="truncate">{charger.accessType}</span>
            </div>

            {/* Operating Hours when known */}
            <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
              <Clock className="w-3.5 h-3.5 shrink-0 text-slate-400" />
              <span className="truncate">
                {charger.operatingHours ? charger.operatingHours : 'Hours not specified by host'}
              </span>
            </div>
          </div>
        </div>

        {/* Footer: Tariff when known & View Details Action */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
          <div>
            <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Charging Tariff
            </span>
            {charger.pricePerKwh !== null ? (
              <div className="text-sm font-bold text-slate-900 font-mono">
                ₹{charger.pricePerKwh.toFixed(2)}{' '}
                <span className="text-[11px] font-normal text-slate-500">/ kWh</span>
              </div>
            ) : (
              <div className="text-xs font-medium text-slate-500 italic">
                Tariff not specified
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => onViewDetails(charger)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-forest-800 text-white text-xs font-semibold transition-colors shadow-2xs focus:outline-none focus-visible:ring-2 focus-visible:ring-forest-600"
          >
            <span>View Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </article>
  );
};
