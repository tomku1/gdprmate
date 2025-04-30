import { createClient } from "@supabase/supabase-js";
import type { AstroCookies } from "astro";
import { createServerClient, type CookieOptionsWithName, type CookieOptions } from "@supabase/ssr";

import type { Database } from "./database.types";

// Add better error handling for environment variables
const getEnvVariable = (key: string): string => {
  const value = import.meta.env[key];
  if (!value) {
    console.error(
      `Environment variable ${key} is not defined. This will cause Supabase client initialization to fail.`
    );
    return ""; // Return empty string to avoid undefined errors but the client will still fail properly
  }
  return value;
};

const supabaseUrl = getEnvVariable("SUPABASE_URL");
const supabaseAnonKey = getEnvVariable("SUPABASE_KEY");

// Only create the client if we have the required environment variables
export const supabaseClient =
  supabaseUrl && supabaseAnonKey ? createClient<Database>(supabaseUrl, supabaseAnonKey) : (undefined as any); // This will fail at runtime if used but prevents immediate crash

export type SupabaseClient = typeof supabaseClient;

export const DEFAULT_USER_ID = "09794bf4-14b3-44ec-aeff-56e788450433";

export const cookieOptions: CookieOptionsWithName = {
  path: "/",
  secure: true,
  httpOnly: true,
  sameSite: "lax",
};

function parseCookieHeader(cookieHeader: string): { name: string; value: string }[] {
  return cookieHeader.split(";").map((cookie) => {
    const [name, ...rest] = cookie.trim().split("=");
    return { name, value: rest.join("=") };
  });
}

interface CookieToSet {
  name: string;
  value: string;
  options?: CookieOptions;
}

export const createSupabaseServerInstance = (context: { headers: Headers; cookies: AstroCookies }) => {
  // Check if env variables are available before creating the client
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      `Cannot create Supabase server instance. Missing environment variables: ${!supabaseUrl ? "SUPABASE_URL" : ""} ${!supabaseAnonKey ? "SUPABASE_KEY" : ""}`
    );
  }

  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookieOptions,
    cookies: {
      getAll() {
        return parseCookieHeader(context.headers.get("Cookie") ?? "");
      },
      setAll(cookiesToSet: CookieToSet[]) {
        cookiesToSet.forEach(({ name, value, options }) => context.cookies.set(name, value, options));
      },
    },
  });

  return supabase;
};
