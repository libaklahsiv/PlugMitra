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
        const fallbackProfile: UserProfileData = {
          id: userId,
          email: email || 'driver@plugmitra.in',
          full_name: (userMeta?.full_name as string) || (userMeta?.name as string) || 'Vishal Kabilan',
          phone: (userMeta?.phone as string) || '+91 98765 43210',
          role: 'user',
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
          vehicle_make: 'Tata Motors',
          vehicle_model: 'Nexon EV Long Range',
          vehicle_reg_number: 'TN 07 CK 9012',
          connector_preference: 'CCS2 (DC Fast Charger, 25-60+ kW)',
          battery_capacity_kwh: 40.5,
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

      return () => {
        mounted = false;
        subscription.unsubscribe();
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
      const mockUser = {
        id: `usr_google_${Date.now()}`,
        email: mockGoogleEmail,
        app_metadata: { provider: 'google' },
        user_metadata: { full_name: 'Google EV Driver', avatar_url: '' },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      } as unknown as User;

      const mockSession = {
        access_token: 'mock_google_token',
        token_type: 'bearer',
        user: mockUser,
      } as unknown as Session;

      setUser(mockUser);
      setSession(mockSession);
      localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify({ user: mockUser, session: mockSession }));
      await fetchProfile(mockUser.id, mockGoogleEmail, { full_name: 'Google EV Driver' });
      setLoading(false);
      setIsAuthModalOpen(false);
      return { error: null };
    }

    try {
      const redirectUrl = `${window.location.origin}/`;
      const { error } = await supabase.auth.signInWithOAuth({
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

      // Browser redirects to Google consent flow
      return { error: null };
    } catch (err) {
      setLoading(false);
      return { error: err as Error };
    }
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
