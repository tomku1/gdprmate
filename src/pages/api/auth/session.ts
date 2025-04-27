import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ locals }) => {
  try {
    const { supabase } = locals;

    // Check if user is authenticated using the supabase instance
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
      return new Response(
        JSON.stringify({
          authenticated: false,
          user: null,
        }),
        { status: 200 }
      );
    }

    // Return user data if authenticated
    return new Response(
      JSON.stringify({
        authenticated: true,
        user: {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.name,
        },
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Session check error:", error);

    return new Response(
      JSON.stringify({
        authenticated: false,
        user: null,
        message: "Error checking session",
      }),
      { status: 500 }
    );
  }
};
