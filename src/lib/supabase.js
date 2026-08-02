// import { createClient } from '@supabase/supabase-js';

// const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
// const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// export const supabase = createClient(supabaseUrl, supabaseAnonKey);


import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    fetch: async (url, options = {}) => {
      try {
        const token = await window.Clerk?.session?.getToken({
          template: "supabase",
        });

        const headers = new Headers(options.headers);

        if (token) {
          headers.set('Authorization', `Bearer ${token}`);
        }

        return fetch(url, {
          ...options,
          headers,
        });
      } catch (err) {
        console.error("Token error:", err);
        return fetch(url, options);
      }
    },
  },
});