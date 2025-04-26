# Przewodnik Implementacji Usługi OpenRouter

## 1. Opis Usługi

`OpenRouterService` to klasa TypeScript odpowiedzialna za enkapsulację logiki interakcji z API OpenRouter. Jej głównym celem jest uproszczenie procesu wysyłania żądań uzupełniania czatu do różnych modeli LLM dostępnych przez OpenRouter, w tym obsługę komunikatów systemowych, użytkownika, formatowania odpowiedzi JSON oraz zarządzanie parametrami modelu i błędami. Usługa ta będzie działać po stronie serwera (np. w ramach Astro API routes lub Supabase Functions), aby chronić klucz API.

## 2. Opis Konstruktora

Konstruktor `OpenRouterService` inicjalizuje usługę, ładując konfigurację, w szczególności klucz API OpenRouter.

```typescript
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema'; // Założenie: biblioteka do konwersji schematów Zod na JSON Schema

// Definicja typów dla uproszczenia
type Message = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

type ResponseFormat = {
  type: 'json_schema';
  json_schema: {
    name: string;
    strict?: boolean;
    schema: object; // JSON Schema object
  };
};

interface OpenRouterServiceConfig {
  apiKey: string;
  defaultModel?: string;
  baseUrl?: string;
}

interface ChatCompletionParams {
  model?: string;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  // Inne parametry API OpenRouter...
}

interface ChatCompletionOptions {
  systemPrompt?: string;
  responseSchema?: z.ZodTypeAny; // Opcjonalny schemat Zod dla odpowiedzi JSON
  params?: ChatCompletionParams;
}

export class OpenRouterService {
  private readonly apiKey: string;
  private readonly defaultModel: string;
  private readonly baseUrl: string;

  constructor(config: OpenRouterServiceConfig) {
    if (!config.apiKey) {
      throw new Error("OpenRouter API key is required.");
    }
    this.apiKey = config.apiKey;
    this.defaultModel = config.defaultModel || 'anthropic/claude-3.5-sonnet'; // Przykładowy domyślny model
    this.baseUrl = config.baseUrl || 'https://openrouter.ai/api/v1';

    // Inicjalizacja np. klienta HTTP, jeśli jest używany
  }

  // ... metody publiczne i prywatne
}
```

**Konfiguracja:** Klucz API (`apiKey`) jest wymagany i powinien być ładowany z bezpiecznego źródła OPENROUTER_API_KEY z .env. `defaultModel` i `baseUrl` są opcjonalne.

## 3. Publiczne Metody i Pola

### Metody

*   `async completeChat(userPrompt: string, options?: ChatCompletionOptions): Promise<string | object>`: Główna metoda do wysyłania żądania uzupełnienia czatu.
    *   `userPrompt`: Tekst wiadomości od użytkownika.
    *   `options` (opcjonalne): Obiekt zawierający:
        *   `systemPrompt`: Wiadomość systemowa do ustawienia kontekstu dla modelu.
        *   `responseSchema`: Schemat Zod definiujący oczekiwaną strukturę odpowiedzi JSON. Jeśli podany, usługa zażąda formatu JSON od API i spróbuje sparsować/zwalidować odpowiedź.
        *   `params`: Obiekt z parametrami do nadpisania domyślnych wartości (np. `model`, `temperature`, `max_tokens`).
    *   **Zwraca:** `Promise` rozwiązujący się do tekstu odpowiedzi (jeśli `responseSchema` nie jest podane) lub obiektu JavaScript zgodnego ze schematem (jeśli `responseSchema` jest podane). Rzuca błąd w przypadku niepowodzenia.

### Pola

Brak publicznych pól (enkapsulacja).

## 4. Prywatne Metody i Pola

### Metody

*   `private buildMessages(userPrompt: string, systemPrompt?: string): Message[]`: Tworzy tablicę `messages` dla API na podstawie promptów.
*   `private buildResponseFormat(schema: z.ZodTypeAny): ResponseFormat | undefined`: Generuje obiekt `response_format` dla API na podstawie schematu Zod. Wymaga biblioteki jak `zod-to-json-schema`.
*   `private async makeApiCall(payload: object): Promise<any>`: Wykonuje rzeczywiste wywołanie `fetch` do API OpenRouter, obsługuje nagłówki autoryzacji i podstawową obsługę odpowiedzi HTTP.
*   `private parseApiResponse(response: any, schema?: z.ZodTypeAny): string | object`: Parsuje odpowiedź API, ekstrahuje treść i waliduje JSON względem schematu, jeśli jest wymagany.

### Pola

*   `private readonly apiKey: string;`
*   `private readonly defaultModel: string;`
*   `private readonly baseUrl: string;`
*   `private httpClient;` // Opcjonalnie, instancja klienta HTTP (np. skonfigurowany fetch)

## 5. Obsługa Błędów

Usługa powinna implementować robustną obsługę błędów, obejmującą:

1.  **Błędy Konfiguracji:** Rzucanie błędu w konstruktorze, jeśli brakuje klucza API.
2.  **Błędy Sieciowe:** Użycie `try-catch` wokół wywołań `fetch` do obsługi problemów z połączeniem, timeoutów. Logowanie błędów.
3.  **Błędy API OpenRouter:**
    *   Sprawdzanie statusu odpowiedzi HTTP (`response.ok`).
    *   Parsowanie ciała odpowiedzi błędu (często JSON z polem `error`), jeśli status wskazuje na błąd (4xx, 5xx).
    *   Mapowanie kodów statusu (401, 403, 429, 400, 5xx) na specyficzne, zrozumiałe błędy rzucane przez usługę (np. `AuthenticationError`, `RateLimitError`, `InvalidRequestError`, `OpenRouterError`).
    *   Implementacja logiki ponawiania prób z exponential backoff dla błędów 429 (Too Many Requests), jeśli to konieczne.
4.  **Błędy Parsowania/Walidacji Odpowiedzi:** Użycie `try-catch` podczas parsowania JSON (`response.json()`). Jeśli używany jest `responseSchema` (Zod), użycie `schema.safeParse()` do walidacji i obsługa `success: false` jako błędu walidacji. Rzucanie `ValidationError` lub podobnego błędu.
5.  **Błędy Wewnętrzne:** Ogólne bloki `try-catch` w metodach publicznych do łapania nieoczekiwanych wyjątków.

**Logowanie:** Wszystkie błędy powinny być logowane po stronie serwera z odpowiednim kontekstem (np. użyty model, część parametrów żądania - bez wrażliwych danych).

## 6. Kwestie Bezpieczeństwa

1.  **Zarządzanie Kluczem API:** Klucz API OpenRouter MUSI być przechowywany bezpiecznie jako zmienna środowiskowa po stronie serwera (np. `.env` w Astro dla trybu SSR/API routes, Supabase Secrets dla Functions). NIGDY nie może być ujawniony w kodzie front-endowym ani w repozytorium kodu.
2.  **Walidacja Wejścia:** Chociaż OpenRouter wykonuje własną walidację, warto rozważyć podstawową walidację danych wejściowych (np. długość promptów) po stronie serwera, aby zapobiec niepotrzebnym wywołaniom API i potencjalnym atakom.

### W dalszym etapie developmentu - pomijamy w MVP

3.  **Ochrona przed Nadużyciami:** Implementacja rate limitingu po stronie własnej aplikacji (np. na poziomie API route w Astro lub funkcji Supabase), aby ograniczyć liczbę żądań od pojedynczego użytkownika/IP. (Opcjonalne)
4.  **Kontrola Kosztów:** Monitorowanie użycia API OpenRouter. Rozważenie ustawienia limitów w panelu OpenRouter. Umożliwienie konfiguracji `max_tokens` w usłudze może pomóc w kontroli kosztów pojedynczego wywołania.
5.  **Sanityzacja Wyjścia:** Jeśli odpowiedź LLM ma być bezpośrednio wyświetlana użytkownikom (szczególnie w formacie HTML), należy ją odpowiednio zsanitizować, aby zapobiec atakom XSS. Dotyczy to głównie odpowiedzi tekstowych, nie JSON.

## 7. Plan Wdrożenia Krok po Kroku

Przyjęty stack: Astro (z API Routes lub SSR), TypeScript, Supabase (potencjalnie dla zmiennych środowiskowych).

1.  **Analiza wymagań i konfiguracja projektu**
    * Zapoznać się z dokumentacją API OpenRouter.
    * Upewnić się, że wszystkie zależności (Astro, TypeScript, React, Tailwind, Shadcn/ui) są poprawnie skonfigurowane.
2.  **Struktura Projektu:**
    *   Utwórz plik dla usługi: `src/lib/services/openrouter.service.ts`.
    *   Jeśli potrzebne są dedykowane typy, rozważ `src/types.ts` lub lokalne typy w pliku usługi.
3.  **Instalacja Zależności:**
    *   Jeśli planujesz używać Zod do walidacji schematów: `npm install zod`
    *   Jeśli planujesz używać biblioteki do konwersji Zod na JSON Schema: `npm install zod-to-json-schema`
4.  **Implementacja Klasy `OpenRouterService`:**
    *   Zaimplementuj klasę `OpenRouterService` w `src/lib/services/openrouter.service.ts` zgodnie z opisem w sekcjach 2, 3 i 4.
    *   Zaimplementuj logikę ładowania `apiKey` z `import.meta.env.OPENROUTER_API_KEY` (Astro) lub `Deno.env.get('OPENROUTER_API_KEY')` (Supabase Functions).
    *   Zaimplementuj metody `buildMessages`, `buildResponseFormat` (używając `zod-to-json-schema`), `makeApiCall` (używając globalnego `fetch`), `parseApiResponse` (z walidacją Zod `safeParse`, jeśli dotyczy).
    *   Zaimplementuj publiczne metody `completeChat` koordynując wywołania metod prywatnych.
    *   Dodaj szczegółową obsługę błędów i logowanie (używając np. `console.error`).
5.  **Integracja `OpenRouterService` z `AnalysisService`:**
    *   Zmodyfikuj plik `src/lib/services/analysis.service.ts`.
    *   W konstruktorze `AnalysisService` lub w miejscu jej tworzenia (np. w API route), utwórz instancję `OpenRouterService`, przekazując klucz API odczytany ze zmiennych środowiskowych:
        ```typescript
        // Przykład w miejscu tworzenia AnalysisService (np. w API route)
        import { OpenRouterService } from './openrouter.service';
        import { AnalysisService } from './analysis.service';
        // ...
        const openRouterApiKey = import.meta.env.OPENROUTER_API_KEY; // lub Deno.env.get(...)
        if (!openRouterApiKey) {
          throw new Error("Missing OPENROUTER_API_KEY environment variable");
        }
        const openRouterService = new OpenRouterService({ apiKey: openRouterApiKey });
        const analysisService = new AnalysisService(locals.supabase, openRouterService); // Przekaż instancję
        ```
    *   Zmodyfikuj metodę `createAnalysis` w `AnalysisService`:
        *   Po zapisaniu dokumentu i rekordu analizy (lub w odpowiednim momencie przepływu), przygotuj dane wejściowe dla `OpenRouterService` (np. prompt systemowy, prompt użytkownika z `command.text_content`, opcjonalnie schemat odpowiedzi Zod dla strukturyzowanych danych wyjściowych - np. listy znalezionych problemów GDPR).
        *   Wywołaj metodę `openRouterService.completeChat(...)` wewnątrz `try-catch`, przekazując przygotowane dane.
        *   Przetwórz odpowiedź z `OpenRouterService`:
            *   Sparsuj odpowiedź (tekstową lub JSON).
            *   Jeśli odpowiedź zawiera ustrukturyzowane dane (np. listę problemów), zwaliduj je (np. używając schematu Zod).
            *   Przekształć wyniki z LLM na format `AnalysisIssue[]`.
        *   Zamiast tworzyć `mockIssues`, zapisz przetworzone problemy (`AnalysisIssue`) do bazy danych (`analysis_issues`).
        *   Zaktualizuj status analizy (`Analysis`) w bazie danych na `completed` lub `failed` w zależności od wyniku operacji z OpenRouter.
        *   Zwróć `CreateAnalysisResponseDTO` zawierające rzeczywiste dane i problemy zwrócone przez LLM.
    *   Obsłuż błędy zwracane przez `OpenRouterService` w `AnalysisService` (np. błędy API, walidacji) i odpowiednio zarządzaj stanem analizy (np. ustawiając `status: 'failed'` i zapisując `error_message`).



Ten plan zapewnia kompleksowe podejście do wdrożenia usługi `OpenRouterService` w ramach podanego stosu technologicznego, uwzględniając kluczowe aspekty funkcjonalne, obsługę błędów i bezpieczeństwo.
