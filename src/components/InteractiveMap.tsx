import React, { useMemo, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import {
  MapPin,
  Crosshair,
  Compass,
  CheckCircle2
} from 'lucide-react';
import { CHENNAI_DEFAULT_COORDINATES, CHENNAI_NEIGHBORHOODS } from '../types/charger';

// Leaflet default icon asset resolution fix for bundlers
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface InteractiveMapProps {
  latitude: number;
  longitude: number;
  onLocationChange: (lat: number, lng: number) => void;
  isDraggable?: boolean;
  heightClass?: string;
  showNeighborhoodShortcuts?: boolean;
  readOnly?: boolean;
  popupTitle?: string;
  parkingSlot?: string;
}

// Inner helper to handle clicks on the map canvas
function MapEventsHandler({
  onLocationSelect,
  readOnly,
}: {
  onLocationSelect: (lat: number, lng: number) => void;
  readOnly?: boolean;
}) {
  useMapEvents({
    click(e) {
      if (readOnly) return;
      onLocationSelect(
        Number(e.latlng.lat.toFixed(6)),
        Number(e.latlng.lng.toFixed(6))
      );
    },
  });
  return null;
}

// Map pan/fly controller
function MapFlyController({ center }: { center: [number, number] }) {
  const map = useMap();
  const prevCenterRef = useRef<[number, number]>(center);

  useEffect(() => {
    const [prevLat, prevLng] = prevCenterRef.current;
    const [newLat, newLng] = center;
    const distance = Math.hypot(newLat - prevLat, newLng - prevLng);

    // Only pan if changed significantly
    if (distance > 0.0001) {
      map.flyTo(center, Math.max(map.getZoom(), 15), {
        duration: 0.9,
      });
      prevCenterRef.current = center;
    }
  }, [center, map]);

  return null;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  latitude,
  longitude,
  onLocationChange,
  isDraggable = true,
  heightClass = 'h-[360px] md:h-[440px]',
  showNeighborhoodShortcuts = true,
  readOnly = false,
  popupTitle = 'Selected EV Charger Location',
  parkingSlot,
}) => {
  // Custom styled Leaflet DivIcon for PlugMitra with EV brand styling
  const customIcon = useMemo(() => {
    return L.divIcon({
      className: 'plugmitra-div-marker',
      html: `
        <div class="plugmitra-marker-pin">
          <div class="plugmitra-marker-pulse"></div>
          <div class="plugmitra-marker-core">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
            </svg>
          </div>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
      popupAnchor: [0, -22],
    });
  }, []);

  const markerRef = useRef<L.Marker>(null);

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const latLng = marker.getLatLng();
          onLocationChange(
            Number(latLng.lat.toFixed(6)),
            Number(latLng.lng.toFixed(6))
          );
        }
      },
    }),
    [onLocationChange]
  );

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onLocationChange(
          Number(pos.coords.latitude.toFixed(6)),
          Number(pos.coords.longitude.toFixed(6))
        );
      },
      () => {
        // Fallback to center Chennai if permission denied or error
        onLocationChange(
          CHENNAI_DEFAULT_COORDINATES.lat,
          CHENNAI_DEFAULT_COORDINATES.lng
        );
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleNeighborhoodSelect = (lat: number, lng: number) => {
    onLocationChange(Number(lat.toFixed(6)), Number(lng.lng ? lng.toFixed(6) : lng));
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200/90 shadow-sm bg-white">
      {/* Top Map Bar with Instructions & Locality jumps */}
      <div className="p-3 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-slate-100 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-brand-400" />
            Interactive Chennai Map
          </span>
          <span className="hidden sm:inline text-slate-400 text-[11px]">
            {readOnly ? 'Showing station coordinates' : 'Click anywhere or drag the green pin'}
          </span>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {!readOnly && (
            <button
              type="button"
              onClick={handleGetCurrentLocation}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition font-medium border border-slate-700 active:scale-95"
              title="Use my device GPS location"
            >
              <Crosshair className="w-3.5 h-3.5 text-brand-400" />
              <span>Use Current GPS</span>
            </button>
          )}

          <button
            type="button"
            onClick={() =>
              onLocationChange(
                CHENNAI_DEFAULT_COORDINATES.lat,
                CHENNAI_DEFAULT_COORDINATES.lng
              )
            }
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition font-medium border border-slate-700"
            title="Reset to Central Chennai"
          >
            <Compass className="w-3.5 h-3.5 text-accent-400" />
            <span>Reset Chennai</span>
          </button>
        </div>
      </div>

      {/* Map Body */}
      <div className={`w-full ${heightClass} relative z-0`}>
        <MapContainer
          center={[latitude, longitude]}
          zoom={14}
          scrollWheelZoom={true}
          className="w-full h-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapFlyController center={[latitude, longitude]} />

          {!readOnly && (
            <MapEventsHandler
              onLocationSelect={onLocationChange}
              readOnly={readOnly}
            />
          )}

          <Marker
            position={[latitude, longitude]}
            draggable={!readOnly && isDraggable}
            eventHandlers={eventHandlers}
            ref={markerRef}
            icon={customIcon}
          >
            <Popup>
              <div className="p-1 space-y-1.5 max-w-[220px]">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-brand-500"></div>
                  <p className="font-semibold text-slate-900 text-xs">{popupTitle}</p>
                </div>
                {parkingSlot && (
                  <p className="text-[11px] text-slate-700 bg-slate-100 px-2 py-0.5 rounded font-mono font-medium">
                    Parking Slot: <span className="font-bold text-navy-800">{parkingSlot}</span>
                  </p>
                )}
                <div className="text-[11px] font-mono text-slate-600 bg-slate-50 p-1.5 rounded border border-slate-100">
                  <div>Lat: <span className="font-semibold text-slate-800">{latitude.toFixed(6)}</span></div>
                  <div>Lng: <span className="font-semibold text-slate-800">{longitude.toFixed(6)}</span></div>
                </div>
                {!readOnly && (
                  <p className="text-[10px] text-emerald-700 flex items-center gap-1 font-medium">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Drag marker to fine-tune parking spot
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        </MapContainer>

        {/* Live Coordinate Floater */}
        <div className="absolute bottom-3 left-3 z-[400] bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-md border border-slate-200 text-xs flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-slate-600">
            <span className="w-2 h-2 rounded-full bg-brand-500" />
            <span className="font-medium text-slate-800">Coordinates:</span>
          </div>
          <div className="font-mono text-slate-900 font-semibold flex items-center gap-2">
            <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">{latitude.toFixed(5)}° N</span>
            <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">{longitude.toFixed(5)}° E</span>
          </div>
        </div>
      </div>

      {/* Neighborhood Quick-Jump Bar */}
      {showNeighborhoodShortcuts && !readOnly && (
        <div className="p-2.5 bg-slate-50 border-t border-slate-200">
          <div className="flex items-center gap-1.5 text-xs text-slate-600 mb-1.5 px-1 font-medium">
            <span>Quick jump to Chennai localities:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {CHENNAI_NEIGHBORHOODS.map((hood) => {
              const isNear =
                Math.abs(latitude - hood.lat) < 0.015 &&
                Math.abs(longitude - hood.lng) < 0.015;
              return (
                <button
                  key={hood.name}
                  type="button"
                  onClick={() => handleNeighborhoodSelect(hood.lat, hood.lng)}
                  className={`text-xs px-2.5 py-1 rounded-full transition font-medium border ${
                    isNear
                      ? 'bg-brand-600 text-white border-brand-700 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  {hood.name}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
