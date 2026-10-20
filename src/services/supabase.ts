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

// Safe Development vs Production Handling
const isProd = Boolean(import.meta.env.PROD);

// Fallback in-memory and local mock strictly for local dev testing
const inMemoryStore = new Map<string, Record<string, unknown>[]>();

export const supabase: SupabaseClient<Database> = (supabaseClient || (new Proxy({}, {
  get: (_target, prop) => {
    if (prop === 'auth') {
      return {
        getSession: async () => ({ data: { session: null }, error: null }),
        getUser: async () => ({ data: { user: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signInWithPassword: async () => {
          if (isProd) {
            return {
              data: { user: null, session: null },
              error: new Error('Production Authentication is not configured. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your deployment environment.')
            };
          }
          return {
            data: { user: null, session: null },
            error: new Error('Local dev Supabase credentials not found. Provide VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local.')
          };
        },
        signUp: async () => {
          if (isProd) {
            return {
              data: { user: null, session: null },
              error: new Error('Production Authentication is not configured. Account registration requires live Supabase credentials.')
            };
          }
          return {
            data: { user: null, session: null },
            error: new Error('Local dev Supabase credentials not found. Provide VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local.')
          };
        },
        signInWithOAuth: async () => {
          if (isProd) {
            return {
              data: { provider: 'google', url: null },
              error: new Error('Production Authentication is not configured. Google sign-in requires live Supabase credentials.')
            };
          }
          return {
            data: { provider: 'google', url: null },
            error: new Error('Local dev Supabase credentials not found. Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local.')
          };
        },
        resetPasswordForEmail: async () => {
          if (isProd) {
            return {
              data: null,
              error: new Error('Production Authentication is not configured. Password reset requires live Supabase credentials.')
            };
          }
          return {
            data: null,
            error: new Error('Local dev Supabase credentials not found. Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local.')
          };
        },
        updateUser: async () => {
          if (isProd) {
            return {
              data: { user: null },
              error: new Error('Production Authentication is not configured. Password update requires live Supabase credentials.')
            };
          }
          return {
            data: { user: null },
            error: new Error('Local dev Supabase credentials not found. Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local.')
          };
        },
        signOut: async () => ({ error: null }),
      };
    }
    if (prop === 'storage') {
      return {
        from: (bucketId: string) => ({
          upload: async (path: string) => {
            if (isProd) {
              return { data: null, error: new Error(`Production storage bucket "${bucketId}" is not configured.`) };
            }
            return { data: { path }, error: null };
          },
          getPublicUrl: (path: string) => ({
            data: { publicUrl: path.startsWith('http') ? path : '' },
          }),
        }),
      };
    }
    if (prop === 'from') {
      return (tableName: string) => {
        if (!inMemoryStore.has(tableName)) {
          inMemoryStore.set(tableName, []);
        }
        return {
          select: () => {
            const getList = () => inMemoryStore.get(tableName) || [];
            return {
              eq: (_col: string, val: unknown) => ({
                order: async () => ({
                  data: getList().filter((r) => (r as Record<string, unknown>)[_col] === val),
                  error: null
                }),
                single: async () => ({
                  data: getList().find((r) => (r as Record<string, unknown>)[_col] === val) || null,
                  error: null
                }),
                then: (resolve: (val: unknown) => unknown) =>
                  Promise.resolve({
                    data: getList().filter((r) => (r as Record<string, unknown>)[_col] === val),
                    error: null
                  }).then(resolve),
              }),
              order: async () => ({ data: getList(), error: null }),
              single: async () => ({ data: getList()[0] || null, error: null }),
              then: (resolve: (val: unknown) => unknown) =>
                Promise.resolve({ data: getList(), error: null }).then(resolve),
            };
          },
          insert: (records: Record<string, unknown>[] | Record<string, unknown>) => {
            if (isProd) {
              const err = new Error(`Production database is not configured. Cannot persist record to table "${tableName}".`);
              return {
                data: null,
                error: err,
                select: () => ({
                  single: async () => ({ data: null, error: err }),
                  then: (resolve: (val: unknown) => unknown) =>
                    Promise.resolve({ data: null, error: err }).then(resolve),
                }),
                then: (resolve: (val: unknown) => unknown) =>
                  Promise.resolve({ data: null, error: err }).then(resolve),
              };
            }

            const list = inMemoryStore.get(tableName) || [];
            const incoming = Array.isArray(records) ? records : [records];
            const withIds = incoming.map((r) => ({
              id: (r as Record<string, unknown>).id || `mock_dev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
              created_at: new Date().toISOString(),
              ...r,
            }));
            list.push(...withIds);
            inMemoryStore.set(tableName, list);

            const result = {
              data: withIds,
              error: null,
              select: () => ({
                single: async () => ({ data: withIds[0] || null, error: null }),
                then: (resolve: (val: unknown) => unknown) =>
                  Promise.resolve({ data: withIds, error: null }).then(resolve),
              }),
              then: (resolve: (val: unknown) => unknown) =>
                Promise.resolve({ data: withIds, error: null }).then(resolve),
            };
            return result;
          },
          update: (updates: Record<string, unknown>) => ({
            eq: async (field: string, val: unknown) => {
              if (isProd) {
                return { data: null, error: new Error('Production database is not configured. Update rejected.') };
              }
              const list = inMemoryStore.get(tableName) || [];
              const updated = list.map((item) =>
                item[field] === val ? { ...item, ...updates, updated_at: new Date().toISOString() } : item
              );
              inMemoryStore.set(tableName, updated);
              return { data: updated, error: null };
            },
          }),
          delete: () => ({
            eq: async (field: string, val: unknown) => {
              if (isProd) {
                return { data: null, error: new Error('Production database is not configured. Delete rejected.') };
              }
              const list = inMemoryStore.get(tableName) || [];
              const filtered = list.filter((item) => item[field] !== val);
              inMemoryStore.set(tableName, filtered);
              return { data: null, error: null };
            },
          }),
        };
      };
    }
    return () => ({ data: null, error: null });
  },
}) as unknown as SupabaseClient<Database>));
