import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

// Get environment variables with fallbacks
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if environment variables are available
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Missing Supabase environment variables. Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.",
  );
}

// Create a conditional Supabase client
let supabase: ReturnType<typeof createClient<Database>> | null = null;

// Only initialize if we have valid credentials
if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
} else {
  // Create a mock client that logs errors when methods are called
  const mockMethod = () => {
    console.error(
      "Supabase client not initialized due to missing environment variables",
    );
    return Promise.resolve({
      data: null,
      error: new Error("Supabase not initialized"),
    });
  };

  supabase = {
    from: () => ({
      select: mockMethod,
      insert: mockMethod,
      update: mockMethod,
      delete: mockMethod,
      eq: () => ({
        select: mockMethod,
        insert: mockMethod,
        update: mockMethod,
        delete: mockMethod,
      }),
    }),
    auth: {
      getUser: mockMethod,
      signUp: mockMethod,
      signInWithPassword: mockMethod,
      signOut: mockMethod,
      getSession: mockMethod,
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe: () => {} } },
      }),
    },
    channel: (name: string) => ({
      on: () => ({
        subscribe: () => ({
          unsubscribe: () => {},
        }),
      }),
    }),
    // Add other commonly used methods as needed
  } as any;
}

export { supabase };
