import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  MapPin,
  PlusCircle,
  Compass,
  Copy,
  CheckCircle,
  Info
} from 'lucide-react';
import { InteractiveMap } from '../components/InteractiveMap';
import { CHENNAI_DEFAULT_COORDINATES } from '../types/charger';

export const ExplorePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const initialLat = searchParams.get('lat')
    ? parseFloat(searchParams.get('lat')!)
    : CHENNAI_DEFAULT_COORDINATES.lat;
  const initialLng = searchParams.get('lng')
    ? parseFloat(searchParams.get('lng')!)
    : CHENNAI_DEFAULT_COORDINATES.lng;

  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: isNaN(initialLat) ? CHENNAI_DEFAULT_COORDINATES.lat : initialLat,
    lng: isNaN(initialLng) ? CHENNAI_DEFAULT_COORDINATES.lng : initialLng,
  });

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const latP = searchParams.get('lat');
    const lngP = searchParams.get('lng');
    if (latP && lngP) {
      const parsedLat = parseFloat(latP);
      const parsedLng = parseFloat(lngP);
      if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
        setCoords({ lat: parsedLat, lng: parsedLng });
      }
    }
  }, [searchParams]);

  const handleLocationChange = (lat: number, lng: number) => {
    setCoords({ lat, lng });
  };

  const copyCoords = () => {
    navigator.clipboard.writeText(`${coords.lat}, ${coords.lng}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegisterHere = () => {
    navigate(`/add-charger?lat=${coords.lat}&lng=${coords.lng}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Title & Controls Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold mb-2 border border-brand-200">
            <Compass className="w-3.5 h-3.5" />
            <span>Chennai EV Map Explorer</span>
          </div>
          <h1 className="text-3xl font-extrabold text-navy-950 tracking-tight">
            Explore Chennai Charging Locations
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Navigate the interactive Chennai Leaflet map. Click or drag the marker to target any street, society, or commercial plot.
          </p>
        </div>

        {/* Action Button: Add Charger at Selected Location */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleRegisterHere}
            className="px-5 py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md transition flex items-center gap-2 hover:-translate-y-0.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>List Charger Here</span>
          </button>
        </div>
      </div>

      {/* Main Map Box */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-soft space-y-4">
        <InteractiveMap
          latitude={coords.lat}
          longitude={coords.lng}
          onLocationChange={handleLocationChange}
          isDraggable={true}
          heightClass="h-[500px] lg:h-[580px]"
          showNeighborhoodShortcuts={true}
          popupTitle="Selected Target Point"
        />

        {/* Selected Coordinates Readout Card */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Current Pin Position
              </span>
              <div className="font-mono text-sm sm:text-base font-bold text-navy-950 flex items-center gap-2">
                <span>{coords.lat.toFixed(6)}° N</span>
                <span className="text-slate-400">·</span>
                <span>{coords.lng.toFixed(6)}° E</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={copyCoords}
              className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-slate-900 text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-2xs"
            >
              {copied ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied' : 'Copy Coordinates'}</span>
            </button>

            <button
              type="button"
              onClick={handleRegisterHere}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-navy-900 hover:bg-navy-800 text-white text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-2xs"
            >
              <PlusCircle className="w-4 h-4 text-brand-400" />
              <span>Use for New Charger</span>
            </button>
          </div>
        </div>

        {/* Milestone Note */}
        <div className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-2xl flex items-start gap-2.5 text-xs text-blue-900">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <p>
            <span className="font-semibold">Milestone 1 Active:</span> Map is fully interactive and centered on Chennai with real-time draggable coordinates. As per instructions, live charging station database querying will be connected in future milestones.
          </p>
        </div>
      </div>
    </div>
  );
};
