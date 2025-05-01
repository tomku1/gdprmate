import { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Alert, AlertDescription } from "../ui/alert";
import { SpinnerOverlay } from "../SpinnerOverlay";

interface LoginFormState {
  email: string;
  password: string;
  isLoading: boolean;
  error: string | null;
  validationErrors: Record<string, string>;
}

export function LoginForm() {
  const [state, setState] = useState<LoginFormState>({
    email: "",
    password: "",
    isLoading: false,
    error: null,
    validationErrors: {},
  });

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Walidacja email
    if (!state.email) {
      errors.email = "Email jest wymagany";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email)) {
      errors.email = "Podaj prawidłowy adres email";
    }

    // Walidacja hasła
    if (!state.password) {
      errors.password = "Hasło jest wymagane";
    }

    setState((prev) => ({ ...prev, validationErrors: errors }));
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setState((prev) => ({
      ...prev,
      [name]: value,
      validationErrors: {
        ...prev.validationErrors,
        [name]: "", // Czyszczenie błędu dla pola, które jest edytowane
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: state.email,
          password: state.password,
        }),
      });

      if (!response.ok) {
        let errorMessage = "Wystąpił błąd podczas logowania";

        if (response.status === 401) {
          errorMessage = "Nieprawidłowy email lub hasło";
        } else if (response.status === 400) {
          const data = await response.json();
          errorMessage = data.message || "Nieprawidłowe dane logowania";
        }

        throw new Error(errorMessage);
      }

      // Przekierowanie do strony głównej po pomyślnym logowaniu
      window.location.href = "/";
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Wystąpił nieoczekiwany błąd. Spróbuj ponownie później.",
      }));
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Zaloguj się</CardTitle>
          <CardDescription>Zaloguj się do swojego konta GdprMate</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={state.email}
                onChange={handleInputChange}
                aria-invalid={!!state.validationErrors.email}
              />
              {state.validationErrors.email && (
                <p className="text-sm text-destructive">{state.validationErrors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Hasło
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={state.password}
                onChange={handleInputChange}
                aria-invalid={!!state.validationErrors.password}
              />
              {state.validationErrors.password && (
                <p className="text-sm text-destructive">{state.validationErrors.password}</p>
              )}
            </div>

            <div className="text-right text-sm">
              <a href="/recover-password" className="text-primary underline underline-offset-4 hover:text-primary/90">
                Zapomniałeś hasła?
              </a>
            </div>

            {state.error && (
              <Alert variant="destructive">
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col space-y-3">
              <Button type="submit" disabled={state.isLoading} className="w-full">
                {state.isLoading ? "Logowanie..." : "Zaloguj się"}
              </Button>

              <div className="text-center text-sm">
                Nie masz jeszcze konta?{" "}
                <a href="/register" className="text-primary underline underline-offset-4 hover:text-primary/90">
                  Zarejestruj się
                </a>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      <SpinnerOverlay 
        isLoading={state.isLoading} 
        title="Logowanie..." 
        subtitle="Trwa weryfikacja danych logowania."
        showAlert={false}
      />
    </div>
  );
}
