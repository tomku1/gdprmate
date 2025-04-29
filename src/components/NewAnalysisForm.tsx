import { useState } from "react";
import { TextAreaWithCounter } from "./TextAreaWithCounter";
import { AnalyseButton } from "./AnalyseButton";
import { SpinnerOverlay } from "./SpinnerOverlay";
import { Alert, AlertDescription } from "./ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { useAuth } from "./hooks/useAuth";
import type { CreateAnalysisCommand, CreateAnalysisResponseDTO } from "../types";

interface NewAnalysisFormState {
  text: string;
  isLoading: boolean;
  error: string | null;
  validationError: string | null;
}

export function NewAnalysisForm() {
  const { isAuthenticated } = useAuth();
  const [state, setState] = useState<NewAnalysisFormState>({
    text: "",
    isLoading: false,
    error: null,
    validationError: null,
  });

  // Apply different character limits based on authentication status
  const CHAR_LIMIT = isAuthenticated ? 50000 : 1000;

  const validateText = (text: string): string | null => {
    if (text.length === 0) {
      return "Pole nie może być puste.";
    }
    if (text.length < 10) {
      return "Tekst jest zbyt krótki. Wprowadź co najmniej 10 znaków.";
    }
    if (text.length > CHAR_LIMIT) {
      return `Tekst jest zbyt długi. Maksymalna długość to ${CHAR_LIMIT} znaków${!isAuthenticated ? " dla niezalogowanych użytkowników" : ""}.`;
    }
    return null;
  };

  const handleTextChange = (newText: string) => {
    setState((prev) => ({
      ...prev,
      text: newText,
      validationError: validateText(newText),
    }));
  };

  const handleSubmit = async () => {
    const validationError = validateText(state.text);
    if (validationError) {
      setState((prev) => ({ ...prev, validationError }));
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const command: CreateAnalysisCommand = {
        text_content: state.text,
      };

      const response = await fetch("/api/analyses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(command),
      });

      if (!response.ok) {
        let errorMessage = "Wystąpił błąd podczas analizy.";

        try {
          // Try to get detailed error from response
          const errorData = await response.json();
          if (errorData.error || errorData.message) {
            errorMessage = errorData.message || errorData.error;
          }
        } catch {
          // If can't parse JSON, use status-based messages
          if (response.status === 400) {
            errorMessage = "Nieprawidłowe dane. Sprawdź wprowadzony tekst.";
          } else if (response.status === 413) {
            errorMessage = `Tekst jest zbyt długi. Maksymalna długość to ${CHAR_LIMIT} znaków${!isAuthenticated ? " dla niezalogowanych użytkowników" : ""}.`;
          } else if (response.status === 401) {
            errorMessage = "Wymagane zalogowanie. Przekierowanie do strony logowania...";
            // Short delay before redirect to show the message
            setTimeout(() => {
              window.location.href = "/login";
            }, 1500);

            setState((prev) => ({
              ...prev,
              isLoading: false,
              error: errorMessage,
            }));
            return;
          } else if (response.status === 429) {
            errorMessage = "Zbyt wiele żądań. Spróbuj ponownie za chwilę.";
          } else if (response.status >= 500) {
            errorMessage = "Wystąpił błąd po stronie serwera. Spróbuj ponownie później.";
          }
        }

        throw new Error(errorMessage);
      }

      const data: CreateAnalysisResponseDTO = await response.json();

      // Przekierowanie do widoku szczegółów analizy
      window.location.href = `/analyses/${data.id}`;
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Wystąpił nieoczekiwany błąd. Spróbuj ponownie później.",
      }));
    }
  };

  return (
    <div className="max-w-4xl mx-auto" data-test-id="analysis-form">
      <Card>
        <CardHeader>
          <CardTitle>Wprowadź tekst do analizy</CardTitle>
          <CardDescription>
            Wprowadź tekst klauzuli informacyjnej lub inny tekst związany z GDPR, aby zweryfikować jego zgodność.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TextAreaWithCounter value={state.text} onChange={handleTextChange} maxLength={CHAR_LIMIT} minLength={10} />

          {!isAuthenticated && (
            <Alert className="mt-4 bg-muted/50">
              <AlertDescription>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span>Limit tekstu dla niezalogowanych użytkowników: 1000 znaków.</span>
                  <a href="/login" className="text-primary hover:underline text-sm font-medium">
                    Zaloguj się, aby korzystać z pełnej funkcjonalności
                  </a>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {state.error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end mt-6">
            <AnalyseButton
              onClick={handleSubmit}
              disabled={!!state.validationError || state.text.length === 0}
              isLoading={state.isLoading}
            />
          </div>
        </CardContent>
      </Card>

      <SpinnerOverlay isLoading={state.isLoading} />
    </div>
  );
}
