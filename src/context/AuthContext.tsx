import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { Database, UserRoleDb } from '../types/supabase';

export interface UserProfileData {
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
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfileData | null;
  loading: boolean;
  isConfigured: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string, phone: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<{ error: Error | null }>;
  updateProfile: (updates: Partial<UserProfileData>) => Promise<{ error: Error | null }>;
  openAuthModal: (mode?: 'login' | 'signup') => void;
  closeAuthModal: () => void;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'signup';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Local fallback session key
const LOCAL_AUTH_KEY = 'plugmitra_auth_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');

  const openAuthModal = (mode: 'login' | 'signup' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => setIsAuthModalOpen(false);

  // Fetch or populate profile from profiles table
  const fetchProfile = async (userId: string, email?: string) => {
    if (!isSupabaseConfigured) {
      // Local fallback profile
      const localData = localStorage.getItem(`plugmitra_profile_${userId}`);
      if (localData) {
        setProfile(JSON.parse(localData));
      } else {
        const fallbackProfile: UserProfileData = {
          id: userId,
          email: email || 'driver@plugmitra.in',
          full_name: 'Vishal Kabilan',
          phone: '+91 98765 43210',
          role: 'host',
          vehicle_make: 'Tata Motors',
          vehicle_model: 'Nexon EV Long Range',
          vehicle_reg_number: 'TN 07 CK 9012',
          connector_preference: 'CCS2 (DC Fast Charger, 25-60+ kW)',
          battery_capacity_kwh: 40.5,
          preferred_area: 'Adyar / OMR',
        };
        localStorage.setItem(`plugmitra_profile_${userId}`, JSON.stringify(fallbackProfile));
        setProfile(fallbackProfile);
      }
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.warn('Error fetching profile from Supabase:', error.message);
      }

      if (data) {
        setProfile(data as UserProfileData);
      } else {
        // Upsert default profile if trigger hasn't finished
        const newProf: UserProfileData = {
          id: userId,
          email: email || null,
          full_name: email?.split('@')[0] || 'EV Driver',
          phone: null,
          role: 'user',
          vehicle_make: 'Tata Motors',
          vehicle_model: 'Nexon EV Long Range',
          vehicle_reg_number: 'TN 07 CK 9012',
          connector_preference: 'CCS2 (DC Fast Charger, 25-60+ kW)',
          battery_capacity_kwh: 40.5,
          preferred_area: 'Chennai',
        };
        await supabase.from('profiles').insert(newProf as Database['public']['Tables']['profiles']['Insert']);
        setProfile(newProf);
      }
    } catch (err) {
      console.warn('Failed to load user profile:', err);
    }
  };

  useEffect(() => {
    let mounted = true;

    if (isSupabaseConfigured) {
      // 1. Initial Session check from Supabase Auth
      supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
        if (!mounted) return;
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        if (currentSession?.user) {
          fetchProfile(currentSession.user.id, currentSession.user.email);
        }
        setLoading(false);
      });

      // 2. Listen to ongoing auth state changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (_event, newSession) => {
          if (!mounted) return;
          setSession(newSession);
          setUser(newSession?.user ?? null);
          if (newSession?.user) {
            await fetchProfile(newSession.user.id, newSession.user.email);
          } else {
            setProfile(null);
          }
          setLoading(false);
        }
      );

      return () => {
        mounted = false;
        subscription.unsubscribe();
      };
    } else {
      // Offline / Local Simulation Mode when env vars are not yet set
      const cachedSession = localStorage.getItem(LOCAL_AUTH_KEY);
      if (cachedSession) {
        try {
          const parsed = JSON.parse(cachedSession);
          setUser(parsed.user);
          setSession(parsed.session);
          fetchProfile(parsed.user.id, parsed.user.email);
        } catch {
          // ignore error
        }
      }
      setLoading(false);
      return () => {
        mounted = false;
      };
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    if (!isSupabaseConfigured) {
      // Local fallback login simulation
      const mockUser = {
        id: `usr_${Math.abs(email.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0))}`,
        email,
        app_metadata: {},
        user_metadata: { full_name: email.split('@')[0] },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      } as unknown as User;

      const mockSession = {
        access_token: 'mock_token',
        token_type: 'bearer',
        user: mockUser,
      } as unknown as Session;

      setUser(mockUser);
      setSession(mockSession);
      localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify({ user: mockUser, session: mockSession }));
      await fetchProfile(mockUser.id, email);
      setLoading(false);
      setIsAuthModalOpen(false);
      return { error: null };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setLoading(false);
        return { error };
      }

      setUser(data.user);
      setSession(data.session);
      if (data.user) {
        await fetchProfile(data.user.id, data.user.email);
      }
      setLoading(false);
      setIsAuthModalOpen(false);
      return { error: null };
    } catch (err: unknown) {
      setLoading(false);
      return { error: err as Error };
    }
  };

  const signUp = async (email: string, password: string, fullName: string, phone: string) => {
    setLoading(true);
    if (!isSupabaseConfigured) {
      // Local fallback signup simulation
      const mockUser = {
        id: `usr_${Date.now()}`,
        email,
        app_metadata: {},
        user_metadata: { full_name: fullName, phone },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      } as unknown as User;

      const mockSession = {
        access_token: 'mock_token',
        token_type: 'bearer',
        user: mockUser,
      } as unknown as Session;

      setUser(mockUser);
      setSession(mockSession);
      localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify({ user: mockUser, session: mockSession }));

      const newProfile: UserProfileData = {
        id: mockUser.id,
        email,
        full_name: fullName,
        phone,
        role: 'user',
        vehicle_make: 'Tata Motors',
        vehicle_model: 'Nexon EV Long Range',
        vehicle_reg_number: 'TN 07 CK 9012',
        connector_preference: 'CCS2 (DC Fast Charger, 25-60+ kW)',
        battery_capacity_kwh: 40.5,
        preferred_area: 'Chennai',
      };
      localStorage.setItem(`plugmitra_profile_${mockUser.id}`, JSON.stringify(newProfile));
      setProfile(newProfile);
      setLoading(false);
      setIsAuthModalOpen(false);
      return { error: null };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone,
          },
        },
      });

      if (error) {
        setLoading(false);
        return { error };
      }

      setUser(data.user);
      setSession(data.session);
      if (data.user) {
        await fetchProfile(data.user.id, data.user.email);
      }
      setLoading(false);
      setIsAuthModalOpen(false);
      return { error: null };
    } catch (err: unknown) {
      setLoading(false);
      return { error: err as Error };
    }
  };

  const signOut = async () => {
    setLoading(true);
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem(LOCAL_AUTH_KEY);
    setUser(null);
    setSession(null);
    setProfile(null);
    setLoading(false);
    return { error: null };
  };

  const updateProfile = async (updates: Partial<UserProfileData>) => {
    if (!user) return { error: new Error('User not logged in') };

    // Security check: Remove role if present to enforce "ordinary users cannot assign themselves admin"
    const safeUpdates = { ...updates };
    delete safeUpdates.role;
    delete safeUpdates.id;

    if (!isSupabaseConfigured) {
      const updated = { ...profile, ...safeUpdates } as UserProfileData;
      setProfile(updated);
      localStorage.setItem(`plugmitra_profile_${user.id}`, JSON.stringify(updated));
      return { error: null };
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update(safeUpdates as Database['public']['Tables']['profiles']['Update'])
        .eq('id', user.id);

      if (error) return { error };

      setProfile((prev) => (prev ? { ...prev, ...safeUpdates } : null));
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const isAdmin = profile?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        isConfigured: isSupabaseConfigured,
        isAdmin,
        signIn,
        signUp,
        signOut,
        updateProfile,
        openAuthModal,
        closeAuthModal,
        isAuthModalOpen,
        authModalMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
