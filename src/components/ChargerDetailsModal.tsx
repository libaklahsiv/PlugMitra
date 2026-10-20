import React, { useState } from 'react';
import {
  X,
  Zap,
  MapPin,
  Bookmark,
  ShieldCheck,
  Info,
  Navigation,
  ExternalLink,
  Flag,
  CheckCircle2,
  Lock,
  ParkingCircle,
  Building,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { Charger, BookingRequest } from '../types/charger';
import { StorageService } from '../services/storage';
import { useAuth } from '../context/AuthContext';

interface ChargerDetailsModalProps {
  charger: Charger | null;
  onClose: () => void;
  onBookingSuccess?: (booking: BookingRequest) => void;
  isSaved?: boolean;
  onToggleSave?: (id: string) => void;
}

export const ChargerDetailsModal: React.FC<ChargerDetailsModalProps> = ({
  charger,
  onClose,
  onBookingSuccess,
  isSaved = false,
  onToggleSave,
}) => {
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('Inaccurate location or parking slot');
  const [reportNotes, setReportNotes] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);

  // Booking Flow State
  const [showBookingModal, setShowBookingModal] = useState(false);
  const userProfile = StorageService.getUserProfile();
  const [bookingDate, setBookingDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [bookingTime, setBookingTime] = useState('10:00 AM - 12:00 PM');
  const [bookingVehicle, setBookingVehicle] = useState(userProfile.vehicleModel || 'Tata Nexon EV');
  const [bookingReg, setBookingReg] = useState(userProfile.vehicleRegNumber || 'TN 07 CK 9012');
  const [bookingSuccessMsg, setBookingSuccessMsg] = useState(false);

  const { user, isAdmin } = useAuth();
  const isOwnerOrAdmin = Boolean(user && (charger?.email === user.email || isAdmin));

  if (!charger) return null;

  const photos = charger.photos && charger.photos.length > 0 ? charger.photos : [];
  const activePhoto = photos[activePhotoIdx] || null;

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.reportListing(charger.id, reportReason, reportNotes);
    setReportSubmitted(true);
    setTimeout(() => {
      setReportSubmitted(false);
      setShowReportModal(false);
      setReportNotes('');
    }, 1800);
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newBooking = StorageService.createBooking({
      chargerId: charger.id,
      chargerTitle: charger.title,
      chargerArea: charger.area,
      parkingSlotNumber: charger.parkingSlotNumber,
      requestedDate: bookingDate,
      requestedTimeSlot: bookingTime,
      estimatedHours: 2,
      vehicleModel: bookingVehicle,
      vehicleNumber: bookingReg,
      status: 'Pending Host Approval',
      tariffPerKwh: charger.pricePerKwh,
      totalEstimatedAmount: charger.pricePerKwh ? Math.round(charger.pricePerKwh * 15) : undefined,
    });

    setBookingSuccessMsg(true);
    setTimeout(() => {
      setBookingSuccessMsg(false);
      setShowBookingModal(false);
      if (onBookingSuccess) {
        onBookingSuccess(newBooking);
      }
    }, 1200);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="charger-detail-title"
    >
      <div
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200/90 flex items-center justify-between bg-white sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-forest-50 text-forest-800 border border-forest-200">
              <Zap className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-forest-700 bg-forest-50 px-2 py-0.5 rounded border border-forest-200">
                  {charger.listingSource}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {charger.area}, Chennai
                </span>
              </div>
              <h2 id="charger-detail-title" className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">
                {charger.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onToggleSave && (
              <button
                type="button"
                onClick={() => onToggleSave(charger.id)}
                className={`p-2.5 rounded-xl border transition-colors ${
                  isSaved
                    ? 'bg-forest-800 text-white border-forest-800'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                }`}
                title={isSaved ? 'Remove from saved' : 'Save charger'}
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-white' : ''}`} />
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-forest-600"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-6 flex-1">
          {/* PHOTO GALLERY */}
          <div>
            <div className="relative h-64 sm:h-80 w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-200">
              {activePhoto ? (
                <img
                  src={activePhoto}
                  alt={`${charger.title} preview`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-6 text-center">
                  <Zap className="w-12 h-12 text-slate-500 mb-2" />
                  <p className="font-semibold text-slate-300">No Photo Uploaded by Host</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm">
                    Host has not uploaded parking slot pictures yet. Location coordinates and slot number are verified.
                  </p>
                </div>
              )}

              {/* Power Badge */}
              <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 shadow-md flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${charger.powerType === 'DC' ? 'bg-amber-500' : 'bg-forest-600'}`} />
                <span>{charger.powerOutputKw} kW ({charger.powerType})</span>
              </div>

              {/* Verification status chip */}
              <div className="absolute top-3 left-3">
                {charger.verificationStatus === 'Community Verified' ? (
                  <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-900/90 backdrop-blur-md text-emerald-100 border border-emerald-500/50 flex items-center gap-1.5 shadow-sm">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Community Verified Listing</span>
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-900/90 backdrop-blur-md text-slate-200 border border-slate-700 flex items-center gap-1.5 shadow-sm">
                    <Info className="w-3.5 h-3.5 text-slate-300" />
                    <span>{charger.verificationStatus}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnail Navigation */}
            {photos.length > 1 && (
              <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1">
                {photos.map((p, idx) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setActivePhotoIdx(idx)}
                    className={`relative w-16 h-14 rounded-xl overflow-hidden border-2 shrink-0 transition ${
                      activePhotoIdx === idx ? 'border-forest-600 ring-2 ring-forest-500/40' : 'border-slate-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={p} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* SENSITIVE LOCATION PRIVACY MASK */}
          {charger.isResidential ? (
            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/90 text-amber-950 flex items-start gap-3">
              <Lock className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="text-xs font-bold uppercase tracking-wider text-amber-800">
                  Residential Privacy Shield Active
                </div>
                <p className="text-xs sm:text-sm text-amber-900">
                  Exact house door number and flat number are hidden to protect resident privacy. Area landmark: <span className="font-semibold">{charger.landmark || charger.area}</span>. Full driveway instructions are unlocked upon booking confirmation.
                </p>
                <div className="text-xs font-mono text-slate-700 mt-1">
                  Location: <span className="font-semibold">{charger.area}, Chennai - {charger.pincode}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 flex items-start gap-3">
              <Building className="w-5 h-5 text-slate-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Full Commercial Address
                </span>
                <p className="text-xs sm:text-sm font-medium mt-0.5">
                  {charger.address}, {charger.area}, Chennai - {charger.pincode}
                </p>
                {charger.landmark && (
                  <p className="text-xs text-slate-500 mt-0.5">Landmark: {charger.landmark}</p>
                )}
              </div>
            </div>
          )}

          {/* KEY TECHNICAL & PARKING SLOT GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Parking Slot Card */}
            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                <ParkingCircle className="w-4 h-4 text-emerald-700" />
                Dedicated Parking Slot
              </span>
              <div className="text-base font-bold text-slate-900 font-mono">
                {charger.parkingSlotNumber || 'Slot unassigned'}
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className={`px-2 py-0.5 rounded-md font-medium ${
                  charger.isCoveredParking
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    : 'bg-slate-100 text-slate-700 border border-slate-200'
                }`}>
                  {charger.isCoveredParking ? '✓ 100% Covered Roof Parking' : 'Open Sky Parking'}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-white text-slate-700 border border-slate-200">
                  {charger.accessType}
                </span>
              </div>
            </div>

            {/* Connector & Power Specs */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-forest-700" />
                Connector & Electrical Rating
              </span>
              <div className="text-sm font-bold text-slate-900 font-mono">
                {charger.chargerType}
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="px-2 py-0.5 rounded-md bg-white font-mono font-bold text-slate-800 border border-slate-200">
                  {charger.powerOutputKw} kW Peak
                </span>
                <span className="px-2 py-0.5 rounded-md bg-white text-slate-700 border border-slate-200">
                  {charger.powerType} Power Supply
                </span>
                <div className="text-[11px] text-slate-500">
                  Compatible with: {charger.compatibleVehicles.join(', ')}
                </div>
              </div>
            </div>
          </div>

          {/* TARIFF, TIMINGS & INSTRUCTIONS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Charging Tariff
              </span>
              {charger.pricePerKwh !== null ? (
                <div className="text-xl font-extrabold text-slate-900 font-mono">
                  ₹{charger.pricePerKwh.toFixed(2)}{' '}
                  <span className="text-xs font-normal text-slate-500">/ kWh</span>
                </div>
              ) : (
                <div className="text-xs font-medium text-slate-500 italic mt-1">
                  Tariff not specified by host
                </div>
              )}
              <div className="text-[11px] text-slate-500">
                Parking fee: {charger.parkingFeePerHour ? `₹${charger.parkingFeePerHour}/hr` : 'Free during charge'}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Operating Schedule
              </span>
              <div className="text-sm font-bold text-slate-900 mt-1">
                {charger.operatingHours || 'Schedule not specified'}
              </div>
              <p className="text-[11px] text-slate-500">
                Prior booking recommended to guarantee slot.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Host Contact
              </span>
              <div className="text-sm font-semibold text-slate-900 mt-1">
                {charger.hostName}
              </div>
              <p className="text-[11px] text-slate-500">
                {charger.phone ? 'Phone verified host' : 'Community listing'}
              </p>
            </div>
          </div>

          {/* ACCESS & GATE INSTRUCTIONS */}
          {charger.specialInstructions && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1">
                Driver Entry & Gate Instructions
              </span>
              {charger.isResidential && !isOwnerOrAdmin ? (
                <div className="flex items-center gap-2 text-xs sm:text-sm text-amber-900 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                  <Lock className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>[Protected by Residential Privacy Shield. Full gate & driveway instructions unlocked upon confirmed booking.]</span>
                </div>
              ) : (
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {charger.specialInstructions}
                </p>
              )}
            </div>
          )}

          {/* AMENITIES */}
          {charger.amenities && charger.amenities.length > 0 && (
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
                Available Amenities
              </span>
              <div className="flex flex-wrap gap-2">
                {charger.amenities.map((am) => (
                  <span
                    key={am}
                    className="px-3 py-1 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-700 capitalize flex items-center gap-1.5 shadow-2xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-forest-700" />
                    <span>{am}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* MAP LOCATION & DIRECTIONS BAR */}
          <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs text-slate-400 font-medium">
                Geographic Coordinates
              </div>
              <div className="font-mono text-sm font-bold text-white flex items-center gap-2 mt-0.5">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span>{charger.latitude.toFixed(6)}° N, {charger.longitude.toFixed(6)}° E</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${charger.latitude},${charger.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-forest-700 hover:bg-forest-600 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Google Maps Directions</span>
                <ExternalLink className="w-3 h-3 ml-0.5" />
              </a>

              <a
                href={`https://www.openstreetmap.org/directions?to=${charger.latitude}%2C${charger.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-none px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition flex items-center justify-center gap-1.5 border border-slate-700"
              >
                <span>OpenStreetMap</span>
              </a>
            </div>
          </div>
        </div>

        {/* BOTTOM ACTION BAR */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 sticky bottom-0 z-20">
          <button
            type="button"
            onClick={() => setShowReportModal(true)}
            className="text-xs text-slate-500 hover:text-rose-600 transition flex items-center gap-1.5 self-start sm:self-center"
          >
            <Flag className="w-3.5 h-3.5" />
            <span>Report Inaccurate or Inactive Listing</span>
          </button>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition"
            >
              Back to Map
            </button>

            <button
              type="button"
              onClick={() => setShowBookingModal(true)}
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-forest-800 hover:bg-forest-900 text-white text-xs font-bold transition shadow-sm flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4 text-emerald-300" />
              <span>Request Slot Booking</span>
            </button>
          </div>
        </div>
      </div>

      {/* REPORT LISTING MODAL */}
      {showReportModal && (
        <div
          className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setShowReportModal(false)}
        >
          <div
            className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                Report Listing
              </h3>
              <button
                type="button"
                onClick={() => setShowReportModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {reportSubmitted ? (
              <div className="p-4 bg-emerald-50 text-emerald-900 rounded-2xl text-xs font-medium flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Thank you. Your feedback has been recorded for review.</span>
              </div>
            ) : (
              <form onSubmit={handleReportSubmit} className="space-y-3">
                <p className="text-xs text-slate-500">
                  Help the PlugMitra community keep Chennai charger listings accurate and trustworthy.
                </p>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Reason for report</label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="Inaccurate location or parking slot">Inaccurate location or parking slot</option>
                    <option value="Charger socket is damaged or non-functional">Charger socket is damaged or non-functional</option>
                    <option value="Society or host denied access on arrival">Society or host denied access on arrival</option>
                    <option value="Tariff charged was different from listing">Tariff charged was different from listing</option>
                    <option value="Listing appears duplicate or unauthorized">Listing appears duplicate or unauthorized</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Additional notes (optional)</label>
                  <textarea
                    rows={3}
                    value={reportNotes}
                    onChange={(e) => setReportNotes(e.target.value)}
                    placeholder="Provide any helpful context for our team..."
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowReportModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs"
                  >
                    Submit Report
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* BOOKING REQUEST MODAL */}
      {showBookingModal && (
        <div
          className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setShowBookingModal(false)}
        >
          <div
            className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-forest-700">
                  Request Slot Booking
                </span>
                <h3 className="font-bold text-slate-900 text-base">
                  {charger.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowBookingModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {bookingSuccessMsg ? (
              <div className="p-6 bg-emerald-50 text-emerald-900 rounded-2xl text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-sm">Booking Request Sent to Host!</h4>
                <p className="text-xs text-emerald-800">
                  You can track status under "My Dashboard". Host contact details will unlock once confirmed.
                </p>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs flex items-center justify-between">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-semibold">Parking Slot</span>
                    <span className="font-bold text-slate-900 font-mono">{charger.parkingSlotNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-semibold">Tariff</span>
                    <span className="font-bold text-slate-900 font-mono">
                      {charger.pricePerKwh ? `₹${charger.pricePerKwh}/kWh` : 'Host agreed'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Date</label>
                    <input
                      type="date"
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      required
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Time Window</label>
                    <select
                      value={bookingTime}
                      onChange={(e) => setBookingTime(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white"
                    >
                      <option value="08:00 AM - 10:00 AM">08:00 AM - 10:00 AM</option>
                      <option value="10:00 AM - 12:00 PM">10:00 AM - 12:00 PM</option>
                      <option value="02:00 PM - 04:00 PM">02:00 PM - 04:00 PM</option>
                      <option value="05:00 PM - 07:00 PM">05:00 PM - 07:00 PM</option>
                      <option value="08:00 PM - 10:00 PM">08:00 PM - 10:00 PM</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">EV Make & Model</label>
                    <input
                      type="text"
                      value={bookingVehicle}
                      onChange={(e) => setBookingVehicle(e.target.value)}
                      required
                      placeholder="e.g. Tata Nexon EV"
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Vehicle Registration #</label>
                    <input
                      type="text"
                      value={bookingReg}
                      onChange={(e) => setBookingReg(e.target.value)}
                      required
                      placeholder="e.g. TN 07 CM 1234"
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-mono uppercase"
                    />
                  </div>
                </div>

                <p className="text-[11px] text-slate-500">
                  <span className="font-semibold text-slate-700">Notice:</span> This sends a booking notification to the host. Payment is settled directly at the venue as per host instructions.
                </p>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowBookingModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 text-xs font-bold text-white bg-forest-800 hover:bg-forest-900 rounded-xl shadow-xs"
                  >
                    Confirm Booking Request
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
