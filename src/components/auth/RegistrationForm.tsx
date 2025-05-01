import { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Alert, AlertDescription } from "../ui/alert";
import { SpinnerOverlay } from "../SpinnerOverlay";

interface RegistrationFormState {
  email: string;
  password: string;
  passwordConfirm: string;
  isLoading: boolean;
  error: string | null;
  validationErrors: Record<string, string>;
}

export function RegistrationForm() {
  const [state, setState] = useState<RegistrationFormState>({
    email: "",
    password: "",
    passwordConfirm: "",
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
    } else if (state.password.length < 8) {
      errors.password = "Hasło musi mieć co najmniej 8 znaków";
    }

    // Walidacja potwierdzenia hasła
    if (!state.passwordConfirm) {
      errors.passwordConfirm = "Potwierdzenie hasła jest wymagane";
    } else if (state.password !== state.passwordConfirm) {
      errors.passwordConfirm = "Hasła nie są identyczne";
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
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: state.email,
          password: state.password,
          passwordConfirm: state.passwordConfirm,
        }),
      });

      if (!response.ok) {
        let errorMessage = "Wystąpił błąd podczas rejestracji";

        if (response.status === 409) {
          errorMessage = "Użytkownik o podanym adresie email już istnieje";
        } else if (response.status === 400) {
          const data = await response.json();
          errorMessage = data.message || "Nieprawidłowe dane rejestracji";
        }

        throw new Error(errorMessage);
      }

      // Przekierowanie do strony głównej po pomyślnej rejestracji
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
          <CardTitle>Zarejestruj się</CardTitle>
          <CardDescription>Utwórz konto, aby korzystać z pełnej funkcjonalności GdprMate</CardDescription>
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
                autoComplete="new-password"
                value={state.password}
                onChange={handleInputChange}
                aria-invalid={!!state.validationErrors.password}
              />
              {state.validationErrors.password && (
                <p className="text-sm text-destructive">{state.validationErrors.password}</p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="passwordConfirm"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Potwierdź hasło
              </label>
              <Input
                id="passwordConfirm"
                name="passwordConfirm"
                type="password"
                autoComplete="new-password"
                value={state.passwordConfirm}
                onChange={handleInputChange}
                aria-invalid={!!state.validationErrors.passwordConfirm}
              />
              {state.validationErrors.passwordConfirm && (
                <p className="text-sm text-destructive">{state.validationErrors.passwordConfirm}</p>
              )}
            </div>

            {state.error && (
              <Alert variant="destructive">
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col space-y-3">
              <Button type="submit" disabled={state.isLoading} className="w-full">
                {state.isLoading ? "Rejestracja..." : "Zarejestruj się"}
              </Button>

              <div className="text-center text-sm">
                Masz już konto?{" "}
                <a href="/login" className="text-primary underline underline-offset-4 hover:text-primary/90">
                  Zaloguj się
                </a>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      <SpinnerOverlay 
        isLoading={state.isLoading} 
        title="Rejestracja..." 
        subtitle="Trwa tworzenie nowego konta."
        showAlert={false}
      />
    </div>
  );
}
