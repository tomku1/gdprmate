import type { APIRoute } from "astro";
import { z } from "astro/zod";

// Login input validation schema
const loginSchema = z.object({
  email: z.string().email("Wprowadź prawidłowy adres email"),
  password: z.string().min(1, "Hasło jest wymagane"),
});

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Parse request body
    const body = await request.json();

    // Validate input
    const validationResult = loginSchema.safeParse(body);
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Nieprawidłowe dane logowania",
          errors: validationResult.error.flatten().fieldErrors,
        }),
        { status: 400 }
      );
    }

    const { email, password } = validationResult.data;

    // Use Supabase from locals (instead of creating a new instance)
    const supabase = locals.supabase;

    // Attempt to sign in with email and password
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // Handle authentication errors
    if (error) {
      let status = 400;
      let message = error.message;

      if (error.status === 400 || error.status === 401) {
        status = 401;
        message = "Nieprawidłowy email lub hasło";
      }

      return new Response(JSON.stringify({ success: false, message }), { status });
    }

    // Successfully authenticated
    console.log(`User successfully logged in: ${data.user.email}`);

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: data.user.id,
          email: data.user.email,
        },
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Login error:", error);

    return new Response(
      JSON.stringify({
        success: false,
        message: "Wystąpił nieoczekiwany błąd. Spróbuj ponownie później.",
      }),
      { status: 500 }
    );
  }
};
