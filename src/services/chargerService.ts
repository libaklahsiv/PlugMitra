import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import { StorageService } from './storage';
import {
  Charger,
  ChargerRegistrationFormData,
  AccessType,
} from '../types/charger';
import { AccessTypeDb, ChargerStatusDb } from '../types/supabase';
import { AppUser } from '../context/AuthContext';

// Map UI access types to database string: 'public' | 'semi-private' | 'private'
export function mapAccessTypeToDb(accessType: AccessType): AccessTypeDb {
  if (accessType.includes('Independent House') || accessType.includes('Villa')) {
    return 'private';
  }
  if (accessType.includes('Apartment') || accessType.includes('Gated Society')) {
    return 'semi-private';
  }
  return 'public';
}

export function mapDbToUiAccessType(accessTypeDb: AccessTypeDb): AccessType {
  if (accessTypeDb === 'private') {
    return 'Independent House / Villa Driveway';
  }
  if (accessTypeDb === 'semi-private') {
    return 'Apartment / Gated Society Parking';
  }
  return 'Commercial Shop / Complex';
}

export const ChargerService = {
  // Fetch all approved chargers for the Explore page
  async getApprovedChargers(): Promise<Charger[]> {
    const fallbackChargers = StorageService.getChargers().filter(
      (c) => c.isApproved === true && c.status !== 'pending' && c.status !== 'rejected' && c.isActive !== false
    );

    try {
      const chargersColl = collection(db, 'chargers');
      const q = query(chargersColl, where('status', '==', 'approved'));
      const snap = await getDocs(q);

      if (!snap.empty) {
        const firestoreList: Charger[] = [];
        snap.forEach((docSnap) => {
          const d = docSnap.data();
          firestoreList.push({
            id: docSnap.id,
            ownerId: d.owner_id || d.ownerId,
            title: d.name || d.title,
            propertyName: d.property_name || d.propertyName,
            hostName: d.host_name || d.hostName || 'Community Host',
            area: d.area || 'Chennai',
            address: d.address || '',
            landmark: d.landmark || undefined,
            city: d.city || 'Chennai',
            pincode: d.pincode || '600020',
            latitude: Number(d.latitude),
            longitude: Number(d.longitude),
            parkingSlotNumber: d.parking_slot_number || d.parkingSlotNumber || 'Slot 1',
            isCoveredParking: Boolean(d.is_covered_parking ?? d.isCoveredParking),
            chargerType: (d.connector_types?.[0] || d.chargerType) as Charger['chargerType'],
            powerType: d.power_type || d.powerType || 'AC',
            powerOutputKw: Number(d.power_output_kw || d.powerOutputKw || 7.4),
            compatibleVehicles: d.compatible_vehicles || d.compatibleVehicles || ['4-Wheeler', '2-Wheeler'],
            accessType: mapDbToUiAccessType(d.access_type || 'public'),
            operatingHours: d.operating_hours || d.operatingHours || null,
            pricePerKwh: d.price_per_kwh != null ? Number(d.price_per_kwh) : null,
            parkingFeePerHour: Number(d.parking_fee_per_hour || 0),
            amenities: d.amenities || ['cctv', 'lit', 'covered'],
            specialInstructions: d.access_instructions || d.specialInstructions || '',
            photos: d.photo_paths || d.photos || [],
            listingSource: d.listing_source || 'Community Host',
            verificationStatus: 'Community Verified',
            createdAt: d.created_at || new Date().toISOString(),
            isResidential: d.access_type === 'private',
            isActive: true,
            isApproved: true,
            status: 'approved',
          });
        });

        // Merge with initial chargers so full Chennai map is populated
        const existingIds = new Set(firestoreList.map((c) => c.id));
        const combined = [...firestoreList];
        for (const fb of fallbackChargers) {
          if (!existingIds.has(fb.id)) {
            combined.push(fb);
          }
        }
        return combined;
      }
      return fallbackChargers;
    } catch (err) {
      console.warn('[PlugMitra] Firestore read error, using local fallback:', err);
      return fallbackChargers;
    }
  },

  // Fetch host's own chargers (pending, approved, or rejected)
  async getUserChargers(user: AppUser | null): Promise<Charger[]> {
    if (!user) return [];

    const localUserCreated = StorageService.getChargers().filter(
      (c) => c.ownerId === user.id || (c.isUserCreated && !c.ownerId)
    );

    try {
      const chargersColl = collection(db, 'chargers');
      const q = query(chargersColl, where('owner_id', '==', user.id));
      const snap = await getDocs(q);

      if (!snap.empty) {
        const list: Charger[] = [];
        snap.forEach((docSnap) => {
          const d = docSnap.data();
          list.push({
            id: docSnap.id,
            ownerId: d.owner_id,
            title: d.name || d.title,
            propertyName: d.property_name || d.propertyName,
            hostName: user.displayName || user.user_metadata?.full_name || 'Community Host',
            email: user.email || undefined,
            area: d.area,
            address: d.address,
            landmark: d.landmark || undefined,
            city: d.city,
            pincode: d.pincode,
            latitude: Number(d.latitude),
            longitude: Number(d.longitude),
            parkingSlotNumber: d.parking_slot_number,
            isCoveredParking: Boolean(d.is_covered_parking),
            chargerType: (d.connector_types?.[0] || d.chargerType) as Charger['chargerType'],
            powerType: d.power_type,
            powerOutputKw: Number(d.power_output_kw),
            compatibleVehicles: d.compatible_vehicles || ['4-Wheeler', '2-Wheeler'],
            accessType: mapDbToUiAccessType(d.access_type),
            operatingHours: d.operating_hours,
            pricePerKwh: d.price_per_kwh != null ? Number(d.price_per_kwh) : null,
            parkingFeePerHour: Number(d.parking_fee_per_hour || 0),
            amenities: d.amenities || ['cctv', 'lit', 'covered'],
            specialInstructions: d.access_instructions || '',
            photos: d.photo_paths || [],
            listingSource: 'Community Host',
            verificationStatus: d.status === 'approved' ? 'Community Verified' : 'Host Self-Reported',
            createdAt: d.created_at,
            isResidential: d.access_type === 'private',
            isActive: d.status === 'approved',
            isApproved: d.status === 'approved',
            isUserCreated: true,
            status: d.status,
          });
        });
        return list;
      }
      return localUserCreated;
    } catch {
      return localUserCreated;
    }
  },

  // Save new listing directly to Firebase with 'pending' status
  async registerCharger(
    formData: ChargerRegistrationFormData,
    user: AppUser | null
  ): Promise<{ data: Charger | null; error: Error | null }> {
    if (!user) {
      return { data: null, error: new Error('You must be signed in to list a charger. Please sign in or create an account.') };
    }

    if (!formData.title?.trim()) {
      return { data: null, error: new Error('Listing title is required.') };
    }
    if (!formData.propertyName?.trim()) {
      return { data: null, error: new Error('Property or building name is required.') };
    }
    if (!formData.parkingSlotNumber?.trim()) {
      return { data: null, error: new Error('Parking slot number is required.') };
    }
    if (!formData.address?.trim()) {
      return { data: null, error: new Error('Physical address is required.') };
    }
    if (formData.latitude < 12.5 || formData.latitude > 13.5) {
      return { data: null, error: new Error('Latitude must be within the greater Chennai region (12.5°N - 13.5°N).') };
    }
    if (formData.longitude < 79.8 || formData.longitude > 80.5) {
      return { data: null, error: new Error('Longitude must be within the greater Chennai region (79.8°E - 80.5°E).') };
    }

    const accessTypeDb = mapAccessTypeToDb(formData.accessType);
    const priceNum = formData.pricePerKwh ? parseFloat(formData.pricePerKwh) : null;
    const parkingFeeNum = formData.parkingFeePerHour ? parseFloat(formData.parkingFeePerHour) : 0;

    // Upload photo files to Firebase Storage if available
    const uploadedPaths: string[] = [];
    for (const p of formData.photos) {
      if (p.file) {
        try {
          const isPrivate = p.isPrivate ?? false;
          const folder = isPrivate ? 'private' : 'public';
          const cleanName = p.file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
          const fileRef = ref(storage, `charger-photos/${user.id}/${folder}/${Date.now()}_${cleanName}`);
          await uploadBytes(fileRef, p.file);
          const downloadUrl = await getDownloadURL(fileRef);
          uploadedPaths.push(downloadUrl);
        } catch {
          uploadedPaths.push(p.previewUrl);
        }
      } else {
        uploadedPaths.push(p.previewUrl);
      }
    }

    const newChargerId = `ch_${Date.now()}`;
    const dbPayload = {
      id: newChargerId,
      owner_id: user.id,
      name: formData.title.trim(),
      property_name: formData.propertyName.trim(),
      parking_slot_number: formData.parkingSlotNumber.trim(),
      is_covered_parking: formData.isCoveredParking,
      address: formData.address.trim(),
      landmark: formData.landmark?.trim() || null,
      area: formData.area.trim() || 'Chennai',
      city: formData.city?.trim() || 'Chennai',
      pincode: formData.pincode?.trim() || '600020',
      latitude: formData.latitude,
      longitude: formData.longitude,
      access_type: accessTypeDb,
      connector_types: [formData.chargerType],
      power_output_kw: formData.powerOutputKw,
      power_type: formData.powerType,
      is_free: priceNum === 0,
      price_per_kwh: priceNum,
      parking_fee_per_hour: parkingFeeNum,
      operating_hours: formData.operatingHours?.trim() || null,
      access_instructions: formData.specialInstructions?.trim() || null,
      photo_paths: uploadedPaths,
      status: 'pending' as ChargerStatusDb,
      is_active: false,
      data_source: 'community',
      created_at: new Date().toISOString(),
    };

    try {
      const docRef = doc(db, 'chargers', newChargerId);
      await setDoc(docRef, dbPayload);
    } catch (err) {
      console.warn('[PlugMitra] Firestore write warning:', err);
    }

    const saved = StorageService.saveNewCharger(
      {
        ...formData,
        photos: formData.photos.map((p, idx) => ({ ...p, previewUrl: uploadedPaths[idx] || p.previewUrl })),
      },
      false,
      user.id
    );

    return { data: saved, error: null };
  },

  // Admin: Get all pending listings for moderation
  async getPendingChargers(): Promise<Charger[]> {
    try {
      const chargersColl = collection(db, 'chargers');
      const q = query(chargersColl, where('status', '==', 'pending'));
      const snap = await getDocs(q);

      if (!snap.empty) {
        const list: Charger[] = [];
        snap.forEach((docSnap) => {
          const d = docSnap.data();
          list.push({
            id: docSnap.id,
            ownerId: d.owner_id,
            title: d.name || d.title,
            propertyName: d.property_name || d.propertyName,
            hostName: 'Community Host',
            area: d.area,
            address: d.address,
            landmark: d.landmark || undefined,
            city: d.city,
            pincode: d.pincode,
            latitude: Number(d.latitude),
            longitude: Number(d.longitude),
            parkingSlotNumber: d.parking_slot_number,
            isCoveredParking: Boolean(d.is_covered_parking),
            chargerType: (d.connector_types?.[0] || d.chargerType) as Charger['chargerType'],
            powerType: d.power_type,
            powerOutputKw: Number(d.power_output_kw),
            compatibleVehicles: d.compatible_vehicles || ['4-Wheeler', '2-Wheeler'],
            accessType: mapDbToUiAccessType(d.access_type),
            operatingHours: d.operating_hours,
            pricePerKwh: d.price_per_kwh != null ? Number(d.price_per_kwh) : null,
            parkingFeePerHour: Number(d.parking_fee_per_hour || 0),
            amenities: d.amenities || ['cctv', 'lit', 'covered'],
            specialInstructions: d.access_instructions || '',
            photos: d.photo_paths || [],
            listingSource: 'Community Host',
            verificationStatus: 'Host Self-Reported',
            createdAt: d.created_at,
            isResidential: d.access_type === 'private',
            isActive: false,
            isApproved: false,
            status: 'pending',
          });
        });
        return list;
      }
    } catch (err) {
      console.warn('Failed to fetch pending chargers from Firestore:', err);
    }

    return StorageService.getChargers().filter((c) => c.status === 'pending' || !c.isApproved);
  },

  // Admin approval action
  async updateApprovalStatus(
    chargerId: string,
    status: 'approved' | 'rejected',
    options?: { currentUser?: AppUser | null; isAdmin?: boolean }
  ): Promise<{ error: Error | null }> {
    if (!options?.isAdmin) {
      return {
        error: new Error('Unauthorized: Only verified platform administrators can approve or reject community listings.'),
      };
    }

    if (options.currentUser) {
      const charger = StorageService.getChargerById(chargerId);
      if (charger && (charger.ownerId === options.currentUser.id || charger.email === options.currentUser.email)) {
        return {
          error: new Error('Unauthorized: Hosts cannot approve their own listings. Platform administrator review is required.'),
        };
      }
    }

    try {
      const chargerRef = doc(db, 'chargers', chargerId);
      await updateDoc(chargerRef, {
        status,
        is_active: status === 'approved',
      });
    } catch {
      // Ignore if document only exists locally
    }

    StorageService.updateChargerApproval(chargerId, status);
    return { error: null };
  },

  // Driver Bookmarks: Scoped per user in Firestore & local storage
  async getSavedChargerIds(user: AppUser | null): Promise<string[]> {
    if (!user) return StorageService.getSavedIds();

    try {
      const savedColl = collection(db, 'saved_chargers');
      const q = query(savedColl, where('user_id', '==', user.id));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const ids: string[] = [];
        snap.forEach((d) => {
          const data = d.data();
          if (data.charger_id) ids.push(data.charger_id);
        });
        return ids;
      }
    } catch {
      // Fallback
    }
    return StorageService.getSavedIds(user.id);
  },

  async toggleSavedCharger(chargerId: string, user: AppUser | null): Promise<boolean> {
    if (!user) return StorageService.toggleSave(chargerId);
    const localSaved = StorageService.toggleSave(chargerId, user.id);

    try {
      const bookmarkId = `${user.id}_${chargerId}`;
      const bookmarkRef = doc(db, 'saved_chargers', bookmarkId);
      if (localSaved) {
        await setDoc(bookmarkRef, {
          id: bookmarkId,
          user_id: user.id,
          charger_id: chargerId,
          created_at: new Date().toISOString(),
        });
      } else {
        await deleteDoc(bookmarkRef);
      }
    } catch {
      // Local storage already synced
    }
    return localSaved;
  },
};
