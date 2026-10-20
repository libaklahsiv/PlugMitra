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
  avatar_url?: string | null;
  vehicle_make: string | null;
  vehicle_model: string | null;
  vehicle_reg_number: string | null;
  connector_preference: string | null;
  battery_capacity_kwh: number | null;
  preferred_area: string | null;
}

export type AuthModalMode = 'login' | 'signup' | 'forgot' | 'reset-password';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfileData | null;
  loading: boolean;
  isConfigured: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    phone: string
  ) => Promise<{ error: Error | null; confirmationRequired?: boolean }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signInWithDemoAccount: (role: 'driver' | 'host' | 'admin') => Promise<{ error: Error | null }>;
  signOut: () => Promise<{ error: Error | null }>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: Error | null }>;
  updateProfile: (updates: Partial<UserProfileData>) => Promise<{ error: Error | null }>;
  openAuthModal: (mode?: AuthModalMode) => void;
  closeAuthModal: () => void;
  isAuthModalOpen: boolean;
  authModalMode: AuthModalMode;
  oauthError: string | null;
  clearOAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Local fallback session key
const LOCAL_AUTH_KEY = 'plugmitra_auth_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [oauthError, setOauthError] = useState<string | null>(null);

  // Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<AuthModalMode>('login');

  const openAuthModal = (mode: AuthModalMode = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => setIsAuthModalOpen(false);
  const clearOAuthError = () => setOauthError(null);

  // Fetch or safely upsert profile from profiles table
  const fetchProfile = async (userId: string, email?: string, userMeta?: Record<string, unknown>) => {
    if (!isSupabaseConfigured) {
      if (import.meta.env.PROD) {
        setProfile(null);
        return;
      }
      // Local fallback profile
      const localData = localStorage.getItem(`plugmitra_profile_${userId}`);
      if (localData) {
        setProfile(JSON.parse(localData));
      } else {
        const namePart = (email?.split('@')[0] || 'driver').replace(/[._-]/g, ' ');
        const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
        const isLocalAdmin = Boolean(email && email.toLowerCase().includes('admin'));
        const isLocalHost = Boolean(email && email.toLowerCase().includes('host'));
        const fallbackProfile: UserProfileData = {
          id: userId,
          email: email || 'driver@plugmitra.in',
          full_name: (userMeta?.full_name as string) || (userMeta?.name as string) || `${formattedName}`,
          phone: (userMeta?.phone as string) || (isLocalHost ? '+91 94440 12345' : null),
          role: isLocalAdmin ? 'admin' : isLocalHost ? 'host' : 'user',
          avatar_url: (userMeta?.avatar_url as string) || (userMeta?.picture as string) || null,
          vehicle_make: email === 'driver@plugmitra.in' ? 'Tata Motors' : null,
          vehicle_model: email === 'driver@plugmitra.in' ? 'Nexon EV Long Range' : null,
          vehicle_reg_number: email === 'driver@plugmitra.in' ? 'TN 07 CK 9012' : null,
          connector_preference: email === 'driver@plugmitra.in' ? 'CCS2 (DC Fast Charger, 25-60+ kW)' : null,
          battery_capacity_kwh: email === 'driver@plugmitra.in' ? 40.5 : null,
          preferred_area: isLocalHost ? 'Adyar' : 'Chennai',
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
        console.warn('[PlugMitra] Error fetching profile:', error.message);
      }

      if (data) {
        setProfile(data as UserProfileData);
      } else {
        // Safe profile creation if trigger hasn't fired yet
        const defaultName =
          (userMeta?.full_name as string) ||
          (userMeta?.name as string) ||
          email?.split('@')[0] ||
          'EV Driver';
        const newProf: UserProfileData = {
          id: userId,
          email: email || null,
          full_name: defaultName,
          phone: (userMeta?.phone as string) || null,
          role: 'user',
          avatar_url: (userMeta?.avatar_url as string) || (userMeta?.picture as string) || null,
          vehicle_make: null,
          vehicle_model: null,
          vehicle_reg_number: null,
          connector_preference: null,
          battery_capacity_kwh: null,
          preferred_area: 'Chennai',
        };
        await supabase
          .from('profiles')
          .insert(newProf as Database['public']['Tables']['profiles']['Insert']);
        setProfile(newProf);
      }
    } catch (err) {
      console.warn('[PlugMitra] Failed to load user profile:', err);
    }
  };

  useEffect(() => {
    let mounted = true;

    // Check URL parameters for OAuth errors or password recovery fragments
    const handleUrlState = () => {
      try {
        const hash = window.location.hash;
        const search = window.location.search;

        const urlParams = new URLSearchParams(search);
        const hashParams = new URLSearchParams(hash.replace(/^#/, ''));

        const errorDesc =
          urlParams.get('error_description') ||
          hashParams.get('error_description') ||
          urlParams.get('error') ||
          hashParams.get('error');

        if (errorDesc) {
          setOauthError(decodeURIComponent(errorDesc.replace(/\+/g, ' ')));
          openAuthModal('login');
          window.history.replaceState(null, '', window.location.pathname);
          return;
        }

        const type = hashParams.get('type') || urlParams.get('type');
        if (type === 'recovery' || hash.includes('reset-password')) {
          openAuthModal('reset-password');
        }
      } catch (err) {
        console.warn('[PlugMitra] Failed to parse URL auth fragments:', err);
      }
    };

    handleUrlState();

    if (isSupabaseConfigured) {
      // 1. Initial Session check from Supabase Auth
      supabase.auth.getSession().then(({ data: { session: currentSession }, error }) => {
        if (!mounted) return;
        if (error) {
          console.warn('[PlugMitra] Session retrieval error:', error.message);
        }
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        if (currentSession?.user) {
          fetchProfile(currentSession.user.id, currentSession.user.email, currentSession.user.user_metadata);
        }
        setLoading(false);
      });

      // 2. Listen to ongoing auth state changes (e.g. Google OAuth callback, Password Recovery, Token refresh)
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, newSession) => {
          if (!mounted) return;

          if (event === 'PASSWORD_RECOVERY') {
            setSession(newSession);
            setUser(newSession?.user ?? null);
            openAuthModal('reset-password');
            setLoading(false);
            return;
          }

          if (event === 'SIGNED_OUT') {
            setUser(null);
            setSession(null);
            setProfile(null);
            setLoading(false);
            return;
          }

          if (event === 'SIGNED_IN') {
            setSession(newSession);
            setUser(newSession?.user ?? null);
            if (newSession?.user) {
              await fetchProfile(newSession.user.id, newSession.user.email, newSession.user.user_metadata);
            }
            setIsAuthModalOpen(false);
            setLoading(false);
            return;
          }

          setSession(newSession);
          setUser(newSession?.user ?? null);
          if (newSession?.user) {
            await fetchProfile(newSession.user.id, newSession.user.email, newSession.user.user_metadata);
          } else {
            setProfile(null);
          }
          setLoading(false);
        }
      );

      // 3. Cross-tab & popup session synchronization
      const handleStorageChange = async (e: StorageEvent) => {
        if (!mounted) return;
        if (e.key === LOCAL_AUTH_KEY || (e.key && e.key.includes('supabase.auth.token'))) {
          const { data: { session: currentSession } } = await supabase.auth.getSession();
          if (currentSession?.user) {
            setSession(currentSession);
            setUser(currentSession.user);
            await fetchProfile(currentSession.user.id, currentSession.user.email, currentSession.user.user_metadata);
            setIsAuthModalOpen(false);
          }
        }
      };
      window.addEventListener('storage', handleStorageChange);

      return () => {
        mounted = false;
        subscription.unsubscribe();
        window.removeEventListener('storage', handleStorageChange);
      };
    } else {
      // In production without live credentials, never simulate auth or load fake session
      if (import.meta.env.PROD) {
        setLoading(false);
        return () => {
          mounted = false;
        };
      }

      // Offline / Local Simulation Mode strictly for local development when env vars are not set
      const cachedSession = localStorage.getItem(LOCAL_AUTH_KEY);
      if (cachedSession) {
        try {
          const parsed = JSON.parse(cachedSession);
          setUser(parsed.user);
          setSession(parsed.session);
          fetchProfile(parsed.user.id, parsed.user.email, parsed.user.user_metadata);
        } catch {
          // ignore corrupted data
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
    setOauthError(null);

    if (!isSupabaseConfigured) {
      if (import.meta.env.PROD) {
        setLoading(false);
        return {
          error: new Error('Production Authentication is not configured. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your deployment environment.')
        };
      }

      // Local fallback login simulation strictly for offline development
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
        await fetchProfile(data.user.id, data.user.email, data.user.user_metadata);
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
    setOauthError(null);

    if (!isSupabaseConfigured) {
      if (import.meta.env.PROD) {
        setLoading(false);
        return {
          error: new Error('Production Authentication is not configured. Account registration requires live Supabase credentials.')
        };
      }

      // Local fallback signup simulation strictly for offline development
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
        avatar_url: null,
        vehicle_make: null,
        vehicle_model: null,
        vehicle_reg_number: null,
        connector_preference: null,
        battery_capacity_kwh: null,
        preferred_area: 'Chennai',
      };
      localStorage.setItem(`plugmitra_profile_${mockUser.id}`, JSON.stringify(newProfile));
      setProfile(newProfile);
      setLoading(false);
      setIsAuthModalOpen(false);
      return { error: null, confirmationRequired: false };
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
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        setLoading(false);
        return { error };
      }

      // Check if email confirmation is required by Supabase settings (user created, but session is null)
      const confirmationRequired = Boolean(data.user && !data.session);

      setUser(data.user);
      setSession(data.session);
      if (data.user) {
        await fetchProfile(data.user.id, data.user.email, { full_name: fullName, phone });
      }

      setLoading(false);
      if (!confirmationRequired) {
        setIsAuthModalOpen(false);
      }
      return { error: null, confirmationRequired };
    } catch (err: unknown) {
      setLoading(false);
      return { error: err as Error };
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    setOauthError(null);

    if (!isSupabaseConfigured) {
      if (import.meta.env.PROD) {
        setLoading(false);
        return {
          error: new Error('Production Authentication is not configured. Google Sign-In requires live Supabase credentials.')
        };
      }

      // Local offline development simulation
      const mockGoogleEmail = 'chennai.ev.driver@gmail.com';
      const mockId = `usr_google_${Date.now()}`;
      const mockUser = {
        id: mockId,
        email: mockGoogleEmail,
        app_metadata: { provider: 'google' },
        user_metadata: {
          full_name: 'Google EV Driver',
          avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
        },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      } as unknown as User;

      const mockSession = {
        access_token: 'mock_google_token',
        token_type: 'bearer',
        user: mockUser,
      } as unknown as Session;

      const googleProfile: UserProfileData = {
        id: mockId,
        email: mockGoogleEmail,
        full_name: 'Google EV Driver',
        phone: null,
        role: 'user',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
        vehicle_make: null,
        vehicle_model: null,
        vehicle_reg_number: null,
        connector_preference: null,
        battery_capacity_kwh: null,
        preferred_area: 'Chennai',
      };

      setUser(mockUser);
      setSession(mockSession);
      localStorage.setItem(`plugmitra_profile_${mockId}`, JSON.stringify(googleProfile));
      localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify({ user: mockUser, session: mockSession }));
      setProfile(googleProfile);
      setLoading(false);
      setIsAuthModalOpen(false);
      return { error: null };
    }

    try {
      const redirectUrl = `${window.location.origin}/`;
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          },
        },
      });

      if (error) {
        setLoading(false);
        return { error };
      }

      if (data?.url) {
        try {
          if (window.top && window.top !== window.self) {
            window.top.location.href = data.url;
          } else {
            window.location.assign(data.url);
          }
        } catch {
          window.location.assign(data.url);
        }
      }

      setLoading(false);
      return { error: null };
    } catch (err) {
      setLoading(false);
      return { error: err as Error };
    }
  };

  const signInWithDemoAccount = async (role: 'driver' | 'host' | 'admin') => {
    setLoading(true);
    setOauthError(null);

    let email = 'driver@plugmitra.in';
    let fullName = 'Vishal Kabilan';
    let phone = '+91 98765 43210';
    let assignedRole: UserRoleDb = 'user';
    let vehicleMake: string | null = 'Tata Motors';
    let vehicleModel: string | null = 'Nexon EV Long Range';
    let vehicleReg: string | null = 'TN 07 CK 9012';
    let connector: string | null = 'CCS2 (DC Fast Charger, 25-60+ kW)';
    let batteryKwh: number | null = 40.5;

    if (role === 'host') {
      email = 'suresh.host@plugmitra.in';
      fullName = 'Suresh Ramanathan';
      phone = '+91 94440 12345';
      assignedRole = 'host';
      vehicleMake = 'MG Motor';
      vehicleModel = 'ZS EV';
      vehicleReg = 'TN 07 BM 1122';
      connector = 'Type 2 AC (Fast AC, up to 22 kW)';
      batteryKwh = 50.3;
    } else if (role === 'admin') {
      email = 'admin@plugmitra.in';
      fullName = 'Chennai EV Platform Admin';
      phone = '+91 98400 11000';
      assignedRole = 'admin';
      vehicleMake = 'Hyundai';
      vehicleModel = 'Ioniq 5';
      vehicleReg = 'TN 01 EV 0001';
      connector = 'CCS2 (DC Fast Charger, 25-60+ kW)';
      batteryKwh = 72.6;
    }

    const mockId = `usr_${role}_demo`;
    const mockUser = {
      id: mockId,
      email,
      app_metadata: { provider: 'email' },
      user_metadata: { full_name: fullName, phone },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    } as unknown as User;

    const mockSession = {
      access_token: `mock_token_${role}`,
      token_type: 'bearer',
      user: mockUser,
    } as unknown as Session;

    const demoProfile: UserProfileData = {
      id: mockId,
      email,
      full_name: fullName,
      phone,
      role: assignedRole,
      avatar_url: null,
      vehicle_make: vehicleMake,
      vehicle_model: vehicleModel,
      vehicle_reg_number: vehicleReg,
      connector_preference: connector,
      battery_capacity_kwh: batteryKwh,
      preferred_area: role === 'host' ? 'Adyar' : 'Adyar / OMR',
    };

    localStorage.setItem(`plugmitra_profile_${mockId}`, JSON.stringify(demoProfile));
    localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify({ user: mockUser, session: mockSession }));

    setUser(mockUser);
    setSession(mockSession);
    setProfile(demoProfile);
    setLoading(false);
    setIsAuthModalOpen(false);
    return { error: null };
  };

  const resetPassword = async (email: string) => {
    setLoading(true);
    setOauthError(null);

    if (!isSupabaseConfigured) {
      setLoading(false);
      if (import.meta.env.PROD) {
        return {
          error: new Error('Production Authentication is not configured. Password recovery requires live Supabase credentials.')
        };
      }
      return { error: null };
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/#reset-password`,
      });
      setLoading(false);
      if (error) return { error };
      return { error: null };
    } catch (err) {
      setLoading(false);
      return { error: err as Error };
    }
  };

  const updatePassword = async (newPassword: string) => {
    setLoading(true);
    if (!isSupabaseConfigured) {
      setLoading(false);
      if (import.meta.env.PROD) {
        return {
          error: new Error('Production Authentication is not configured.')
        };
      }
      setIsAuthModalOpen(false);
      return { error: null };
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      setLoading(false);
      if (error) return { error };
      setIsAuthModalOpen(false);
      return { error: null };
    } catch (err) {
      setLoading(false);
      return { error: err as Error };
    }
  };

  const signOut = async () => {
    setLoading(true);
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('[PlugMitra] Error during sign out:', err);
      }
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

    // Strict security check: Remove role and id so users cannot self-elevate to admin
    const safeUpdates = { ...updates };
    delete safeUpdates.role;
    delete safeUpdates.id;

    if (!isSupabaseConfigured) {
      if (import.meta.env.PROD) {
        return { error: new Error('Production database is not configured. Profile modifications require live database connection.') };
      }
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
        signInWithGoogle,
        signInWithDemoAccount,
        signOut,
        resetPassword,
        updatePassword,
        updateProfile,
        openAuthModal,
        closeAuthModal,
        isAuthModalOpen,
        authModalMode,
        oauthError,
        clearOAuthError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
