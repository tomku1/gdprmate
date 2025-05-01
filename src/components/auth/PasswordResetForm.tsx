import { useState, useEffect } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Alert, AlertDescription } from "../ui/alert";
import { SpinnerOverlay } from "../SpinnerOverlay";

interface PasswordResetFormState {
  newPassword: string;
  passwordConfirm: string;
  isLoading: boolean;
  error: string | null;
  success: boolean;
  validationErrors: Record<string, string>;
  token: string | null;
}

export function PasswordResetForm() {
  const [state, setState] = useState<PasswordResetFormState>({
    newPassword: "",
    passwordConfirm: "",
    isLoading: false,
    error: null,
    success: false,
    validationErrors: {},
    token: null,
  });

  useEffect(() => {
    // Pobieranie tokena z URL
    const url = new URL(window.location.href);
    const token = url.searchParams.get("token");

    if (!token) {
      setState((prev) => ({
        ...prev,
        error: "Brak lub nieprawidłowy token resetowania hasła. Użyj kompletnego linku z wiadomości email.",
      }));
    } else {
      setState((prev) => ({ ...prev, token }));
    }
  }, []);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Walidacja nowego hasła
    if (!state.newPassword) {
      errors.newPassword = "Nowe hasło jest wymagane";
    } else if (state.newPassword.length < 8) {
      errors.newPassword = "Hasło musi mieć co najmniej 8 znaków";
    }

    // Walidacja potwierdzenia hasła
    if (!state.passwordConfirm) {
      errors.passwordConfirm = "Potwierdzenie hasła jest wymagane";
    } else if (state.newPassword !== state.passwordConfirm) {
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

    if (!validateForm() || !state.token) {
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch("/api/auth/update-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          newPassword: state.newPassword,
          passwordConfirm: state.passwordConfirm,
          token: state.token,
        }),
      });

      if (!response.ok) {
        let errorMessage = "Wystąpił błąd podczas resetowania hasła";

        if (response.status === 400) {
          const data = await response.json();
          errorMessage = data.message || "Nieprawidłowe dane";
        } else if (response.status === 401) {
          errorMessage = "Token resetowania hasła wygasł lub jest nieprawidłowy";
        }

        throw new Error(errorMessage);
      }

      setState((prev) => ({
        ...prev,
        isLoading: false,
        success: true,
        newPassword: "",
        passwordConfirm: "",
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Wystąpił nieoczekiwany błąd. Spróbuj ponownie później.",
      }));
    }
  };

  if (state.success) {
    return (
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Hasło zostało zresetowane</CardTitle>
            <CardDescription>Twoje hasło zostało pomyślnie zmienione</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="bg-green-50 text-green-800 border-green-200">
              <AlertDescription>
                Hasło zostało pomyślnie zmienione. Możesz teraz zalogować się do swojego konta przy użyciu nowego hasła.
              </AlertDescription>
            </Alert>
            <div className="text-center">
              <Button onClick={() => (window.location.href = "/login")} className="w-full">
                Przejdź do logowania
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Zresetuj hasło</CardTitle>
          <CardDescription>Wprowadź nowe hasło dla swojego konta</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="newPassword"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Nowe hasło
              </label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                autoComplete="new-password"
                value={state.newPassword}
                onChange={handleInputChange}
                aria-invalid={!!state.validationErrors.newPassword}
                disabled={
                  !state.token ||
                  state.error ===
                    "Brak lub nieprawidłowy token resetowania hasła. Użyj kompletnego linku z wiadomości email."
                }
              />
              {state.validationErrors.newPassword && (
                <p className="text-sm text-destructive">{state.validationErrors.newPassword}</p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="passwordConfirm"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Potwierdź nowe hasło
              </label>
              <Input
                id="passwordConfirm"
                name="passwordConfirm"
                type="password"
                autoComplete="new-password"
                value={state.passwordConfirm}
                onChange={handleInputChange}
                aria-invalid={!!state.validationErrors.passwordConfirm}
                disabled={
                  !state.token ||
                  state.error ===
                    "Brak lub nieprawidłowy token resetowania hasła. Użyj kompletnego linku z wiadomości email."
                }
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
              <Button type="submit" disabled={state.isLoading || !state.token || !!state.error} className="w-full">
                {state.isLoading ? "Przetwarzanie..." : "Zresetuj hasło"}
              </Button>

              <div className="text-center text-sm">
                <a href="/login" className="text-primary underline underline-offset-4 hover:text-primary/90">
                  Powrót do logowania
                </a>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      <SpinnerOverlay 
        isLoading={state.isLoading} 
        title="Zmiana hasła..." 
        subtitle="Trwa aktualizacja hasła do konta."
        showAlert={false}
      />
    </div>
  );
}
