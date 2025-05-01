import { defineMiddleware } from "astro:middleware";
import { createSupabaseServerInstance } from "../db/supabase.client";

// Public paths - Auth API endpoints & Server-Rendered Astro Pages
const PUBLIC_PATHS = [
  // Server-Rendered Astro Pages
  "/dashboard",
  "/login",
  "/register",
  "/recover-password",
  // Auth API endpoints
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/reset-password",
  "/api/auth/session",
  "/api/auth/logout",
  // Analysis endpoints
  "/api/analyses",
];

// Add function to check if path starts with a specific pattern
const pathStartsWith = (path: string, patterns: string[]): boolean => {
  return patterns.some((pattern) => path.startsWith(pattern));
};

// Add function to check if a path matches a specific analysis detail endpoint
const isAnalysisDetailPath = (path: string): boolean => {
  // Check if path matches the pattern /api/analyses/{uuid}
  return /^\/api\/analyses\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}(\?.*)?$/.test(path);
};

export const onRequest = defineMiddleware(async ({ locals, cookies, url, request, redirect }, next) => {
  // Create Supabase server instance for ALL routes and attach to locals
  const supabase = createSupabaseServerInstance({
    cookies,
    headers: request.headers,
  });

  // Attach supabase to locals so it can be used in all routes
  locals.supabase = supabase;

  // Always try to get user session first
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Set locals.user if a session exists
  if (user) {
    locals.user = {
      email: user.email ?? null,
      id: user.id,
    };
  }

  // Redirect root path to dashboard
  if (url.pathname === "/") {
    return redirect("/dashboard");
  }

  // Check if the current path is public
  const isPublicPath =
    PUBLIC_PATHS.includes(url.pathname) ||
    pathStartsWith(url.pathname, ["/analyses/"]) || // Note: This pattern might need refinement depending on exact public routes
    isAnalysisDetailPath(url.pathname);

  // If it's a public path, proceed without checking authentication
  if (isPublicPath) {
    return next();
  }

  // If it's a protected path and user is not logged in, redirect to login
  if (!locals.user) {
    return redirect("/login");
  }

  // User is logged in on a protected path, proceed
  return next();
});
