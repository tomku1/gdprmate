# Plan implementacji widoku Historii Analiz

## 1. Przegląd
Widok "Historia analiz" jest częścią panelu użytkownika (`/dashboard`) dostępną pod adresem `/dashboard?tab=history`. Jego głównym celem jest umożliwienie zalogowanym użytkownikom przeglądania listy przeprowadzonych wcześniej analiz zgodności dokumentów. Widok prezentuje kluczowe informacje o każdej analizie (fragment tekstu, data utworzenia), pozwala na sortowanie listy oraz dynamiczne doładowywanie kolejnych elementów podczas przewijania (infinite scroll). Każdy element listy jest klikalny i prowadzi do szczegółowego widoku danej analizy.

**Uwaga:** Ze względu na obecne ograniczenia API (`GET /api/analyses`), widok w pierwszej wersji **nie będzie** wyświetlał liczby błędów według kategorii dla każdej analizy. Sortowanie będzie zaimplementowane po stronie frontendu, ale faktyczne sortowanie danych przez API wymaga aktualizacji backendu.

## 2. Routing widoku
- **Ścieżka:** `/dashboard`
- **Aktywacja:** Widok jest renderowany, gdy parametr zapytania `tab` ma wartość `history` (tj. `/dashboard?tab=history`). Zakłada się istnienie nadrzędnego komponentu zakładek w `/dashboard`, który zarządza renderowaniem odpowiedniej treści na podstawie parametru `tab`.
- **Dostęp:** Widok dostępny wyłącznie dla zalogowanych użytkowników.

## 3. Struktura komponentów
Komponenty będą tworzone w React i renderowane wewnątrz strony Astro.

```
/dashboard (Astro Page)
  └── TabsComponent (React/Astro - zarządza zakładkami)
      └── AnalysesHistoryView (React - kontener widoku historii)
          ├── SortDropdown (React/Shadcn - wybór sortowania)
          ├── InfiniteScrollList (React - lista z infinite scroll)
          │   ├── HistoryItemCard (React/Shadcn - pojedynczy element historii) [* 0..n]
          │   ├── LoadingSpinner (React/Shadcn - wskaźnik ładowania) [warunkowo]
          │   └── EmptyStateMessage (React/Shadcn - komunikat o braku danych) [warunkowo]
          └── ErrorMessage (React/Shadcn - komunikat błędu API) [warunkowo]
```

## 4. Szczegóły komponentów

### `AnalysesHistoryView`
- **Opis:** Główny komponent kontenera dla widoku historii. Odpowiedzialny za pobieranie danych z API, zarządzanie stanem (lista analiz, paginacja, sortowanie, status ładowania, błędy) przy użyciu hooka `useAnalysesHistory` oraz renderowanie komponentów podrzędnych (`SortDropdown`, `InfiniteScrollList`, `ErrorMessage`). Powinien sprawdzać status autentykacji (chociaż główna logika dostępu powinna być w nadrzędnym komponencie/layoutcie).
- **Główne elementy:** Div kontenera, renderuje `SortDropdown`, `InfiniteScrollList`, `ErrorMessage`.
- **Obsługiwane interakcje:** Brak bezpośrednich, orkiestruje interakcje dzieci przez przekazane funkcje (np. zmiana sortowania, ładowanie więcej).
- **Obsługiwana walidacja:** Sprawdzenie, czy użytkownik jest zalogowany (delegowane do hooka/rodzica).
- **Typy:** `AnalysisHistoryItemViewModel[]`, `PaginationDTO`, `SortOption`, `string | null` (dla błędu).
- **Propsy:** Brak (pobiera dane i zarządza stanem wewnętrznie za pomocą hooka).

### `SortDropdown`
- **Opis:** Komponent oparty na `Select` z Shadcn/ui, pozwalający użytkownikowi wybrać sposób sortowania listy analiz (np. "Data - Najnowsze", "Data - Najstarsze").
- **Główne elementy:** `Select`, `SelectTrigger`, `SelectContent`, `SelectItem` (z Shadcn/ui).
- **Obsługiwane interakcje:** Wybór opcji sortowania.
- **Obsługiwana walidacja:** Brak specyficznej.
- **Typy:** `SortOption[]` (dla opcji), `string` (dla wybranej wartości).
- **Propsy:**
    - `options: SortOption[]`: Lista dostępnych opcji sortowania.
    - `value: string`: Aktualnie wybrana wartość sortowania.
    - `onChange: (value: string) => void`: Funkcja zwrotna wywoływana przy zmianie wyboru.
    - `disabled?: boolean`: Opcjonalne wyłączenie kontrolki (np. podczas ładowania).

### `InfiniteScrollList`
- **Opis:** Komponent renderujący listę analiz (`HistoryItemCard`). Implementuje mechanizm "infinite scroll" - wykrywa, kiedy użytkownik przewinie listę blisko końca i wywołuje funkcję do załadowania kolejnej strony danych. Wyświetla wskaźnik ładowania podczas pobierania danych oraz komunikat o braku danych, jeśli lista jest pusta.
- **Główne elementy:** Kontener listy (np. `ul` lub `div`), mapowanie `items` na `HistoryItemCard`, `LoadingSpinner`, `EmptyStateMessage`. Wykorzystuje obserwatora przecięcia (Intersection Observer API) lub inną bibliotekę do detekcji scrolla.
- **Obsługiwane interakcje:** Przewijanie listy.
- **Obsługiwana walidacja:** Sprawdza, czy istnieją kolejne strony do załadowania (`pagination.page < pagination.pages`) przed wywołaniem `onLoadMore`.
- **Typy:** `AnalysisHistoryItemViewModel[]`, `PaginationDTO | null`.
- **Propsy:**
    - `items: AnalysisHistoryItemViewModel[]`: Lista elementów do wyświetlenia.
    - `pagination: PaginationDTO | null`: Informacje o paginacji z API.
    - `isLoading: boolean`: Wskazuje, czy trwa ładowanie (kolejnej strony).
    - `isInitialLoading: boolean`: Wskazuje, czy trwa ładowanie *pierwszej* strony.
    - `hasMore: boolean`: Wskazuje, czy są jeszcze dane do załadowania.
    - `onLoadMore: () => void`: Funkcja zwrotna wywoływana, gdy potrzeba załadować więcej danych.
    - `onItemClick: (id: string) => void`: Funkcja zwrotna wywoływana po kliknięciu elementu listy.
    - `emptyStateMessage?: React.ReactNode`: Komponent/tekst do wyświetlenia, gdy `items` jest puste po zakończeniu initial load.
    - `loadingIndicator?: React.ReactNode`: Komponent wskaźnika ładowania.

### `HistoryItemCard
- **Opis:** Komponent reprezentujący pojedynczy wpis w historii analiz. Wyświetla podgląd tekstu analizy i datę jej utworzenia. Jest klikalny, co powoduje nawigację do szczegółów analizy. Używa komponentu `Card` z Shadcn/ui.
- **Główne elementy:** `Card`, `CardHeader`, `CardTitle` (dla daty?), `CardContent` (dla `textPreview`) z Shadcn/ui.
- **Obsługiwane interakcje:** Kliknięcie na kartę.
- **Obsługiwana walidacja:** Brak specyficznej.
- **Typy:** `AnalysisHistoryItemViewModel`.
- **Propsy:**
    - `item: AnalysisHistoryItemViewModel`: Dane analizy do wyświetlenia.
    - `onClick: (id: string) => void`: Funkcja zwrotna wywoływana po kliknięciu karty, przekazująca ID analizy.

### `LoadingSpinner
- **Opis:** Prosty komponent wyświetlający animację ładowania (np. z Shadcn/ui lub niestandardowy).
- **Propsy:** Brak lub opcjonalne propsy do stylizacji/rozmiaru.

### `EmptyStateMessage`
- **Opis:** Komponent wyświetlający informację, gdy lista analiz jest pusta (np. "Brak zapisanych analiz."). Może zawierać ikonę i tekst.
- **Propsy:** `message?: string`, `children?: React.ReactNode`.

### `ErrorMessage`
- **Opis:** Komponent wyświetlający błąd pobierania danych z API (np. przy użyciu `Alert` z Shadcn/ui).
- **Propsy:** `message: string`.

## 5. Typy

### Istniejące typy (z `src/types.ts`)
- `AnalysisSummaryDTO`: DTO zwracane przez API dla pojedynczej analizy w liście.
  ```typescript
  interface AnalysisSummaryDTO {
    id: string;
    text_preview: string;
    status: AnalysisStatus; // Obecnie nieużywane w tym widoku
    detected_language: string; // Obecnie nieużywane w tym widoku
    created_at: string; // ISO string date
  }
  ```
- `PaginationDTO`: DTO zawierające informacje o paginacji.
  ```typescript
  interface PaginationDTO {
    total: number;
    page: number;
    limit: number;
    pages: number;
  }
  ```
- `AnalysisListResponseDTO`: Typ odpowiedzi z API `GET /api/analyses`.
  ```typescript
  interface AnalysisListResponseDTO {
    analyses: AnalysisSummaryDTO[];
    pagination: PaginationDTO;
  }
  ```

### Nowe typy (ViewModel)
- `AnalysisHistoryItemViewModel`: Typ używany przez komponenty frontendowe do reprezentacji elementu historii. Może rozszerzać lub mapować `AnalysisSummaryDTO`.
  ```typescript
  interface AnalysisHistoryItemViewModel {
    id: string;
    textPreview: string; // Zmapowane z text_preview
    createdAt: string; // Zmapowane z created_at, ew. sformatowana data
    // errorCounts: { critical: number; important: number; minor: number }; // USUNIĘTE - brak danych w API
  }
  ```
- `SortOption`: Typ dla opcji sortowania w `SortDropdown`.
  ```typescript
  interface SortOption {
    value: string; // Wartość przekazywana do API, np. 'created_at:desc'
    label: string; // Etykieta wyświetlana użytkownikowi, np. 'Data - Najnowsze'
  }
  ```

## 6. Zarządzanie stanem
Zaleca się stworzenie dedykowanego hooka `useAnalysesHistory` w celu enkapsulacji logiki związanej z pobieraniem danych, paginacją, sortowaniem i obsługą stanu ładowania/błędów dla historii analiz.

- **Hook:** `useAnalysesHistory()`
- **Cel:** Zarządzanie stanem i logiką pobierania danych dla widoku historii.
- **Stan wewnętrzny hooka:**
    - `analyses: AnalysisHistoryItemViewModel[]`
    - `pagination: PaginationDTO | null`
    - `sortValue: string` (np. 'created_at:desc')
    - `isLoading: boolean`
    - `isInitialLoading: boolean`
    - `error: string | null`
- **Zwracane wartości/funkcje:**
    - `analyses`: Aktualna lista analiz.
    - `pagination`: Aktualne informacje o paginacji.
    *   `isLoading`: Czy trwa ładowanie (initial lub more).
    *   `isInitialLoading`: Czy trwa ładowanie pierwszej strony.
    - `error`: Komunikat błędu lub `null`.
    - `hasMore`: Boolean wskazujący, czy są jeszcze strony do załadowania.
    - `loadMoreAnalyses: () => void`: Funkcja do załadowania następnej strony.
    - `setSortValue: (value: string) => void`: Funkcja do ustawienia nowego sortowania (resetuje listę i paginację, pobiera stronę 1).
    - `retryFetch: () => void`: Funkcja do ponowienia ostatniego nieudanego zapytania.
- **Użycie:** Komponent `AnalysesHistoryView` wywołuje ten hook, aby uzyskać dostęp do danych i funkcji zarządzających.

## 7. Integracja API

- **Endpoint:** `GET /api/analyses`
- **Metoda:** `GET`
- **Autentykacja:** Wymagana (przez mechanizm sesji/tokenu obsługiwany przez Astro/Supabase middleware).
- **Parametry zapytania:**
    - `page` (integer, opcjonalny): Numer strony (domyślnie 1).
    - `limit` (integer, opcjonalny): Liczba elementów na stronę (np. 10 lub 20).
    - `sort` (string, opcjonalny): Pole do sortowania (np. `created_at`). **Uwaga: Obecnie ignorowane przez API.**
    - `order` (string, opcjonalny): Kierunek sortowania (`asc` lub `desc`). **Uwaga: Obecnie ignorowane przez API.**
- **Typy:**
    - **Żądanie:** Brak ciała (parametry w URL).
    - **Odpowiedź sukces (200 OK):** `AnalysisListResponseDTO`
      ```json
      {
        "analyses": [
          {
            "id": "uuid",
            "text_preview": "First 100 characters...",
            "status": "completed", // Przykład
            "detected_language": "pl",
            "created_at": "2023-06-01T12:00:00Z"
          }
          // ... inne analizy
        ],
        "pagination": {
          "total": 50,
          "page": 1,
          "limit": 10,
          "pages": 5
        }
      }
      ```
    - **Odpowiedź błąd (401 Unauthorized):** Użytkownik niezalogowany.
    - **Odpowiedź błąd (500 Internal Server Error):** Błąd serwera.
- **Logika:** Hook `useAnalysesHistory` będzie odpowiedzialny za konstruowanie URL z odpowiednimi parametrami (`page`, `limit`, `sort`, `order`) i wykonywanie zapytań `fetch`. Będzie obsługiwał odpowiedzi sukcesu (aktualizując stan `analyses` i `pagination`) oraz błędy (ustawiając stan `error`).

## 8. Interakcje użytkownika
- **Wejście na widok:** System (hook `useAnalysesHistory`) automatycznie pobiera pierwszą stronę analiz posortowanych domyślnie (wg `created_at` malejąco). Wyświetlany jest wskaźnik ładowania.
- **Przewijanie listy w dół:** Gdy użytkownik zbliży się do końca listy, komponent `InfiniteScrollList` wywołuje `loadMoreAnalyses` z hooka. System pobiera kolejną stronę danych i dodaje je do istniejącej listy. Wyświetlany jest wskaźnik ładowania na końcu listy podczas pobierania.
- **Zmiana sortowania:** Użytkownik wybiera nową opcję w `SortDropdown`. Komponent wywołuje `setSortValue` z hooka. Hook resetuje listę, ustawia `page` na 1 i pobiera pierwszą stronę danych z nowymi parametrami sortowania. Wyświetlany jest wskaźnik ładowania dla całej listy.
- **Kliknięcie elementu historii:** Użytkownik klika na `HistoryItemCard`. Komponent wywołuje `onItemClick` przekazane z `InfiniteScrollList`. `AnalysesHistoryView` (lub `InfiniteScrollList`) obsługuje nawigację do strony szczegółów analizy, np. `/dashboard/analyses/[id]`, gdzie `[id]` to ID klikniętej analizy.
- **Błąd ładowania danych:** Jeśli API zwróci błąd, hook `useAnalysesHistory` ustawi stan `error`. Komponent `AnalysesHistoryView` wyświetli `ErrorMessage` z odpowiednim komunikatem.

## 9. Warunki i walidacja
- **Dostęp do widoku:** Tylko dla zalogowanych użytkowników (walidacja na poziomie routingu/layoutu lub na wejściu do `AnalysesHistoryView`).
- **Ładowanie "więcej":** Mechanizm infinite scroll (`InfiniteScrollList`) powinien wywoływać `onLoadMore` tylko wtedy, gdy `isLoading` jest `false` oraz `hasMore` (obliczone na podstawie `pagination.page < pagination.pages`) jest `true`.
- **Pusta lista:** Po załadowaniu pierwszej strony, jeśli `analyses` jest pusty, `InfiniteScrollList` powinien wyświetlić `EmptyStateMessage`.
- **Sortowanie:** `SortDropdown` powinien być wyłączony (`disabled=true`), gdy `isLoading` jest `true`.

## 10. Obsługa błędów
- **Błąd 401 Unauthorized:** Hook `useAnalysesHistory` powinien przechwycić ten błąd. Może ustawić stan `error` z komunikatem "Wymagane logowanie" lub wywołać globalną funkcję wylogowania/przekierowania na stronę logowania.
- **Błąd 500 Internal Server Error / Błąd sieci:** Hook `useAnalysesHistory` ustawia stan `error` z generycznym komunikatem, np. "Wystąpił błąd podczas ładowania historii analiz. Spróbuj ponownie później.". Komponent `AnalysesHistoryView` wyświetla `ErrorMessage`. Opcjonalnie można dodać przycisk "Spróbuj ponownie", który wywołałby funkcję `retryFetch` z hooka.
- **Pusta odpowiedź (200 OK, brak analiz):** Nie jest to błąd. Stan `analyses` będzie pusty, a `EmptyStateMessage` zostanie wyświetlony przez `InfiniteScrollList`.

## 11. Kroki implementacji
1.  **Utworzenie struktury plików:** Stwórz pliki dla komponentów React: `AnalysesHistoryView.tsx`, `SortDropdown.tsx`, `InfiniteScrollList.tsx`, `HistoryItemCard.tsx` w odpowiednim katalogu (np. `src/components/dashboard/history/`). Utwórz plik dla hooka: `useAnalysesHistory.ts` (np. `src/hooks/`).
2.  **Zdefiniowanie typów:** Zdefiniuj nowe typy `AnalysisHistoryItemViewModel` i `SortOption` w `src/types.ts` lub w dedykowanym pliku dla typów tego widoku.
3.  **Implementacja hooka `useAnalysesHistory`:**
    *   Zaimplementuj logikę stanu (useState dla `analyses`, `pagination`, `sortValue`, `isLoading`, `isInitialLoading`, `error`).
    *   Stwórz funkcję `fetchAnalyses(page, limit, sort, order)` wykorzystującą `fetch` do komunikacji z `GET /api/analyses`.
    *   Zaimplementuj funkcje `loadMoreAnalyses`, `setSortValue`, `retryFetch`.
    *   Obsłuż mapowanie `AnalysisSummaryDTO` na `AnalysisHistoryItemViewModel`.
    *   Obsłuż stany ładowania i błędy.
    *   Zwróć wymagane stany i funkcje.
4.  **Implementacja komponentu `HistoryItemCard`:**
    *   Stwórz komponent przyjmujący `item: AnalysisHistoryItemViewModel` i `onClick`.
    *   Użyj komponentów Shadcn (`Card`, `CardContent` etc.) do wyświetlenia `textPreview` i `createdAt` (sformatuj datę).
    *   Obsłuż zdarzenie `onClick`, wywołując przekazaną funkcję z `item.id`.
5.  **Implementacja komponentu `SortDropdown`:**
    *   Stwórz komponent przyjmujący `options`, `value`, `onChange`, `disabled`.
    *   Użyj komponentu `Select` z Shadcn/ui.
    *   Przekaż wybraną wartość do `onChange`.
6.  **Implementacja komponentu `InfiniteScrollList`:**
    *   Stwórz komponent przyjmujący propsy ( `items`, `pagination`, `isLoading`, etc.).
    *   Zaimplementuj logikę infinite scroll (np. z Intersection Observer). Wywołuj `onLoadMore`, gdy użytkownik zbliży się do końca listy i `hasMore` jest true.
    *   Renderuj listę `HistoryItemCard`, przekazując `item` i `onItemClick`.
    *   Warunkowo renderuj `LoadingSpinner` i `EmptyStateMessage`.
7.  **Implementacja komponentu `AnalysesHistoryView`:**
    *   Użyj hooka `useAnalysesHistory` do pobrania danych i funkcji.
    *   Zdefiniuj opcje sortowania (`SortOption[]`).
    *   Zaimplementuj logikę nawigacji `handleItemClick`.
    *   Renderuj `SortDropdown`, `InfiniteScrollList` (przekazując odpowiednie propsy i funkcje zwrotne) oraz `ErrorMessage` (jeśli `error` nie jest `null`).
8.  **Integracja z Astro (`/dashboard`):**
    *   Upewnij się, że strona Astro `/dashboard` renderuje komponent React (`AnalysesHistoryView` lub nadrzędny `TabsComponent`) z odpowiednim `client:load` lub `client:visible`.
    *   Zaimplementuj logikę przełączania zakładek na podstawie parametru `?tab=` w URL.
    *   Dodaj obsługę routingu dla strony szczegółów analizy (np. `/dashboard/analyses/[id].astro`).
9.  **Testowanie:**
    *   Napisz testy jednostkowe dla hooka `useAnalysesHistory` (mockując `fetch`).
    *   Napisz testy komponentów React (`SortDropdown`, `HistoryItemCard`, `InfiniteScrollList`) przy użyciu React Testing Library.
    *   Napisz testy E2E (Playwright) symulujące interakcje użytkownika (ładowanie, scroll, sortowanie, klikanie).
10. **Styling i RWD:** Dopracuj style przy użyciu Tailwind CSS, upewniając się, że widok jest responsywny.
11. **Dostępność (A11y):** Dodaj odpowiednie atrybuty ARIA do listy i elementów interaktywnych.
12. **Dokumentacja:** Zaktualizuj dokumentację (jeśli istnieje), opisując nowy widok i jego komponenty. Utwórz ticket dla backendu dotyczący implementacji sortowania i dodania liczby błędów do API. 