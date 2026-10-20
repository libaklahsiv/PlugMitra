import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Bookmark,
  Calendar,
  Zap,
  Building,
  PlusCircle,
  Clock,
  MapPin,
  Power,
  Trash2,
  ArrowRight,
  Car,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  XCircle,
  LogIn,
  Lock
} from 'lucide-react';
import { StorageService } from '../services/storage';
import { ChargerService } from '../services/chargerService';
import { useAuth } from '../context/AuthContext';
import { Charger, BookingRequest, UserProfile } from '../types/charger';
import { ChargerDetailsModal } from '../components/ChargerDetailsModal';

export const DashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'driver' | 'host' | 'moderation'>('driver');
  const { user, profile, isAdmin, openAuthModal } = useAuth();

  const [savedChargers, setSavedChargers] = useState<Charger[]>([]);
  const [hostListings, setHostListings] = useState<Charger[]>([]);
  const [pendingChargers, setPendingChargers] = useState<Charger[]>([]);
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>(StorageService.getUserProfile());

  const [selectedChargerForModal, setSelectedChargerForModal] = useState<Charger | null>(null);
  const [deleteConfirmationId, setDeleteConfirmationId] = useState<string | null>(null);
  const [moderationMsg, setModerationMsg] = useState<{ id: string; text: string; type: 'success' | 'error' } | null>(null);
  const [bookingActionMsg, setBookingActionMsg] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    const savedIds = await ChargerService.getSavedChargerIds(user);
    const allChargers = StorageService.getChargers();
    setSavedChargers(allChargers.filter((c) => savedIds.includes(c.id)));
    const userChargers = await ChargerService.getUserChargers(user);
    setHostListings(userChargers);
    const pending = await ChargerService.getPendingChargers();
    setPendingChargers(pending);
    setBookings(StorageService.getBookings(user?.id));
    setUserProfile(StorageService.getUserProfile(user?.id));
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleToggleActive = (id: string, current: boolean) => {
    StorageService.updateChargerStatus(id, !current);
    loadData();
  };

  const handleDeleteListing = (id: string) => {
    StorageService.deleteCharger(id);
    setDeleteConfirmationId(null);
    loadData();
  };

  const handleBookingStatusChange = (id: string, status: BookingRequest['status']) => {
    StorageService.updateBookingStatus(id, status, user?.id);
    loadData();
  };

  const handleRemoveSaved = async (id: string) => {
    await ChargerService.toggleSavedCharger(id, user);
    await loadData();
  };

  const handleApprovePending = async (chargerId: string) => {
    const target = pendingChargers.find((c) => c.id === chargerId);
    if (target?.ownerId && user?.id && target.ownerId === user.id) {
      setModerationMsg({
        id: chargerId,
        text: 'Self-approval blocked: Platform security rules prohibit hosts from approving their own listings.',
        type: 'error',
      });
      return;
    }

    const { error } = await ChargerService.updateApprovalStatus(chargerId, 'approved', { currentUser: user, isAdmin });
    if (error) {
      setModerationMsg({ id: chargerId, text: `Approval failed: ${error.message}`, type: 'error' });
    } else {
      setModerationMsg({ id: chargerId, text: 'Listing approved! Now discoverable on Chennai Explore map.', type: 'success' });
      await loadData();
    }
  };

  const handleRejectPending = async (chargerId: string) => {
    const { error } = await ChargerService.updateApprovalStatus(chargerId, 'rejected', { currentUser: user, isAdmin });
    if (error) {
      setModerationMsg({ id: chargerId, text: `Rejection failed: ${error.message}`, type: 'error' });
    } else {
      setModerationMsg({ id: chargerId, text: 'Listing marked as rejected.', type: 'success' });
      await loadData();
    }
  };
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Title & Top Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-50 text-forest-800 text-xs font-semibold mb-2 border border-forest-200">
            <LayoutDashboard className="w-3.5 h-3.5 text-forest-700" />
            <span>Chennai EV Management Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My PlugMitra Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage your saved charging points, driver booking requests, and host parking slot listings.
          </p>
        </div>

        {/* Tab Toggle: Driver Mode vs Host Mode vs Admin Moderation */}
        <div className="inline-flex rounded-2xl bg-slate-100 p-1 border border-slate-200 self-start sm:self-auto text-xs font-bold shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveTab('driver')}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-2 ${
              activeTab === 'driver'
                ? 'bg-white text-forest-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Car className="w-4 h-4 text-forest-700" />
            <span>Driver Dashboard</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('host')}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-2 ${
              activeTab === 'host'
                ? 'bg-white text-forest-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building className="w-4 h-4 text-forest-700" />
            <span>Host / Owner Dashboard</span>
          </button>
          {isAdmin && (
            <button
              type="button"
              onClick={() => setActiveTab('moderation')}
              className={`px-4 py-2 rounded-xl transition flex items-center gap-2 ${
                activeTab === 'moderation'
                  ? 'bg-white text-forest-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Admin Moderation</span>
              {pendingChargers.length > 0 && (
                <span className="px-1.5 py-0.2 bg-amber-500 text-white rounded-full text-[10px] font-bold">
                  {pendingChargers.length}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* User Login / Profile Status Bar */}
      {!user ? (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <span className="font-bold text-amber-950">Viewing Local Browser Session</span>
              <p className="text-amber-800 text-[11px]">
                Sign in to link charger registrations and bookings to your authenticated profile.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => openAuthModal('login')}
            className="px-4 py-2 rounded-xl bg-forest-800 hover:bg-forest-900 text-white font-bold text-xs shrink-0 flex items-center gap-1.5 transition self-start sm:self-auto"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In / Create Account</span>
          </button>
        </div>
      ) : (
        <div className="p-3.5 px-5 bg-white border border-slate-200/90 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-forest-800 text-white flex items-center justify-center font-bold text-xs">
              {(profile?.full_name || user.email || 'U')[0].toUpperCase()}
            </div>
            <div>
              <span className="font-bold text-slate-900">{profile?.full_name || 'Community Member'}</span>
              <span className="text-slate-500 text-[11px] block">{user.email}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-forest-50 text-forest-800 border border-forest-200 text-[11px] font-semibold capitalize">
              Role: {profile?.role || (isAdmin ? 'Admin' : 'Host')}
            </span>
          </div>
        </div>
      )}

      {/* DRIVER DASHBOARD TAB */}
      {activeTab === 'driver' && (
        <div className="space-y-8 animate-fade-in">
          {/* Driver Vehicle Preference Card */}
          <div className="p-5 bg-white rounded-3xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-forest-50 text-forest-800 flex items-center justify-center shrink-0 border border-forest-200">
                <Car className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Active Vehicle Profile</span>
                <div className="text-base font-bold text-slate-900">
                  {profile?.vehicle_make || userProfile.vehicleMake} {profile?.vehicle_model || userProfile.vehicleModel}
                </div>
                <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5 font-mono">
                  <span>Reg: {profile?.vehicle_reg_number || userProfile.vehicleRegNumber}</span>
                  <span>•</span>
                  <span>Battery: {profile?.battery_capacity_kwh ?? userProfile.batteryCapacityKwh} kWh</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/profile"
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Edit Vehicle Preferences
              </Link>
              <Link
                to="/explore"
                className="px-4 py-2 rounded-xl bg-forest-800 hover:bg-forest-900 text-white text-xs font-semibold transition"
              >
                Find Nearby Chargers
              </Link>
            </div>
          </div>

          {/* Section: Booking Requests */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-forest-700" />
                  Charging Slot Booking Requests
                </h2>
                <p className="text-xs text-slate-500">
                  Track time slots requested at residential or commercial charging bays.
                </p>
              </div>
              <span className="text-xs font-medium bg-amber-50 text-amber-900 border border-amber-200 px-2.5 py-1 rounded-full">
                Demo state: backend pending
              </span>
            </div>

            {bookings.length === 0 ? (
              <div className="p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-2">
                <Clock className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="font-semibold text-slate-700 text-sm">No Active Booking Requests</p>
                <p className="text-xs text-slate-500">
                  Select a charger from Explore Chargers to request a designated parking slot.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bookings.map((b) => (
                  <div
                    key={b.id}
                    className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-forest-800 bg-forest-50 px-2 py-0.5 rounded border border-forest-200">
                          {b.chargerArea}
                        </span>
                        <h3 className="font-bold text-slate-900 text-sm mt-1">{b.chargerTitle}</h3>
                        <p className="text-xs font-mono text-slate-600">Parking Slot: {b.parkingSlotNumber}</p>
                      </div>

                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          b.status === 'Confirmed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : b.status === 'Pending Host Approval'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {b.status}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Date:</span>
                        <span className="font-semibold text-slate-800">{b.requestedDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Window:</span>
                        <span className="font-semibold text-slate-800">{b.requestedTimeSlot}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Vehicle:</span>
                        <span className="font-mono text-slate-800">{b.vehicleModel} ({b.vehicleNumber})</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                      {b.isDemo && (
                        <span className="text-[10px] text-slate-400 italic">Sample booking record</span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleBookingStatusChange(b.id, 'Completed')}
                        className="text-xs text-forest-800 hover:text-forest-950 font-bold ml-auto"
                      >
                        Mark as Completed
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section: Saved Chargers */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Bookmark className="w-5 h-5 text-forest-700" />
                  Saved Charging Locations ({savedChargers.length})
                </h2>
                <p className="text-xs text-slate-500">
                  Quick access to your preferred neighborhood charging bays in Chennai.
                </p>
              </div>
            </div>

            {savedChargers.length === 0 ? (
              <div className="p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-3">
                <Bookmark className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="font-semibold text-slate-700 text-sm">No Saved Chargers Yet</p>
                <p className="text-xs text-slate-500">
                  Tap the bookmark icon on any charger card in the Explore page to pin it here.
                </p>
                <Link
                  to="/explore"
                  className="inline-block px-4 py-2 rounded-xl bg-forest-800 text-white text-xs font-semibold"
                >
                  Explore Chargers
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedChargers.map((ch) => (
                  <div
                    key={ch.id}
                    className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                        <span className="font-bold text-forest-800 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-forest-700" />
                          {ch.area}
                        </span>
                        <span className="font-mono font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded">
                          {ch.powerOutputKw} kW
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm leading-snug">{ch.title}</h4>
                      <p className="text-xs font-mono text-slate-600 mt-1">Slot: {ch.parkingSlotNumber}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Tariff: {ch.pricePerKwh ? `₹${ch.pricePerKwh}/kWh` : 'Not specified'}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedChargerForModal(ch)}
                        className="text-xs font-bold text-forest-800 hover:text-forest-950 flex items-center gap-1"
                      >
                        <span>View Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRemoveSaved(ch.id)}
                        className="text-xs text-rose-600 hover:text-rose-800"
                        title="Remove from saved"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* HOST / OWNER DASHBOARD TAB */}
      {activeTab === 'host' && (
        <div className="space-y-8 animate-fade-in">
          {/* Host Summary Bar */}
          <div className="p-6 bg-forest-900 text-white rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                Chennai Host Portal
              </span>
              <h2 className="text-xl font-bold mt-0.5">
                Manage Your Charging Points & Parking Slots
              </h2>
              <p className="text-xs text-slate-300 mt-1 max-w-xl">
                Keep your parking slot number, socket availability, and operating hours up to date for Chennai EV owners.
              </p>
            </div>

            <Link
              to="/add-charger"
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-forest-950 font-bold text-xs transition flex items-center gap-2 self-start md:self-auto shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span>List Another Charger</span>
            </Link>
          </div>

          {/* Host Listings */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Building className="w-5 h-5 text-forest-700" />
              Your Registered Charging Locations ({hostListings.length})
            </h3>

            {hostListings.length === 0 ? (
              <div className="p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-3">
                <Zap className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="font-semibold text-slate-700 text-sm">No Listings Found</p>
                <p className="text-xs text-slate-500">
                  Register your residential driveway, parking bay, or commercial socket to start welcoming drivers.
                </p>
                <Link
                  to="/add-charger"
                  className="inline-block px-5 py-2.5 rounded-xl bg-forest-800 text-white text-xs font-bold"
                >
                  List a Charger Now
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {hostListings.map((ch) => (
                  <div
                    key={ch.id}
                    className="p-5 bg-white rounded-3xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-forest-800 bg-forest-50 px-2 py-0.5 rounded border border-forest-200">
                          {ch.area}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            ch.isActive
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {ch.isActive ? 'Active & Discoverable' : 'Temporarily Inactive'}
                        </span>
                        <span className="text-[10px] text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                          Status: {ch.verificationStatus}
                        </span>
                      </div>

                      <h4 className="font-bold text-base text-slate-900">{ch.title}</h4>
                      <p className="text-xs text-slate-600">
                        Property: <span className="font-semibold">{ch.propertyName}</span> · Parking Slot:{' '}
                        <span className="font-mono font-bold text-forest-900 bg-forest-50 px-1.5 py-0.5 rounded border border-forest-200">
                          {ch.parkingSlotNumber}
                        </span>
                      </p>

                      <div className="text-xs text-slate-500 flex flex-wrap gap-3 font-mono pt-1">
                        <span>{ch.powerOutputKw} kW ({ch.powerType})</span>
                        <span>•</span>
                        <span>{ch.pricePerKwh ? `₹${ch.pricePerKwh}/kWh` : 'No tariff set'}</span>
                        <span>•</span>
                        <span>{ch.latitude.toFixed(4)}°N, {ch.longitude.toFixed(4)}°E</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(ch.id, ch.isActive)}
                        className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition ${
                          ch.isActive
                            ? 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold'
                        }`}
                      >
                        <Power className="w-3.5 h-3.5" />
                        <span>{ch.isActive ? 'Pause Listing' : 'Activate'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedChargerForModal(ch)}
                        className="px-3.5 py-2 rounded-xl bg-forest-800 hover:bg-forest-900 text-white text-xs font-semibold transition"
                      >
                        Preview Listing
                      </button>

                      {ch.isUserCreated && (
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmationId(ch.id)}
                          className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 transition border border-rose-200"
                          title="Delete listing"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Host Incoming Driver Booking Requests Simulation */}
          <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-forest-700" />
                  Incoming Driver Booking Inquiries
                </h4>
                <p className="text-xs text-slate-500">
                  Driver requests sent to your listed slots across Chennai.
                </p>
              </div>
              <span className="text-[11px] font-bold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-full">
                Demo state: backend pending
              </span>
            </div>

            {bookingActionMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-900 text-xs font-semibold flex items-center gap-2 animate-slide-up">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{bookingActionMsg}</span>
              </div>
            )}

            <div className="p-4 bg-white rounded-2xl border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="font-bold text-slate-900">
                  Sanjay Kumar · Tata Nexon EV (TN 09 BK 2244)
                </div>
                <div className="text-slate-500 mt-0.5">
                  Requested 2 hours on tomorrow morning (09:00 AM) for Slot P-04.
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setBookingActionMsg('Slot P-04 approved for Sanjay Kumar. Confirmation status updated.');
                    setTimeout(() => setBookingActionMsg(null), 4000);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-2xs transition"
                >
                  Approve Slot
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setBookingActionMsg('Driver inquiry declined. Slot marked unavailable for requested slot.');
                    setTimeout(() => setBookingActionMsg(null), 4000);
                  }}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition"
                >
                  Decline
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADMIN MODERATION TAB */}
      {activeTab === 'moderation' && !isAdmin && (
        <div className="p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-4 max-w-lg mx-auto my-8">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto border border-amber-200">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Administrator Access Required</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            The Community Charger Moderation Console is strictly restricted to verified platform administrators. In accordance with safety rules, hosts cannot approve their own listings.
          </p>
          <button
            type="button"
            onClick={() => setActiveTab('driver')}
            className="px-4 py-2 rounded-xl bg-forest-800 text-white text-xs font-semibold hover:bg-forest-900 transition"
          >
            Return to Driver Dashboard
          </button>
        </div>
      )}

      {activeTab === 'moderation' && isAdmin && (
        <div className="space-y-8 animate-fade-in">
          {/* Moderation Banner */}
          <div className="p-6 bg-slate-900 text-white rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold uppercase tracking-wider mb-2">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Listing Review & Safety Guard</span>
              </div>
              <h2 className="text-xl font-bold">
                Community Charger Moderation Console
              </h2>
              <p className="text-xs text-slate-300 mt-1 max-w-xl">
                Review newly registered community chargers, verify parking slots, and approve or reject submissions before they become publicly discoverable across Chennai.
              </p>
            </div>
          </div>

          {moderationMsg && (
            <div
              className={`p-4 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-slide-up ${
                moderationMsg.type === 'success'
                  ? 'bg-emerald-50 border border-emerald-300 text-emerald-900'
                  : 'bg-rose-50 border border-rose-300 text-rose-900'
              }`}
            >
              {moderationMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{moderationMsg.text}</span>
            </div>
          )}

          {/* Pending Submissions List */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" />
              <span>Pending Community Submissions ({pendingChargers.length})</span>
            </h3>

            {pendingChargers.length === 0 ? (
              <div className="p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-3">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <p className="font-semibold text-slate-800 text-sm">All Submissions Moderated</p>
                <p className="text-xs text-slate-500">
                  There are currently no community chargers waiting for review. New listings will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingChargers.map((ch) => (
                  <div
                    key={ch.id}
                    className="p-5 bg-white rounded-3xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          ⏳ Status: Pending Review
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-forest-800 bg-forest-50 px-2 py-0.5 rounded border border-forest-200">
                          {ch.area}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          Submitted on {new Date(ch.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <h4 className="font-bold text-base text-slate-900">{ch.title}</h4>
                      <p className="text-xs text-slate-600">
                        Property: <span className="font-semibold">{ch.propertyName}</span> · Parking Slot:{' '}
                        <span className="font-mono font-bold text-forest-900 bg-forest-50 px-1.5 py-0.5 rounded border border-forest-200">
                          {ch.parkingSlotNumber}
                        </span>
                      </p>
                      <p className="text-xs text-slate-500">
                        Address: {ch.address} {ch.landmark ? `(Landmark: ${ch.landmark})` : ''}
                      </p>

                      <div className="text-xs text-slate-500 flex flex-wrap gap-3 font-mono pt-1">
                        <span>{ch.powerOutputKw} kW ({ch.powerType})</span>
                        <span>•</span>
                        <span>{ch.pricePerKwh ? `₹${ch.pricePerKwh}/kWh` : 'No tariff set'}</span>
                        <span>•</span>
                        <span>{ch.latitude.toFixed(4)}°N, {ch.longitude.toFixed(4)}°E</span>
                        <span>•</span>
                        <span>Access: {ch.accessType}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                      <button
                        type="button"
                        onClick={() => setSelectedChargerForModal(ch)}
                        className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition"
                      >
                        Inspect Details
                      </button>

                      <button
                        type="button"
                        onClick={() => handleApprovePending(ch.id)}
                        className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-2xs transition flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve Listing</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRejectPending(ch.id)}
                        className="px-3 py-2 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold transition flex items-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmationId && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setDeleteConfirmationId(null)}
        >
          <div
            className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-base">Remove Charger Listing?</h4>
            <p className="text-xs text-slate-600">
              This will remove this parking slot and charger from the local Chennai map. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmationId(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteListing(deleteConfirmationId)}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PREVIEW */}
      <ChargerDetailsModal
        charger={selectedChargerForModal}
        onClose={() => setSelectedChargerForModal(null)}
      />
    </div>
  );
};
