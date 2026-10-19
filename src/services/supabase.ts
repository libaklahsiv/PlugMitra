import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let client: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http')) {
  try {
    client = createClient(supabaseUrl, supabaseAnonKey);
  } catch (err) {
    console.warn('[PlugMitra] Failed to initialize Supabase client:', err);
  }
}

// In-memory mock storage for local runtime & fallback
const inMemoryStore = new Map<string, any[]>();

export const isSupabaseConfigured = Boolean(client);

export const supabase = client || (new Proxy({}, {
  get: (_target, prop) => {
    if (prop === 'from') {
      return (tableName: string) => {
        if (!inMemoryStore.has(tableName)) {
          inMemoryStore.set(tableName, []);
        }
        return {
          select: async () => ({ data: inMemoryStore.get(tableName) || [], error: null }),
          insert: async (records: any[]) => {
            const list = inMemoryStore.get(tableName) || [];
            const newRecords = Array.isArray(records) ? records : [records];
            list.push(...newRecords);
            inMemoryStore.set(tableName, list);
            return { data: newRecords, error: null };
          },
          update: async (updates: any) => ({ data: updates, error: null }),
          delete: async () => ({ data: null, error: null }),
        };
      };
    }
    return () => ({ data: null, error: null });
  },
}) as unknown as SupabaseClient);
