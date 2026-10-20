import { supabase, isSupabaseConfigured } from './supabase';
import { StorageService } from './storage';
import {
  Charger,
  ChargerRegistrationFormData,
  AccessType
} from '../types/charger';
import { AccessTypeDb, ChargerStatusDb, Database } from '../types/supabase';
import { User } from '@supabase/supabase-js';

// Map UI access types to database enum: 'public' | 'semi-private' | 'private'
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
  // Fetch all approved chargers for the Explore page via the privacy-enforced view
  async getApprovedChargers(): Promise<Charger[]> {
    const fallbackChargers = StorageService.getChargers().filter(
      (c) => c.isApproved === true && c.status !== 'pending' && c.status !== 'rejected' && c.isActive !== false
    );

    if (!isSupabaseConfigured) {
      // In production with unconfigured database, fail safely
      if (import.meta.env.PROD) {
        console.warn('[PlugMitra] Supabase not configured in production mode.');
        return [];
      }
      return fallbackChargers;
    }

    try {
      // Query the privacy masking view v_public_chargers
      // Query the privacy masking view v_public_chargers
      // This strictly enforces residential address and gate code masking at the database level
      const { data, error } = await supabase
        .from('v_public_chargers')
        .select('*')
        .eq('status', 'approved')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('[PlugMitra] Supabase query error, falling back to local storage:', error.message);
        return fallbackChargers;
      }

      if (data && data.length > 0) {
        const rows = data as unknown as Database['public']['Views']['v_public_chargers']['Row'][];
        const mappedFromDb: Charger[] = rows.map((row) => ({
          id: row.id,
          title: row.name,
          propertyName: row.property_name,
          hostName: row.data_source === 'imported' ? 'Public Station Host' : 'Verified Community Host',
          area: row.area,
          address: row.address,
          landmark: row.landmark || undefined,
          city: row.city,
          pincode: row.pincode || '600020',
          latitude: row.latitude,
          longitude: row.longitude,
          parkingSlotNumber: row.parking_slot_number,
          isCoveredParking: row.is_covered_parking,
          chargerType: (row.connector_types?.[0] as Charger['chargerType']) || 'Type 2 AC (Fast AC, up to 22 kW)',
          powerType: row.power_type,
          powerOutputKw: Number(row.power_output_kw),
          compatibleVehicles: ['4-Wheeler', '2-Wheeler'],
          accessType: mapDbToUiAccessType(row.access_type),
          operatingHours: row.operating_hours,
          pricePerKwh: row.price_per_kwh ? Number(row.price_per_kwh) : null,
          parkingFeePerHour: Number(row.parking_fee_per_hour || 0),
          amenities: ['cctv', 'lit', 'covered'],
          specialInstructions: row.access_instructions || '',
          photos: (row.photo_paths || []).filter((p: string) => !p.includes('/private/')), // sanitized public photos only
          listingSource: row.data_source === 'imported' ? 'Public Utility' : 'Community Host',
          verificationStatus: 'Community Verified',
          createdAt: row.created_at,
          isResidential: row.access_type === 'private',
          isActive: row.is_active ?? true,
          isApproved: true,
          status: 'approved',
        }));

        return mappedFromDb;
      }

      return import.meta.env.PROD ? [] : fallbackChargers;
    } catch (err) {
      console.warn('[PlugMitra] Database connection failed:', err);
      return import.meta.env.PROD ? [] : fallbackChargers;
    }
  },

  // Fetch host's own chargers (pending, approved, or rejected)
  async getUserChargers(user: User | null): Promise<Charger[]> {
    if (!user) return [];

    const localUserCreated = StorageService.getChargers().filter((c) => c.isUserCreated);

    if (!isSupabaseConfigured) {
      return localUserCreated;
    }

    try {
      const { data, error } = await supabase
        .from('chargers')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Failed to fetch user chargers from Supabase:', error.message);
        return localUserCreated;
      }

      if (data) {
        return data.map((row) => ({
          id: row.id,
          title: row.name,
          propertyName: row.property_name,
          hostName: user.user_metadata?.full_name || 'Community Host',
          email: user.email,
          area: row.area,
          address: row.address,
          landmark: row.landmark || undefined,
          city: row.city,
          pincode: row.pincode || '600020',
          latitude: row.latitude,
          longitude: row.longitude,
          parkingSlotNumber: row.parking_slot_number,
          isCoveredParking: row.is_covered_parking,
          chargerType: (row.connector_types?.[0] as Charger['chargerType']) || 'Type 2 AC (Fast AC, up to 22 kW)',
          powerType: row.power_type,
          powerOutputKw: Number(row.power_output_kw),
          compatibleVehicles: ['4-Wheeler', '2-Wheeler'],
          accessType: mapDbToUiAccessType(row.access_type),
          operatingHours: row.operating_hours,
          pricePerKwh: row.price_per_kwh ? Number(row.price_per_kwh) : null,
          parkingFeePerHour: Number(row.parking_fee_per_hour || 0),
          amenities: ['cctv', 'lit', 'covered'],
          specialInstructions: row.access_instructions || '',
          photos: row.photo_paths || [],
          listingSource: 'Community Host',
          verificationStatus: row.status === 'approved' ? 'Community Verified' : 'Host Self-Reported',
          createdAt: row.created_at,
          isResidential: row.access_type === 'private',
          isActive: row.status === 'approved',
          isApproved: row.status === 'approved',
          isUserCreated: true,
        }));
      }

      return localUserCreated;
    } catch {
      return localUserCreated;
    }
  },

  // Save new listing directly to Supabase with 'pending' status
  async registerCharger(
    formData: ChargerRegistrationFormData,
    user: User | null
  ): Promise<{ data: Charger | null; error: Error | null }> {
    if (!user) {
      return { data: null, error: new Error('You must be signed in to list a charger. Please sign in or create an account.') };
    }

    // Required field validation before DB submission
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

    let photoPaths = formData.photos.map((p) => p.previewUrl);

    if (isSupabaseConfigured) {
      try {
        // Upload photo files to Supabase Storage if available
        const uploadedPaths: string[] = [];
        for (const p of formData.photos) {
          if (p.file) {
            try {
              const isPrivate = p.isPrivate ?? (accessTypeDb === 'private' && uploadedPaths.length > 0);
              const folder = isPrivate ? 'private' : 'public';
              const cleanName = p.file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
              const storagePath = `${user.id}/${folder}/${Date.now()}_${cleanName}`;
              const { error: uploadErr } = await supabase.storage
                .from('charger-photos')
                .upload(storagePath, p.file, { upsert: true });

              if (!uploadErr) {
                const { data: urlData } = supabase.storage
                  .from('charger-photos')
                  .getPublicUrl(storagePath);
                uploadedPaths.push(urlData?.publicUrl || storagePath);
              } else {
                uploadedPaths.push(p.previewUrl);
              }
            } catch {
              uploadedPaths.push(p.previewUrl);
            }
          } else {
            uploadedPaths.push(p.previewUrl);
          }
        }
        if (uploadedPaths.length > 0) {
          photoPaths = uploadedPaths;
        }

        const dbPayload = {
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
          photo_paths: photoPaths,
          status: 'pending' as ChargerStatusDb, // Guaranteed pending status on submission
          data_source: 'community',
        };

        const { data, error } = await supabase
          .from('chargers')
          .insert(dbPayload)
          .select()
          .single();

        if (error) {
          return { data: null, error: new Error(`Database error: ${error.message}`) };
        }

        // Return successfully saved charger
        const newCharger: Charger = {
          id: data.id,
          title: data.name,
          propertyName: data.property_name,
          hostName: user.user_metadata?.full_name || formData.hostName,
          phone: formData.phone,
          email: user.email,
          area: data.area,
          address: data.address,
          landmark: data.landmark || undefined,
          city: data.city,
          pincode: data.pincode || '600020',
          latitude: data.latitude,
          longitude: data.longitude,
          parkingSlotNumber: data.parking_slot_number,
          isCoveredParking: data.is_covered_parking,
          chargerType: formData.chargerType,
          powerType: data.power_type,
          powerOutputKw: Number(data.power_output_kw),
          compatibleVehicles: formData.compatibleVehicles,
          accessType: formData.accessType,
          operatingHours: data.operating_hours,
          pricePerKwh: data.price_per_kwh ? Number(data.price_per_kwh) : null,
          parkingFeePerHour: Number(data.parking_fee_per_hour),
          amenities: formData.amenities,
          specialInstructions: data.access_instructions || '',
          photos: data.photo_paths,
          listingSource: 'Community Host',
          verificationStatus: 'Host Self-Reported',
          createdAt: data.created_at,
          isResidential: data.access_type === 'private',
          isActive: false, // Pending approval
          isApproved: false,
          isUserCreated: true,
          status: 'pending',
        };

        // Cache in local storage for host dashboard tracking (with pending status)
        StorageService.saveNewCharger({ ...formData, photos: formData.photos.map((p, idx) => ({ ...p, previewUrl: photoPaths[idx] || p.previewUrl })) }, false);
        return { data: newCharger, error: null };
      } catch (err: unknown) {
        return { data: null, error: err as Error };
      }
    } else {
      // Local storage fallback when Supabase keys are not in .env.local
      // Save with pending approval status
      const saved = StorageService.saveNewCharger(formData, false);
      return { data: saved, error: null };
    }
  },

  // Admin: Get all pending listings for moderation
  async getPendingChargers(): Promise<Charger[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('chargers')
          .select('*')
          .eq('status', 'pending')
          .order('created_at', { ascending: false });

        if (!error && data) {
          return data.map((row) => ({
            id: row.id,
            title: row.name,
            propertyName: row.property_name,
            hostName: 'Community Host',
            area: row.area,
            address: row.address,
            landmark: row.landmark || undefined,
            city: row.city,
            pincode: row.pincode || '600020',
            latitude: row.latitude,
            longitude: row.longitude,
            parkingSlotNumber: row.parking_slot_number,
            isCoveredParking: row.is_covered_parking,
            chargerType: (row.connector_types?.[0] as Charger['chargerType']) || 'Type 2 AC (Fast AC, up to 22 kW)',
            powerType: row.power_type,
            powerOutputKw: Number(row.power_output_kw),
            compatibleVehicles: ['4-Wheeler', '2-Wheeler'],
            accessType: mapDbToUiAccessType(row.access_type),
            operatingHours: row.operating_hours,
            pricePerKwh: row.price_per_kwh ? Number(row.price_per_kwh) : null,
            parkingFeePerHour: Number(row.parking_fee_per_hour || 0),
            amenities: ['cctv', 'lit', 'covered'],
            specialInstructions: row.access_instructions || '',
            photos: row.photo_paths || [],
            listingSource: 'Community Host',
            verificationStatus: 'Host Self-Reported',
            createdAt: row.created_at,
            isResidential: row.access_type === 'private',
            isActive: false,
            isApproved: false,
            status: 'pending',
          }));
        }
      } catch (err) {
        console.warn('Failed to fetch pending chargers from Supabase:', err);
      }
    }

    // Local storage fallback for pending chargers
    return StorageService.getChargers().filter((c) => c.status === 'pending' || !c.isApproved);
  },

  // Admin approval action (enforced via Supabase RLS)
  async updateApprovalStatus(chargerId: string, status: 'approved' | 'rejected'): Promise<{ error: Error | null }> {
    // Update local storage representation
    StorageService.updateChargerApproval(chargerId, status);

    if (!isSupabaseConfigured) {
      return { error: null };
    }

    try {
      const updatePayload = status === 'approved'
        ? { status: 'approved' as const, is_active: true }
        : { status: 'rejected' as const, is_active: false };

      const { error } = await supabase
        .from('chargers')
        .update(updatePayload)
        .eq('id', chargerId);

      if (error) {
        return { error: new Error(error.message) };
      }
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  }
};
