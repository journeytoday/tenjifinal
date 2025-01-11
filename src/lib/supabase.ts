import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please click "Connect to Supabase" to set up your connection.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'Content-Type': 'application/json'
    }
  },
  // Add retry configuration
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Verify connection
const verifyConnection = async () => {
  try {
    const { error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
    if (error) {
      console.error('Supabase connection error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Failed to verify Supabase connection:', err);
    return false;
  }
};

// Initialize Supabase auth listener with retry logic
let retryCount = 0;
const maxRetries = 3;

const initializeAuth = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      console.log('Session initialized successfully');
    }

    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        console.log('User signed in:', session?.user?.id);
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out');
      }
    });

    retryCount = 0; // Reset retry count on successful initialization
  } catch (error) {
    console.error('Auth initialization error:', error);
    
    if (retryCount < maxRetries) {
      retryCount++;
      console.log(`Retrying auth initialization (attempt ${retryCount}/${maxRetries})...`);
      setTimeout(initializeAuth, 1000 * retryCount); // Exponential backoff
    }
  }
};

// Verify connection and initialize auth
verifyConnection().then(isConnected => {
  if (isConnected) {
    initializeAuth();
  } else {
    console.error('Failed to establish Supabase connection');
  }
});

export { verifyConnection };