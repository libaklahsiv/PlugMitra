import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search,
  SlidersHorizontal,
  X,
  PlusCircle,
  RotateCcw,
  WifiOff,
  Map as MapIcon,
  List as ListIcon,
  ArrowUpDown,
  Zap,
  Info
} from 'lucide-react';
import { InteractiveMap } from '../components/InteractiveMap';
import { ChargerCard } from '../components/ChargerCard';
import { ChargerDetailsModal } from '../components/ChargerDetailsModal';
import { StorageService } from '../services/storage';
import { ChargerService } from '../services/chargerService';
import {
  Charger,
  CHENNAI_DEFAULT_COORDINATES
} from '../types/charger';

function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

export const ExplorePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // All chargers from persistent storage
  const [allChargers, setAllChargers] = useState<Charger[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Active view toggle on mobile / small screens
  const [viewMode, setViewMode] = useState<'split' | 'list' | 'map'>('split');
  const [showFiltersModal, setShowFiltersModal] = useState(false);

  // Selected Detail Modal
  const [selectedCharger, setSelectedCharger] = useState<Charger | null>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedConnector, setSelectedConnector] = useState<string>('all');
  const [selectedPowerType, setSelectedPowerType] = useState<'all' | 'AC' | 'DC'>('all');
  const [minPowerKw, setMinPowerKw] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(50);
  const [selectedAccessType, setSelectedAccessType] = useState<string>('all');
  const [maxDistanceKm, setMaxDistanceKm] = useState<number>(30);
  const [sortBy, setSortBy] = useState<'distance' | 'price' | 'power'>('distance');

  // Map center coordinates
  const initialLat = searchParams.get('lat')
    ? parseFloat(searchParams.get('lat')!)
    : CHENNAI_DEFAULT_COORDINATES.lat;
  const initialLng = searchParams.get('lng')
    ? parseFloat(searchParams.get('lng')!)
    : CHENNAI_DEFAULT_COORDINATES.lng;

  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({
    lat: isNaN(initialLat) ? CHENNAI_DEFAULT_COORDINATES.lat : initialLat,
    lng: isNaN(initialLng) ? CHENNAI_DEFAULT_COORDINATES.lng : initialLng,
  });

  // Load initial data
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    const saved = StorageService.getSavedIds();
    setSavedIds(saved);

    ChargerService.getApprovedChargers()
      .then((chargers) => {
        if (!isMounted) return;
        setAllChargers(chargers);
        setIsLoading(false);
      })
      .catch(() => {
        if (!isMounted) return;
        setAllChargers(StorageService.getChargers());
        setIsLoading(false);
      });

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      isMounted = false;
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleToggleSave = (id: string) => {
    StorageService.toggleSave(id);
    setSavedIds(StorageService.getSavedIds());
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedConnector('all');
    setSelectedPowerType('all');
    setMinPowerKw(0);
    setMaxPrice(50);
    setSelectedAccessType('all');
    setMaxDistanceKm(30);
    setSortBy('distance');
    setSearchParams({});
  };

  // Filter & Sort Logic
  const filteredChargers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return allChargers
      .filter((ch) => {
        // Query search
        if (q) {
          const matchTitle = ch.title.toLowerCase().includes(q);
          const matchArea = ch.area.toLowerCase().includes(q);
          const matchAddress = ch.address.toLowerCase().includes(q);
          const matchProperty = ch.propertyName.toLowerCase().includes(q);
          const matchConnector = ch.chargerType.toLowerCase().includes(q);
          if (!matchTitle && !matchArea && !matchAddress && !matchProperty && !matchConnector) {
            return false;
          }
        }

        // Connector type filter
        if (selectedConnector !== 'all' && !ch.chargerType.toLowerCase().includes(selectedConnector.toLowerCase())) {
          return false;
        }

        // Power type filter (AC / DC)
        if (selectedPowerType !== 'all' && ch.powerType !== selectedPowerType) {
          return false;
        }

        // Min kW
        if (minPowerKw > 0 && ch.powerOutputKw < minPowerKw) {
          return false;
        }

        // Max price (if tariff is known)
        if (ch.pricePerKwh !== null && ch.pricePerKwh > maxPrice) {
          return false;
        }

        // Access type
        if (selectedAccessType !== 'all' && !ch.accessType.toLowerCase().includes(selectedAccessType.toLowerCase())) {
          return false;
        }

        // Distance from current map center
        const dist = calculateDistanceKm(mapCenter.lat, mapCenter.lng, ch.latitude, ch.longitude);
        if (dist > maxDistanceKm) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price') {
          // Put known lower prices first; null prices at end
          const pA = a.pricePerKwh ?? 999;
          const pB = b.pricePerKwh ?? 999;
          return pA - pB;
        }
        if (sortBy === 'power') {
          return b.powerOutputKw - a.powerOutputKw;
        }
        // Distance default
        const distA = calculateDistanceKm(mapCenter.lat, mapCenter.lng, a.latitude, a.longitude);
        const distB = calculateDistanceKm(mapCenter.lat, mapCenter.lng, b.latitude, b.longitude);
        return distA - distB;
      });
  }, [
    allChargers,
    searchQuery,
    selectedConnector,
    selectedPowerType,
    minPowerKw,
    maxPrice,
    selectedAccessType,
    maxDistanceKm,
    sortBy,
    mapCenter,
  ]);

  const activeFilterCount =
    (selectedConnector !== 'all' ? 1 : 0) +
    (selectedPowerType !== 'all' ? 1 : 0) +
    (minPowerKw > 0 ? 1 : 0) +
    (maxPrice < 50 ? 1 : 0) +
    (selectedAccessType !== 'all' ? 1 : 0) +
    (maxDistanceKm < 30 ? 1 : 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Offline Alert Banner */}
      {isOffline && (
        <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-2xl text-amber-900 text-xs flex items-center gap-2">
          <WifiOff className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            You are currently offline. Showing cached local charger listings across Chennai.
          </span>
        </div>
      )}

      {/* Header & Search Bar */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-50 text-forest-800 text-xs font-semibold mb-1 border border-forest-200">
              <Zap className="w-3.5 h-3.5 text-forest-700" />
              <span>Chennai Community EV Network</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Explore Chargers & Parking Slots
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Discover residential driveway sockets, apartment bays, and commercial fast chargers in Chennai.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            {/* View Mode Toggle for Mobile / Tablets */}
            <div className="inline-flex lg:hidden bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
                  viewMode === 'list'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ListIcon className="w-3.5 h-3.5" />
                <span>List</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('map')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
                  viewMode === 'map'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <MapIcon className="w-3.5 h-3.5" />
                <span>Map</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => navigate(`/add-charger?lat=${mapCenter.lat}&lng=${mapCenter.lng}`)}
              className="px-4 py-2 rounded-xl bg-forest-800 hover:bg-forest-900 text-white font-semibold text-xs transition flex items-center gap-1.5 shadow-xs"
            >
              <PlusCircle className="w-4 h-4 text-emerald-300" />
              <span className="hidden sm:inline">List a Charger</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>

        {/* Search, Filter Toggle & Sorting Bar */}
        <div className="p-3 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by area (Adyar, OMR, Anna Nagar), street, or connector..."
              className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:bg-white transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 p-1 rounded-full text-slate-400 hover:text-slate-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Filter Pill Toggles */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            {/* Filter Drawer Toggle */}
            <button
              type="button"
              onClick={() => setShowFiltersModal(!showFiltersModal)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition shrink-0 ${
                activeFilterCount > 0
                  ? 'bg-forest-50 text-forest-900 border-forest-300 font-bold'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-forest-800 text-white text-[10px] flex items-center justify-center font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Quick AC / DC Filter */}
            <div className="inline-flex rounded-xl bg-slate-100 p-0.5 border border-slate-200 shrink-0 text-xs">
              <button
                type="button"
                onClick={() => setSelectedPowerType('all')}
                className={`px-2.5 py-1.5 rounded-lg font-medium transition ${
                  selectedPowerType === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setSelectedPowerType('AC')}
                className={`px-2.5 py-1.5 rounded-lg font-medium transition ${
                  selectedPowerType === 'AC' ? 'bg-forest-800 text-white shadow-2xs' : 'text-slate-600'
                }`}
              >
                AC
              </button>
              <button
                type="button"
                onClick={() => setSelectedPowerType('DC')}
                className={`px-2.5 py-1.5 rounded-lg font-medium transition ${
                  selectedPowerType === 'DC' ? 'bg-amber-600 text-white shadow-2xs' : 'text-slate-600'
                }`}
              >
                DC Fast
              </button>
            </div>

            {/* Sorting Dropdown */}
            <div className="relative shrink-0 flex items-center gap-1.5 pl-2 border-l border-slate-200">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'distance' | 'price' | 'power')}
                className="text-xs py-1.5 px-2 bg-transparent border-0 font-semibold text-slate-700 focus:outline-none focus:ring-0 cursor-pointer"
              >
                <option value="distance">Nearest First</option>
                <option value="price">Lowest Tariff</option>
                <option value="power">Highest Power (kW)</option>
              </select>
            </div>

            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs text-slate-500 hover:text-rose-600 flex items-center gap-1 px-2 py-1 shrink-0"
                title="Reset all filters"
              >
                <RotateCcw className="w-3 h-3" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Expanded Filters Panel */}
        {showFiltersModal && (
          <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Detailed Search Filters
              </span>
              <button
                type="button"
                onClick={() => setShowFiltersModal(false)}
                className="text-xs text-slate-500 hover:text-slate-800"
              >
                Done
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              {/* Connector Protocol */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Connector Protocol</label>
                <select
                  value={selectedConnector}
                  onChange={(e) => setSelectedConnector(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-300 bg-white"
                >
                  <option value="all">All Connectors</option>
                  <option value="Type 2">Type 2 AC (Fast AC)</option>
                  <option value="CCS2">CCS2 (DC Fast Charger)</option>
                  <option value="15A">15A Standard 3-Pin Socket</option>
                  <option value="Bharat">Bharat AC/DC</option>
                </select>
              </div>

              {/* Min Power (kW) */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Min Power: {minPowerKw === 0 ? 'Any Power' : `${minPowerKw} kW+`}
                </label>
                <select
                  value={minPowerKw}
                  onChange={(e) => setMinPowerKw(Number(e.target.value))}
                  className="w-full p-2 rounded-xl border border-slate-300 bg-white"
                >
                  <option value={0}>Any Power (3.3 - 60+ kW)</option>
                  <option value={7}>7.2 kW+ (Standard Fast AC)</option>
                  <option value={15}>15 kW+ (Commercial AC/DC)</option>
                  <option value={30}>30 kW+ (Rapid DC)</option>
                  <option value={50}>50 kW+ (High Speed DC)</option>
                </select>
              </div>

              {/* Max Tariff per kWh */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Max Tariff: {maxPrice >= 50 ? 'No limit' : `Up to ₹${maxPrice}/kWh`}
                </label>
                <select
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full p-2 rounded-xl border border-slate-300 bg-white"
                >
                  <option value={50}>Any Tariff</option>
                  <option value={15}>Under ₹15 / kWh</option>
                  <option value={18}>Under ₹18 / kWh</option>
                  <option value={22}>Under ₹22 / kWh</option>
                </select>
              </div>

              {/* Access Type */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Property Access Type</label>
                <select
                  value={selectedAccessType}
                  onChange={(e) => setSelectedAccessType(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-300 bg-white"
                >
                  <option value="all">All Access Types</option>
                  <option value="House">Villa / Driveway</option>
                  <option value="Apartment">Gated Society / Apartment</option>
                  <option value="Commercial">Commercial Plaza / Mall</option>
                  <option value="Office">Office / IT Tech Park</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MAIN SPLIT-SCREEN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: RESULTS & CARDS (Visible on Desktop OR when mobile viewMode is 'list' or 'split') */}
        <div
          className={`space-y-4 lg:col-span-5 ${
            viewMode === 'map' ? 'hidden lg:block' : 'block'
          }`}
        >
          {/* Results count & status */}
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>
              Showing <strong className="text-slate-900">{filteredChargers.length}</strong> verified locations
            </span>
            <span className="text-[11px] text-slate-400">
              Sorted by: {sortBy === 'distance' ? 'Proximity' : sortBy === 'price' ? 'Tariff' : 'Power'}
            </span>
          </div>

          {/* SKELETON LOADER */}
          {isLoading && (
            <div className="space-y-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="rounded-2xl bg-white border border-slate-200 p-4 space-y-3 animate-pulse">
                  <div className="h-32 bg-slate-200 rounded-xl" />
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                  <div className="h-8 bg-slate-100 rounded-xl" />
                </div>
              ))}
            </div>
          )}

          {/* EMPTY STATE */}
          {!isLoading && filteredChargers.length === 0 && (
            <div className="p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">No Chargers Found</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                No charging locations match your current filters. Try relaxing the power, tariff, or area criteria.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-4 py-2 rounded-xl bg-forest-800 text-white text-xs font-semibold hover:bg-forest-900 transition"
              >
                Reset All Filters
              </button>
            </div>
          )}

          {/* CARDS LIST */}
          {!isLoading && filteredChargers.length > 0 && (
            <div className="space-y-4 max-h-[calc(100vh-240px)] overflow-y-auto pr-1">
              {filteredChargers.map((ch) => (
                <ChargerCard
                  key={ch.id}
                  charger={ch}
                  onViewDetails={(item) => setSelectedCharger(item)}
                  isSaved={savedIds.includes(ch.id)}
                  onToggleSave={handleToggleSave}
                  isSelected={selectedCharger?.id === ch.id}
                />
              ))}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: STICKY INTERACTIVE MAP (Visible on Desktop OR when mobile viewMode is 'map' or 'split') */}
        <div
          className={`lg:col-span-7 lg:sticky lg:top-24 space-y-3 ${
            viewMode === 'list' ? 'hidden lg:block' : 'block'
          }`}
        >
          <InteractiveMap
            latitude={mapCenter.lat}
            longitude={mapCenter.lng}
            onLocationChange={(lat, lng) => setMapCenter({ lat, lng })}
            isDraggable={false}
            heightClass="h-[460px] sm:h-[580px] lg:h-[640px]"
            showNeighborhoodShortcuts={true}
            chargers={filteredChargers}
            selectedChargerId={selectedCharger?.id}
            onSelectCharger={(item) => setSelectedCharger(item)}
          />

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-forest-700 shrink-0" />
              <span>Click any marker to preview station specs and parking slot designation.</span>
            </div>
            <button
              type="button"
              onClick={() => navigate(`/add-charger?lat=${mapCenter.lat}&lng=${mapCenter.lng}`)}
              className="text-forest-800 hover:text-forest-950 font-bold shrink-0 ml-2"
            >
              List Charger Here →
            </button>
          </div>
        </div>
      </div>

      {/* DEDICATED CHARGER DETAILS MODAL */}
      <ChargerDetailsModal
        charger={selectedCharger}
        onClose={() => setSelectedCharger(null)}
        isSaved={selectedCharger ? savedIds.includes(selectedCharger.id) : false}
        onToggleSave={handleToggleSave}
        onBookingSuccess={() => {
          // Keep state refreshed
        }}
      />
    </div>
  );
};
