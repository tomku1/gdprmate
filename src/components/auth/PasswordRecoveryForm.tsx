import { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Alert, AlertDescription } from "../ui/alert";
import { SpinnerOverlay } from "../SpinnerOverlay";

interface PasswordRecoveryFormState {
  email: string;
  isLoading: boolean;
  error: string | null;
  success: boolean;
  validationError: string | null;
}

export function PasswordRecoveryForm() {
  const [state, setState] = useState<PasswordRecoveryFormState>({
    email: "",
    isLoading: false,
    error: null,
    success: false,
    validationError: null,
  });

  const validateEmail = (email: string): string | null => {
    if (!email) {
      return "Email jest wymagany";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return "Podaj prawidłowy adres email";
    }
    return null;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value;
    setState(prev => ({
      ...prev,
      email,
      validationError: email ? null : prev.validationError,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateEmail(state.email);
    if (validationError) {
      setState(prev => ({ ...prev, validationError }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null, success: false }));

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: state.email,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Wystąpił błąd podczas wysyłania linku resetującego hasło");
      }

      // Pokazujemy komunikat sukcesu nawet jeśli email nie istnieje - ze względów bezpieczeństwa
      setState(prev => ({
        ...prev,
        isLoading: false,
        success: true,
        email: "", // Czyszczenie pola po sukcesie
      }));
    } catch (error) {
      setState(prev => ({
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
          <CardTitle>Odzyskaj hasło</CardTitle>
          <CardDescription>
            Wpisz swój adres email, aby otrzymać link do resetowania hasła
          </CardDescription>
        </CardHeader>
        <CardContent>
          {state.success ? (
            <div className="space-y-4">
              <Alert className="bg-green-50 text-green-800 border-green-200">
                <AlertDescription>
                  Jeśli podany adres email istnieje w naszej bazie, to wysłaliśmy na niego link do resetowania hasła. 
                  Sprawdź swoją skrzynkę (oraz folder spam) i postępuj zgodnie z instrukcjami.
                </AlertDescription>
              </Alert>
              <div className="text-center">
                <Button 
                  variant="outline" 
                  onClick={() => window.location.href = "/login"}
                  className="mt-2"
                >
                  Powrót do logowania
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={state.email}
                  onChange={handleEmailChange}
                  aria-invalid={!!state.validationError}
                />
                {state.validationError && (
                  <p className="text-sm text-destructive">{state.validationError}</p>
                )}
              </div>

              {state.error && (
                <Alert variant="destructive">
                  <AlertDescription>{state.error}</AlertDescription>
                </Alert>
              )}

              <div className="flex flex-col space-y-3">
                <Button 
                  type="submit" 
                  disabled={state.isLoading}
                  className="w-full"
                >
                  {state.isLoading ? "Wysyłanie..." : "Wyślij link resetujący"}
                </Button>
                
                <div className="text-center text-sm">
                  <a href="/login" className="text-primary underline underline-offset-4 hover:text-primary/90">
                    Powrót do logowania
                  </a>
                </div>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      <SpinnerOverlay isLoading={state.isLoading} />
    </div>
  );
} 