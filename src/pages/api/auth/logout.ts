import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ locals }) => {
  try {
    const { supabase } = locals;

    const { error } = await supabase.auth.signOut();

    if (error) {
      return new Response(
        JSON.stringify({
          success: false,
          message: error.message,
        }),
        { status: 400 }
      );
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error("Logout error:", error);

    return new Response(
      JSON.stringify({
        success: false,
        message: "Wystąpił nieoczekiwany błąd. Spróbuj ponownie później.",
      }),
      { status: 500 }
    );
  }
};
