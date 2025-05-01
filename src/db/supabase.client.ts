import type { AstroCookies } from "astro";
import { createServerClient, type CookieOptionsWithName, type CookieOptions } from "@supabase/ssr";
import { SUPABASE_URL, SUPABASE_KEY } from "astro:env/server";

import type { Database } from "./database.types";

// Remove the old client export entirely
/*
export const supabaseClient =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  SUPABASE_URL && SUPABASE_KEY ? createClient<Database>(SUPABASE_URL, SUPABASE_KEY) : (undefined as any); 
*/

// Keep SupabaseClient type export
export type SupabaseClient = ReturnType<typeof createSupabaseServerInstance>;
// Admin client instance removed
// export type SupabaseAdminClient = ReturnType<typeof createSupabaseAdminInstance>;

export const DEFAULT_USER_ID = "09794bf4-14b3-44ec-aeff-56e788450433";

export const cookieOptions: CookieOptionsWithName = {
  name: "sb-auth-token",
  path: "/",
  secure: true, // Should be true in production
  httpOnly: true,
  sameSite: "lax",
  maxAge: 60 * 60 * 24 * 7, // 1 week
};

export const createSupabaseServerInstance = (context: { headers: Headers; cookies: AstroCookies }) => {
  const supabase = createServerClient<Database>(SUPABASE_URL, SUPABASE_KEY, {
    cookieOptions,
    cookies: {
      get(key: string) {
        // Correct signature for get
        return context.cookies.get(key)?.value;
      },
      set(key: string, value: string, options: CookieOptions) {
        // Correct signature for set
        context.cookies.set(key, value, options);
      },
      remove(key: string, options: CookieOptions) {
        // Correct signature for remove
        context.cookies.delete(key, options);
      },
      // Remove getAll and setAll as they are deprecated/incorrectly implemented before
      /* 
      getAll() {
        return parseCookieHeader(context.headers.get("Cookie") ?? "");
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => context.cookies.set(name, value, options));
      },
      */
    },
  });

  return supabase;
};

// Admin instance code removed entirely
