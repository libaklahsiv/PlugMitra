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

// Fallback in-memory and local mock when Supabase credentials are not configured
const inMemoryStore = new Map<string, Record<string, unknown>[]>();

export const supabase: SupabaseClient<Database> = (supabaseClient || (new Proxy({}, {
  get: (_target, prop) => {
    if (prop === 'auth') {
      return {
        getSession: async () => ({ data: { session: null }, error: null }),
        getUser: async () => ({ data: { user: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signInWithPassword: async () => {
          return {
            data: { user: null, session: null },
            error: new Error('Supabase credentials not configured. Please use demo sign in or provide VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
          };
        },
        signUp: async () => {
          return {
            data: { user: null, session: null },
            error: new Error('Supabase credentials not configured. Please use demo sign in or provide VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
          };
        },
        signInWithOAuth: async () => {
          return {
            data: { provider: 'google', url: null },
            error: new Error('Google OAuth requires live Supabase credentials.')
          };
        },
        resetPasswordForEmail: async () => {
          return {
            data: null,
            error: null
          };
        },
        updateUser: async () => {
          return {
            data: { user: null },
            error: null
          };
        },
        signOut: async () => ({ error: null }),
      };
    }
    if (prop === 'storage') {
      return {
        from: () => ({
          upload: async (path: string) => {
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

        // Fluent query builder supporting any depth of .select().eq().eq().order().single()
        const createQueryBuilder = (filters: Array<{ col: string; val: unknown }> = []) => {
          const execute = () => {
            let list = [...(inMemoryStore.get(tableName) || [])];
            for (const f of filters) {
              list = list.filter((r) => (r as Record<string, unknown>)[f.col] === f.val);
            }
            return list;
          };

          const builder: Record<string, unknown> = {
            select: () => createQueryBuilder(filters),
            eq: (col: string, val: unknown) => createQueryBuilder([...filters, { col, val }]),
            order: () => ({
              ...builder,
              single: async () => ({ data: execute()[0] || null, error: null }),
              then: (resolve: (val: unknown) => unknown) =>
                Promise.resolve({ data: execute(), error: null }).then(resolve),
            }),
            limit: () => builder,
            single: async () => ({ data: execute()[0] || null, error: null }),
            then: (resolve: (val: unknown) => unknown) =>
              Promise.resolve({ data: execute(), error: null }).then(resolve),
          };

          return builder;
        };

        return {
          select: () => createQueryBuilder([]),
          insert: (records: Record<string, unknown>[] | Record<string, unknown>) => {
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
