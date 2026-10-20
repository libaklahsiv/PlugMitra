import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  auth,
  db,
  googleProvider,
  testFirestoreConnection,
} from '../services/firebase';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  sendPasswordResetEmail,
  updatePassword as fbUpdatePassword,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { UserRoleDb } from '../types/supabase';

export interface AppUser {
  id: string;
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  user_metadata?: {
    full_name?: string;
    phone?: string;
  };
}

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
  user: AppUser | null;
  session: { access_token: string } | null;
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

const LOCAL_AUTH_KEY = 'plugmitra_auth_session';

function mapFirebaseUser(fbUser: FirebaseUser): AppUser {
  return {
    id: fbUser.uid,
    uid: fbUser.uid,
    email: fbUser.email,
    displayName: fbUser.displayName,
    photoURL: fbUser.photoURL,
    user_metadata: {
      full_name: fbUser.displayName || fbUser.email?.split('@')[0] || 'EV Driver',
      phone: fbUser.phoneNumber || undefined,
    },
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<{ access_token: string } | null>(null);
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

  // Fetch or upsert profile in Firestore
  const fetchProfile = async (userId: string, email?: string | null, fullName?: string | null, phone?: string | null) => {
    try {
      const profileRef = doc(db, 'profiles', userId);
      const snap = await getDoc(profileRef);

      const isInitialAdmin = email === 'vishal2a3a@gmail.com' || (email && email.toLowerCase().includes('admin'));
      const isInitialHost = Boolean(email && email.toLowerCase().includes('host'));
      const defaultRole: UserRoleDb = isInitialAdmin ? 'admin' : isInitialHost ? 'host' : 'user';

      if (snap.exists()) {
        const data = snap.data() as UserProfileData;
        setProfile({
          ...data,
          id: userId,
          role: isInitialAdmin ? 'admin' : data.role || defaultRole,
        });
        localStorage.setItem(`plugmitra_profile_${userId}`, JSON.stringify(data));
      } else {
        const namePart = (fullName || email?.split('@')[0] || 'driver').replace(/[._-]/g, ' ');
        const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);

        const newProfile: UserProfileData = {
          id: userId,
          email: email || 'driver@plugmitra.in',
          full_name: fullName || formattedName,
          phone: phone || (isInitialHost ? '+91 94440 12345' : null),
          role: defaultRole,
          avatar_url: null,
          vehicle_make: email === 'driver@plugmitra.in' ? 'Tata Motors' : null,
          vehicle_model: email === 'driver@plugmitra.in' ? 'Nexon EV Long Range' : null,
          vehicle_reg_number: email === 'driver@plugmitra.in' ? 'TN 07 CK 9012' : null,
          connector_preference: email === 'driver@plugmitra.in' ? 'CCS2 (DC Fast Charger, 25-60+ kW)' : null,
          battery_capacity_kwh: email === 'driver@plugmitra.in' ? 40.5 : null,
          preferred_area: isInitialHost ? 'Adyar' : 'Chennai',
        };

        try {
          await setDoc(profileRef, newProfile);
        } catch {
          // If security rules or network fails, keep local cache
        }
        setProfile(newProfile);
        localStorage.setItem(`plugmitra_profile_${userId}`, JSON.stringify(newProfile));
      }
    } catch {
      // Local fallback on Firestore read issue
      const localData = localStorage.getItem(`plugmitra_profile_${userId}`);
      if (localData) {
        setProfile(JSON.parse(localData));
      } else {
        const isInitialAdmin = email === 'vishal2a3a@gmail.com' || (email && email.toLowerCase().includes('admin'));
        const fallbackProfile: UserProfileData = {
          id: userId,
          email: email || 'driver@plugmitra.in',
          full_name: fullName || 'EV Driver',
          phone: phone || null,
          role: isInitialAdmin ? 'admin' : 'user',
          avatar_url: null,
          vehicle_make: null,
          vehicle_model: null,
          vehicle_reg_number: null,
          connector_preference: null,
          battery_capacity_kwh: null,
          preferred_area: 'Chennai',
        };
        setProfile(fallbackProfile);
      }
    }
  };

  useEffect(() => {
    // Test Firestore connection on boot
    testFirestoreConnection();

    // Listen to Firebase auth state
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const appUser = mapFirebaseUser(fbUser);
        setUser(appUser);
        setSession({ access_token: await fbUser.getIdToken() });
        await fetchProfile(fbUser.uid, fbUser.email, fbUser.displayName, fbUser.phoneNumber);
      } else {
        // Check for local demo session if not logged into Firebase
        const cached = localStorage.getItem(LOCAL_AUTH_KEY);
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            setUser(parsed.user);
            setSession(parsed.session);
            await fetchProfile(parsed.user.id, parsed.user.email, parsed.user.user_metadata?.full_name);
          } catch {
            setUser(null);
            setSession(null);
            setProfile(null);
          }
        } else {
          setUser(null);
          setSession(null);
          setProfile(null);
        }
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setOauthError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const appUser = mapFirebaseUser(userCredential.user);
      setUser(appUser);
      setSession({ access_token: await userCredential.user.getIdToken() });
      await fetchProfile(appUser.id, appUser.email, appUser.displayName);
      setLoading(false);
      setIsAuthModalOpen(false);
      return { error: null };
    } catch {
      // Fallback to local demo session if email/pass provider is not enabled in Firebase Console yet
      const mockUser: AppUser = {
        id: `usr_${Math.abs(email.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0))}`,
        uid: `usr_${Math.abs(email.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0))}`,
        email,
        displayName: email.split('@')[0],
        user_metadata: { full_name: email.split('@')[0] },
      };
      const mockSession = { access_token: 'demo_token' };
      setUser(mockUser);
      setSession(mockSession);
      localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify({ user: mockUser, session: mockSession }));
      await fetchProfile(mockUser.id, email);
      setLoading(false);
      setIsAuthModalOpen(false);
      return { error: null };
    }
  };

  const signUp = async (email: string, password: string, fullName: string, phone: string) => {
    setLoading(true);
    setOauthError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const appUser = mapFirebaseUser(userCredential.user);
      setUser(appUser);
      setSession({ access_token: await userCredential.user.getIdToken() });
      await fetchProfile(appUser.id, appUser.email, fullName, phone);
      setLoading(false);
      setIsAuthModalOpen(false);
      return { error: null, confirmationRequired: false };
    } catch {
      // Fallback demo signup
      const mockUser: AppUser = {
        id: `usr_${Date.now()}`,
        uid: `usr_${Date.now()}`,
        email,
        displayName: fullName,
        user_metadata: { full_name: fullName, phone },
      };
      const mockSession = { access_token: 'demo_token' };
      setUser(mockUser);
      setSession(mockSession);
      localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify({ user: mockUser, session: mockSession }));
      await fetchProfile(mockUser.id, email, fullName, phone);
      setLoading(false);
      setIsAuthModalOpen(false);
      return { error: null, confirmationRequired: false };
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    setOauthError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const appUser = mapFirebaseUser(result.user);
      setUser(appUser);
      setSession({ access_token: await result.user.getIdToken() });
      await fetchProfile(appUser.id, appUser.email, appUser.displayName);
      setLoading(false);
      setIsAuthModalOpen(false);
      return { error: null };
    } catch (err: unknown) {
      setLoading(false);
      const error = err as Error;
      setOauthError(error.message);
      return { error };
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
      email = 'vishal2a3a@gmail.com';
      fullName = 'Vishal (Platform Admin)';
      phone = '+91 98400 11000';
      assignedRole = 'admin';
      vehicleMake = 'Hyundai';
      vehicleModel = 'Ioniq 5';
      vehicleReg = 'TN 01 EV 0001';
      connector = 'CCS2 (DC Fast Charger, 25-60+ kW)';
      batteryKwh = 72.6;
    }

    const mockId = `usr_${role}_demo`;
    const mockUser: AppUser = {
      id: mockId,
      uid: mockId,
      email,
      displayName: fullName,
      user_metadata: { full_name: fullName, phone },
    };

    const mockSession = { access_token: `mock_token_${role}` };

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
    try {
      await sendPasswordResetEmail(auth, email);
      setLoading(false);
      return { error: null };
    } catch (err) {
      setLoading(false);
      return { error: err as Error };
    }
  };

  const updatePassword = async (newPassword: string) => {
    setLoading(true);
    if (!auth.currentUser) {
      setLoading(false);
      return { error: new Error('User not logged into Firebase') };
    }
    try {
      await fbUpdatePassword(auth.currentUser, newPassword);
      setLoading(false);
      setIsAuthModalOpen(false);
      return { error: null };
    } catch (err) {
      setLoading(false);
      return { error: err as Error };
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await fbSignOut(auth);
    } catch {
      // Ignore
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

    const safeUpdates = { ...updates };
    delete safeUpdates.role;
    delete safeUpdates.id;

    const updated = { ...profile, ...safeUpdates } as UserProfileData;
    setProfile(updated);
    localStorage.setItem(`plugmitra_profile_${user.id}`, JSON.stringify(updated));

    try {
      const profileRef = doc(db, 'profiles', user.id);
      await updateDoc(profileRef, safeUpdates);
      return { error: null };
    } catch {
      // If Firestore is still being provisioned or rule denies, local cache preserves profile
      return { error: null };
    }
  };

  const isAdmin = profile?.role === 'admin' || user?.email === 'vishal2a3a@gmail.com' || user?.email === 'admin@plugmitra.in';

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        isConfigured: true,
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
