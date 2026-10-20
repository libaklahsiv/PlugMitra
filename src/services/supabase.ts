import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

// Safely access Vite client-side environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// Verification: Ensure the keys provided are valid URL format and non-empty
const isValidSupabaseConfig = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('http') &&
  !supabaseUrl.includes('your-project-id') &&
  supabaseAnonKey.length > 20
);

let supabaseClient: SupabaseClient<Database> | null = null;

if (isValidSupabaseConfig && supabaseUrl && supabaseAnonKey) {
  try {
    supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  } catch (err) {
    console.warn('[PlugMitra] Failed to initialize Supabase client:', err);
  }
}

export const isSupabaseConfigured = Boolean(supabaseClient);

// Fallback in-memory and local mock when Supabase is not yet populated in .env.local
const inMemoryStore = new Map<string, Record<string, unknown>[]>();

export const supabase: SupabaseClient<Database> = (supabaseClient || (new Proxy({}, {
  get: (_target, prop) => {
    if (prop === 'auth') {
      return {
        getSession: async () => ({ data: { session: null }, error: null }),
        getUser: async () => ({ data: { user: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signInWithPassword: async () => ({ data: { user: null, session: null }, error: new Error('Supabase environment variables not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local.') }),
        signUp: async () => ({ data: { user: null, session: null }, error: new Error('Supabase environment variables not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local.') }),
        signOut: async () => ({ error: null }),
      };
    }
    if (prop === 'storage') {
      return {
        from: () => ({
          upload: async () => ({ data: null, error: new Error('Supabase Storage not configured') }),
          getPublicUrl: () => ({ data: { publicUrl: '' } }),
        }),
      };
    }
    if (prop === 'from') {
      return (tableName: string) => {
        if (!inMemoryStore.has(tableName)) {
          inMemoryStore.set(tableName, []);
        }
        return {
          select: () => ({
            eq: () => ({
              order: async () => ({ data: inMemoryStore.get(tableName) || [], error: null }),
              single: async () => ({ data: inMemoryStore.get(tableName)?.[0] || null, error: null }),
            }),
            order: async () => ({ data: inMemoryStore.get(tableName) || [], error: null }),
            single: async () => ({ data: inMemoryStore.get(tableName)?.[0] || null, error: null }),
          }),
          insert: async (records: Record<string, unknown>[] | Record<string, unknown>) => {
            const list = inMemoryStore.get(tableName) || [];
            const newRecords = Array.isArray(records) ? records : [records];
            list.push(...newRecords);
            inMemoryStore.set(tableName, list);
            return { data: newRecords, error: null };
          },
          update: () => ({
            eq: async () => ({ data: null, error: null }),
          }),
          delete: () => ({
            eq: async () => ({ data: null, error: null }),
          }),
        };
      };
    }
    return () => ({ data: null, error: null });
  },
}) as unknown as SupabaseClient<Database>));
