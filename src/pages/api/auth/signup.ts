import type { APIRoute } from "astro";
import { z } from "astro/zod";

// Signup input validation schema
const signupSchema = z
  .object({
    email: z.string().email("Wprowadź prawidłowy adres email"),
    password: z.string().min(8, "Hasło musi mieć co najmniej 8 znaków"),
    passwordConfirm: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Hasła nie są identyczne",
    path: ["passwordConfirm"], // Path indicates which field the error belongs to
  });

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Parse request body
    const body = await request.json();

    // Validate input
    const validationResult = signupSchema.safeParse(body);
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Nieprawidłowe dane rejestracji",
          errors: validationResult.error.flatten().fieldErrors,
        }),
        { status: 400 }
      );
    }

    const { email, password } = validationResult.data;

    // Use Supabase from locals
    const supabase = locals.supabase;

    // Attempt to sign up the user
    // eslint-disable-next-line no-console
    console.log("Calling supabase.auth.signUp...");
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      // Mark the user as confirmed immediately
      options: {
        data: {
          confirmed_at: new Date().toISOString(), // Add this to auto-confirm
        },
      },
    });

    // Handle potential errors during signup
    if (error) {
      // eslint-disable-next-line no-console
      console.error("Supabase signup error occurred:", JSON.stringify(error, null, 2));
      let status = 500; // Default to internal server error
      let message = "Wystąpił błąd podczas rejestracji";

      // Check for specific Supabase error codes or messages
      if (error.message.includes("User already registered")) {
        status = 409; // Conflict
        message = "Użytkownik o podanym adresie email już istnieje";
      } else if (error.status) {
        // Use Supabase error status if available
        status = error.status;
      }

      return new Response(JSON.stringify({ success: false, message }), { status });
    }

    // eslint-disable-next-line no-console
    console.log("Supabase signup call completed. Data:", JSON.stringify(data, null, 2));

    // Check if user data exists (should exist on successful signup)
    if (!data.user) {
      // eslint-disable-next-line no-console
      console.error("Signup succeeded but no user data returned.");
      return new Response(
        JSON.stringify({
          success: false,
          message: "Rejestracja zakończona, ale wystąpił problem z pobraniem danych użytkownika.",
        }),
        { status: 500 }
      );
    }

    // Successfully created and confirmed user
    // eslint-disable-next-line no-console
    console.log(`User successfully signed up logic completed for: ${data.user.email}`);

    // Optionally: Sign in the user immediately after registration
    // Note: Supabase handles the session automatically on signup if using the client library correctly,
    // but we might need to explicitly set cookies for SSR flows if not handled by middleware.
    // The current setup with ssr client should handle this.

    // Redirect to the home page or a welcome page after successful registration
    // return redirect("/"); // Astro redirect helper

    // Or return success response (frontend handles redirect)
    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: data.user.id,
          email: data.user.email,
        },
      }),
      { status: 201 } // 201 Created status for successful resource creation
    );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Caught unexpected error in signup endpoint:", error);

    return new Response(
      JSON.stringify({
        success: false,
        message: "Wystąpił nieoczekiwany błąd serwera. Spróbuj ponownie później.",
      }),
      { status: 500 }
    );
  }
};
