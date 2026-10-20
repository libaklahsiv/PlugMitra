export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type AccessTypeDb = 'public' | 'semi-private' | 'private';
export type ChargerStatusDb = 'pending' | 'approved' | 'rejected';
export type PowerTypeDb = 'AC' | 'DC';
export type UserRoleDb = 'user' | 'host' | 'admin';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          phone: string | null;
          role: UserRoleDb;
          vehicle_make: string | null;
          vehicle_model: string | null;
          vehicle_reg_number: string | null;
          connector_preference: string | null;
          battery_capacity_kwh: number | null;
          preferred_area: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          phone?: string | null;
          role?: UserRoleDb;
          vehicle_make?: string | null;
          vehicle_model?: string | null;
          vehicle_reg_number?: string | null;
          connector_preference?: string | null;
          battery_capacity_kwh?: number | null;
          preferred_area?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          full_name?: string | null;
          phone?: string | null;
          role?: UserRoleDb;
          vehicle_make?: string | null;
          vehicle_model?: string | null;
          vehicle_reg_number?: string | null;
          connector_preference?: string | null;
          battery_capacity_kwh?: number | null;
          preferred_area?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      chargers: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          property_name: string;
          parking_slot_number: string;
          is_covered_parking: boolean;
          address: string;
          landmark: string | null;
          area: string;
          city: string;
          pincode: string | null;
          latitude: number;
          longitude: number;
          access_type: AccessTypeDb;
          connector_types: string[];
          power_output_kw: number;
          power_type: PowerTypeDb;
          is_free: boolean;
          price_per_kwh: number | null;
          parking_fee_per_hour: number;
          operating_hours: string | null;
          access_instructions: string | null;
          photo_paths: string[];
          status: ChargerStatusDb;
          is_active: boolean;
          data_source: string;
          source_record_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id?: string;
          name: string;
          property_name: string;
          parking_slot_number: string;
          is_covered_parking?: boolean;
          address: string;
          landmark?: string | null;
          area: string;
          city?: string;
          pincode?: string | null;
          latitude: number;
          longitude: number;
          access_type: AccessTypeDb;
          connector_types: string[];
          power_output_kw: number;
          power_type?: PowerTypeDb;
          is_free?: boolean;
          price_per_kwh?: number | null;
          parking_fee_per_hour?: number;
          operating_hours?: string | null;
          access_instructions?: string | null;
          photo_paths?: string[];
          status?: ChargerStatusDb;
          is_active?: boolean;
          data_source?: string;
          source_record_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          name?: string;
          property_name?: string;
          parking_slot_number?: string;
          is_covered_parking?: boolean;
          address?: string;
          landmark?: string | null;
          area?: string;
          city?: string;
          pincode?: string | null;
          latitude?: number;
          longitude?: number;
          access_type?: AccessTypeDb;
          connector_types?: string[];
          power_output_kw?: number;
          power_type?: PowerTypeDb;
          is_free?: boolean;
          price_per_kwh?: number | null;
          parking_fee_per_hour?: number;
          operating_hours?: string | null;
          access_instructions?: string | null;
          photo_paths?: string[];
          status?: ChargerStatusDb;
          is_active?: boolean;
          data_source?: string;
          source_record_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      saved_chargers: {
        Row: {
          user_id: string;
          charger_id: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          charger_id: string;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          charger_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      bookings: {
        Row: {
          id: string;
          charger_id: string;
          user_id: string;
          driver_name: string;
          driver_phone: string;
          vehicle_details: string;
          arrival_time: string;
          duration_hours: number;
          status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
          total_estimate: number;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          charger_id: string;
          user_id: string;
          driver_name: string;
          driver_phone: string;
          vehicle_details: string;
          arrival_time: string;
          duration_hours?: number;
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled';
          total_estimate?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          charger_id?: string;
          user_id?: string;
          driver_name?: string;
          driver_phone?: string;
          vehicle_details?: string;
          arrival_time?: string;
          duration_hours?: number;
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled';
          total_estimate?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      v_public_chargers: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          property_name: string;
          address: string;
          landmark: string | null;
          area: string;
          city: string;
          pincode: string | null;
          latitude: number;
          longitude: number;
          access_type: AccessTypeDb;
          connector_types: string[];
          power_output_kw: number;
          power_type: PowerTypeDb;
          is_covered_parking: boolean;
          parking_slot_number: string;
          is_free: boolean;
          price_per_kwh: number | null;
          parking_fee_per_hour: number;
          operating_hours: string | null;
          access_instructions: string | null;
          photo_paths: string[];
          status: ChargerStatusDb;
          is_active: boolean;
          data_source: string;
          source_record_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Relationships: [];
      };
    };
    Functions: Record<string, never>;
    Enums: {
      access_type_enum: AccessTypeDb;
      charger_status_enum: ChargerStatusDb;
      power_type_enum: PowerTypeDb;
      user_role_enum: UserRoleDb;
    };
    CompositeTypes: Record<string, never>;
  };
}
