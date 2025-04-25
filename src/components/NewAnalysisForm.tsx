import { useState } from "react";
import { TextAreaWithCounter } from "./TextAreaWithCounter";
import { AnalyseButton } from "./AnalyseButton";
import { SpinnerOverlay } from "./SpinnerOverlay";
import { Alert, AlertDescription } from "./ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import type { CreateAnalysisCommand, CreateAnalysisResponseDTO } from "../types";

interface NewAnalysisFormState {
  text: string;
  isLoading: boolean;
  error: string | null;
  validationError: string | null;
}

export function NewAnalysisForm() {
  const [state, setState] = useState<NewAnalysisFormState>({
    text: "",
    isLoading: false,
    error: null,
    validationError: null,
  });

  const validateText = (text: string): string | null => {
    if (text.length === 0) {
      return "Pole nie może być puste.";
    }
    if (text.length < 10) {
      return "Tekst jest zbyt krótki. Wprowadź co najmniej 10 znaków.";
    }
    if (text.length > 50000) {
      return "Tekst jest zbyt długi. Maksymalna długość to 50 000 znaków.";
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
          // Nagłówki autoryzacyjne będą obsługiwane przez middleware Astro
        },
        body: JSON.stringify(command),
      });

      if (!response.ok) {
        let errorMessage = "Wystąpił błąd podczas analizy.";

        if (response.status === 400) {
          errorMessage = "Nieprawidłowe dane. Sprawdź wprowadzony tekst.";
        } else if (response.status === 413) {
          errorMessage = "Tekst jest zbyt długi. Maksymalna długość to 50 000 znaków.";
        } else if (response.status === 401) {
          // Przekierowanie do logowania - powinno być obsłużone przez middleware Astro
          window.location.href = "/login";
          return;
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
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Wprowadź tekst do analizy</CardTitle>
          <CardDescription>
            Wprowadź tekst klauzuli informacyjnej lub inny tekst związany z GDPR, aby zweryfikować jego zgodność.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TextAreaWithCounter value={state.text} onChange={handleTextChange} maxLength={50000} minLength={10} />

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
