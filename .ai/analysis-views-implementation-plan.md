# Plan implementacji widoków analizy (Nowa Analiza i Szczegóły Analizy)

## 1. Przegląd
Plan opisuje implementację dwóch powiązanych widoków w aplikacji GdprMate:
1.  **Widok Nowej Analizy** (`/dashboard`): Umożliwia użytkownikom wprowadzenie tekstu (np. klauzuli informacyjnej) i zainicjowanie analizy zgodności z GDPR. Dostępny również dla niezalogowanych użytkowników, ale z ograniczeniami.
2.  **Widok Szczegółów Analizy** (`/analyses/:id`): Wyświetla wyniki przeprowadzonej analizy, w tym listę zidentyfikowanych problemów (błędów/braków), ich kategorie oraz sugerowane poprawki. Umożliwia filtrowanie problemów. Dla niezalogowanych użytkowników pokazuje ograniczoną liczbę problemów.

Implementacja będzie zgodna z dostarczonymi wymaganiami (PRD), historyjkami użytkowników, opisem API i stackiem technologicznym (Astro, React, TypeScript, Tailwind, Shadcn/ui).

**Uwaga:** Interakcje użytkownika z sugestiami (np. kopiowanie, odrzucanie) nie są częścią tego planu implementacji i zostaną opisane w osobnym dokumencie.

## 2. Routing widoku
- **Nowa Analiza**: Dostępny pod ścieżką `/dashboard`. Dostęp publiczny, ale z ograniczeniami dla niezalogowanych użytkowników.
- **Szczegóły Analizy**: Dostępny pod dynamiczną ścieżką `/analyses/:id`, gdzie `:id` to UUID analizy. Dostęp publiczny, ale niezalogowani użytkownicy widzą tylko ograniczoną liczbę problemów (2 pierwsze).

## 3. Struktura komponentów

```
- src/pages/dashboard.astro             # Strona Astro hostująca komponent
  - NewAnalysisForm                    # Główny komponent formularza nowej analizy
    - TextAreaWithCounter              # Komponent pola tekstowego z licznikiem znaków
    - AnalyseButton                    # Przycisk uruchamiający analizę
    - SpinnerOverlay                   # Nakładka z loaderem podczas analizy

- src/pages/analyses/[id].astro         # Strona Astro hostująca komponent
  - AnalysisDetailsView                # Główny komponent widoku szczegółów analizy
    - DocumentViewer                   # Wyświetla pełny tekst analizy i metadane
      - LanguageBadge                  # Wyświetla wykryty język dokumentu
    - FilterControls                   # Kontrolki do filtrowania listy problemów
    - IssuesList                       # Lista problemów z obsługą paginacji/infinite scroll
      - IssueCard                      # Karta pojedynczego problemu
        - CategoryBadge                # Badge wizualnie oznaczający kategorię problemu

- src/lib/services/
  - temporary-analysis.service.ts      # Serwis do zarządzania tymczasowymi analizami w sessionStorage
```

## 4. Szczegóły komponentów

### `NewAnalysisForm`
- **Opis:** Kontener formularza do tworzenia nowej analizy. Zarządza stanem wprowadzania tekstu, walidacją, stanem ładowania i komunikacją z API (`POST /api/analyses`). Po pomyślnym utworzeniu analiz przekierowuje na `/analyses/:id`. Dla niezalogowanych użytkowników zapisuje analizę w sessionStorage.
- **Główne elementy:** TextAreaWithCounter, AnalyseButton, SpinnerOverlay, komunikaty błędów walidacji i API.
- **Interakcje:** Wprowadzanie tekstu, kliknięcie przycisku analizy.
- **Walidacja:** Tekst nie może być pusty i nie może przekraczać limitu znaków (50 000 dla zalogowanych, 1 000 dla niezalogowanych). Wyświetla błędy API (400, 413).
- **Typy:** DTO: CreateAnalysisCommand. ViewModel: NewAnalysisFormState { text: string; isLoading: boolean; error: string | null; validationError: string | null }.
- **Propsy:** Brak.

### `TextAreaWithCounter`
- **Opis:** Pole tekstowe (`<textarea>`) z licznikiem znaków, informuje o bieżącej i maksymalnej długości.
- **Główne elementy:** textarea, div/span z licznikiem (`aktualna_długość / max_długość`).
- **Interakcje:** onChange.
- **Walidacja:** Wskazanie przekroczenia limitu, wymuszenie maxLength.
- **Typy:** Props: { value: string; onChange: (newValue: string) => void; maxLength: number; minLength: number; placeholder?: string; 'aria-label'?: string }.
- **Propsy:** value, onChange, maxLength, minLength, placeholder, aria-label.

### `AnalyseButton`
- **Opis:** Przycisk inicjujący analizę; stan zależy od walidacji i isLoading; pokazuje wskaźnik ładowania.
- **Główne elementy:** button, ikona spinnera (opcjonalnie).
- **Interakcje:** onClick.
- **Walidacja:** disabled kontrolowany przez validationError i isLoading.
- **Typy:** Props: { onClick: () => void; disabled: boolean; isLoading: boolean }.
- **Propsy:** onClick, disabled, isLoading.

### `SpinnerOverlay`
- **Opis:** Półprzezroczysta nakładka z animacją ładowania podczas isLoading.
- **Główne elementy:** div nakładki, spinner.
- **Interakcje:** —
- **Typy:** Props: { isLoading: boolean }.
- **Propsy:** isLoading.

### `AnalysisDetailsView`
- **Opis:** Kontener widoku szczegółów; pobiera dane (najpierw sprawdzając sessionStorage, potem `GET /api/analyses/:id`), zarządza ładowaniem, błędami, filtrowaniem i paginacją. Dla niezalogowanych pokazuje tylko 2 pierwsze problemy.
- **Główne elementy:** DocumentViewer, FilterControls, IssuesList, AuthNoticeAlert (dla niezalogowanych).
- **Interakcje:** Zmiana filtrów, ładowanie kolejnych stron problemów (tylko dla zalogowanych).
- **Walidacja:** Obsługa kodów API (200, 401, 403, 404, 500).
- **Typy:** DTO: AnalysisDetailsDTO, IssueDTO, PaginationDTO. ViewModel: AnalysisDetailsState { analysis: AnalysisDetailsDTO | null; isLoading: boolean; error: string | null; selectedFilters: IssueCategory[]; issues: IssueDTO[]; currentIssuePage: number; totalIssuePages: number; isLoadingIssues: boolean }.
- **Propsy:** analysisId: string.

### `DocumentViewer`
- **Opis:** Wyświetla treść dokumentu (text_content) i metadane, w tym język przez LanguageBadge; bez podświetlania problemów.
- **Główne elementy:** div/pre na tekst, LanguageBadge.
- **Interakcje:** —
- **Typy:** DTO: AnalysisDetailsDTO.
- **Propsy:** analysisData: AnalysisDetailsDTO.

### `AuthNoticeAlert`
- **Opis:** Komponent informacyjny dla niezalogowanych użytkowników wyświetlany na widoku szczegółów analizy.
- **Główne elementy:** Alert, tekst informacyjny, przycisk zachęcający do zalogowania.
- **Interakcje:** Przekierowanie do logowania po kliknięciu przycisku.
- **Typy:** Brak propsów.
- **Propsy:** Brak.

### `LanguageBadge`
- **Opis:** Component pokazujący wykryty język dokumentu.
- **Główne elementy:** Badge.
- **Interakcje:** —
- **Typy:** Props: { language: string }.
- **Propsy:** language.

### `FilterControls`
- **Opis:** Kontrolki (Checkbox lub ToggleGroup) do filtrowania problemów według kategorii (critical, important, minor).
- **Główne elementy:** Grupa Checkbox/ToggleGroup.
- **Interakcje:** onFilterChange.
- **Typy:** Props: { availableCategories: IssueCategory[]; selectedCategories: IssueCategory[]; onFilterChange: (newFilters: IssueCategory[]) => void }.
- **Propsy:** availableCategories, selectedCategories, onFilterChange.

### `IssuesList`
- **Opis:** Renderuje listę IssueCard z paginacją lub infinite scroll; pozwala ładować kolejne problemy (tylko dla zalogowanych).
- **Główne elementy:** div listy, IssueCard, przycisk Załaduj więcej lub infinite scroll, wskaźnik ładowania.
- **Interakcje:** onLoadMore.
- **Typy:** DTO: IssueDTO, PaginationDTO. Props: { issues: IssueDTO[]; pagination: PaginationDTO; isLoadingMore: boolean; onLoadMore: () => void }.
- **Propsy:** issues, pagination, isLoadingMore, onLoadMore.

### `IssueCard`
- **Opis:** Wyświetla pojedynczy problem: kategoria (CategoryBadge), description i suggestion; może używać Card lub Accordion.
- **Główne elementy:** Card/Accordion, CategoryBadge, div/p na opis, div/pre na sugestię.
- **Interakcje:** —
- **Typy:** DTO: IssueDTO. Props: { issue: IssueDTO }.
- **Propsy:** issue.

### `CategoryBadge`
- **Opis:** Badge oznaczający kategorię problemu (critical, important, minor) odpowiednim kolorem.
- **Główne elementy:** Badge.
- **Interakcje:** —
- **Typy:** Props: { category: IssueCategory }.
- **Propsy:** category.

### `temporaryAnalysisService`
- **Opis:** Serwis do zarządzania tymczasowymi analizami w sessionStorage dla niezalogowanych użytkowników.
- **Główne metody:**
  - `storeAnalysis(analysis, textContent)`: Zapisuje analizę do sessionStorage.
  - `getAnalysis(id)`: Pobiera analizę z sessionStorage.
  - `isTemporaryAnalysis(id)`: Sprawdza czy analiza jest tymczasowa.
  - `getAllAnalyses()`: Pobiera wszystkie tymczasowe analizy.

## 5. Typy
Implementacja będzie korzystać bezpośrednio z typów DTO zdefiniowanych w `src/types.ts`:
- `CreateAnalysisCommand`: Do wysłania żądania POST.
- `CreateAnalysisResponseDTO`: Otrzymywany po POST, używany do przekierowania.
- `AnalysisDetailsDTO`: Główny typ danych dla widoku szczegółów.
- `IssueDTO`: Typ dla pojedynczego problemu.
- `PaginationDTO`: Typ dla informacji o paginacji (zarówno dla analiz w historii, jak i problemów w szczegółach).
- `IssueCategory`: Enum dla kategorii problemów (`"critical" | "important" | "minor"`).

Dodatkowo, komponenty będą zarządzać swoim stanem wewnętrznym za pomocą prostych typów lub dedykowanych interfejsów stanu (ViewModel):
- `NewAnalysisFormState`: `{ text: string; isLoading: boolean; error: string | null; validationError: string | null }`
- `AnalysisDetailsState`: `{ analysis: AnalysisDetailsDTO | null; isLoading: boolean; error: string | null; selectedFilters: IssueCategory[]; issues: IssueDTO[]; currentIssuePage: number; totalIssuePages: number; isLoadingIssues: boolean; }`

## 6. Zarządzanie stanem
- **`NewAnalysisForm`**: Stan będzie zarządzany lokalnie w komponencie za pomocą hooka `useState` dla `text`, `isLoading`, `error`, `validationError`. Ze względu na prostotę, dedykowany custom hook nie jest konieczny.
- **`AnalysisDetailsView`**: Ze względu na większą złożoność (pobieranie danych analizy, zarządzanie listą problemów, filtrowanie, paginacja, stany ładowania i błędów), zalecane jest stworzenie customowego hooka, np. `useAnalysisDetails(analysisId: string)`. Hook ten enkapsulowałby logikę sprawdzania sessionStorage, pobierania danych z API (`GET /api/analyses/:id` z różnymi parametrami query), zarządzanie stanem (`AnalysisDetailsState`) i udostępniałby dane oraz funkcje do interakcji (np. `loadMoreIssues`, `setFilters`) komponentowi `AnalysisDetailsView`.

## 7. Integracja API
- **Tworzenie analizy:** Komponent `NewAnalysisForm` wywoła `fetch` (lub inną bibliotekę HTTP) z metodą `POST` na endpoint `/api/analyses`.
    - **Żądanie:** `Content-Type: application/json`, Body: `CreateAnalysisCommand` (`{ "text_content": string }`). Autoryzacja opcjonalna.
    - **Odpowiedź (Sukces 201):** 
      - Dla zalogowanych: Standardowa odpowiedź `CreateAnalysisResponseDTO`. 
      - Dla niezalogowanych: Rozszerzona odpowiedź z polami `text_content` i `is_temporary: true`. Tymczasowa analiza jest zapisywana w sessionStorage przy użyciu `temporaryAnalysisService`.
    - **Odpowiedź (Błąd):** Obsługa statusów 400, 413 (błędy walidacji), 401 (przekierowanie do logowania), 500 (ogólny błąd serwera).
- **Pobieranie szczegółów analizy:** Custom hook `useAnalysisDetails` najpierw sprawdza sessionStorage używając `temporaryAnalysisService`, a jeśli nie znajdzie analizy, wykonuje `GET` na endpoint `/api/analyses/:id`.
    - **Żądanie:** Autoryzacja opcjonalna. Opcjonalne parametry query: `page`, `limit`, `category` (do paginacji i filtrowania problemów `issues`).
    - **Odpowiedź (Sukces 200):** `AnalysisDetailsDTO`. Zawiera pełne dane analizy, w tym cały tekst (`text_content`) oraz pierwszą stronę listy problemów (`issues`) wraz z informacjami o paginacji (`issues_pagination`). Dane zostaną zapisane w stanie komponentu/hooka. Dla niezalogowanych użytkowników lista problemów jest ograniczona do 2 pierwszych.
    - **Odpowiedź (Błąd):** Obsługa statusów 401 (przekierowanie), 403 (brak dostępu), 404 (nie znaleziono), 500 (błąd serwera).

## 8. Interakcje użytkownika
- **Wpisywanie tekstu:** Aktualizacja stanu `text` w `NewAnalysisForm`, aktualizacja licznika znaków, dynamiczna walidacja i zmiana stanu `AnalyseButton`.
- **Kliknięcie "Analizuj":** Wywołanie `POST /api/analyses`, pokazanie `SpinnerOverlay`, obsługa odpowiedzi (przekierowanie lub błąd). Dla niezalogowanych użytkowników zapisanie analizy w sessionStorage.
- **Zmiana filtrów:** Aktualizacja stanu `selectedFilters` w `AnalysisDetailsView`, filtrowanie problemów (bezpośrednio w przypadku tymczasowych analiz z sessionStorage lub wywołanie API dla trwałych analiz).
- **Ładowanie kolejnych problemów:** (Infinite scroll lub przycisk) Tylko dla zalogowanych użytkowników. Wywołanie `GET /api/analyses/:id` z parametrem `page`, dołączenie nowych problemów do `IssuesList`, aktualizacja stanu paginacji.

## 9. Warunki i walidacja
- **Formularz Nowej Analizy (`NewAnalysisForm`):**
    - Warunek: `text.length > 0` ORAZ `text.length <= 50000` (dla zalogowanych) lub `text.length <= 1000` (dla niezalogowanych).
    - Weryfikacja: W komponencie, przed wysłaniem żądania.
    - Wpływ na UI: Stan `disabled` komponentu `AnalyseButton`, ewentualne komunikaty walidacyjne przy `TextAreaWithCounter`. Walidacja jest też po stronie API (400, 413).
- **Dostęp do Szczegółów Analizy (`AnalysisDetailsView`):**
    - Warunek: Dla analiz z bazy danych - użytkownik musi być właścicielem analizy o danym `:id`. Dla tymczasowych analiz - analiza musi istnieć w sessionStorage.
    - Weryfikacja: Po stronie API dla analiz z bazy danych (zwraca 401 lub 403) lub przez `temporaryAnalysisService` dla tymczasowych analiz.
    - Wpływ na UI: Przekierowanie na `/login` (dla 401) lub wyświetlenie komunikatu o braku dostępu (dla 403) lub nie znaleziono analizy (dla nieistniejących analiz).
- **Paginacja Problemów (`IssuesList`):**
    - Warunek: Użytkownik zalogowany ORAZ `currentPage < totalPages`.
    - Weryfikacja: W komponencie `IssuesList` lub hooku `useAnalysisDetails` na podstawie `pagination` z API.
    - Wpływ na UI: Widoczność/aktywność przycisku "Załaduj więcej" lub działanie infinite scroll. Dla niezalogowanych użytkowników brak paginacji (maksymalnie 2 problemy).

## 10. Obsługa błędów
- **Błędy walidacji (Frontend):** Komunikaty wyświetlane bezpośrednio przy polu `TextAreaWithCounter` w `NewAnalysisForm`.
- **Błędy API (4xx, 5xx):**
    - **400, 413 (POST /api/analyses):** Wyświetlenie komunikatu o błędzie walidacji w `NewAnalysisForm`.
    - **401 (Wszystkie endpointy):** Globalna obsługa - przekierowanie do strony logowania (`/login`).
    - **403 (GET /api/analyses/:id):** Wyświetlenie dedykowanego komunikatu "Brak dostępu do tej analizy" w `AnalysisDetailsView`.
    - **404 (GET /api/analyses/:id):** Wyświetlenie dedykowanego komunikatu "Nie znaleziono analizy" w `AnalysisDetailsView`.
    - **500 (Wszystkie endpointy):** Wyświetlenie ogólnego komunikatu o błędzie serwera (np. "Wystąpił nieoczekiwany błąd. Spróbuj ponownie później.") za pomocą globalnego systemu powiadomień (Toast) lub w obszarze danego widoku.
- **Błędy sieciowe / Fetch API:** Obsługa błędów w bloku `catch` przy wywołaniach `fetch`, wyświetlenie ogólnego komunikatu o problemie z połączeniem.
- **Stany ładowania:** Użycie komponentu `SpinnerOverlay` lub innych wskaźników ładowania (np. w przyciskach, w `IssuesList`) do informowania użytkownika o trwających operacjach.
- **Puste stany:** Wyświetlanie odpowiednich komunikatów, gdy lista problemów jest pusta (np. "Brak problemów do wyświetlenia dla wybranych filtrów" w `IssuesList`).

## 11. Kroki implementacji
1.  **Utworzenie stron Astro:** Stworzyć pliki `src/pages/dashboard.astro` i `src/pages/analyses/[id].astro`. Zaimplementować podstawową logikę pobierania `id` w `[id].astro` i przekazania go do komponentu React. Zmodyfikować middleware do obsługi publicznego dostępu.
2.  **Implementacja serwisu tymczasowych analiz:** Stworzyć `src/lib/services/temporary-analysis.service.ts` do zarządzania analizami w sessionStorage.
3.  **Implementacja `NewAnalysisForm`:** Stworzyć komponent React, zintegrować `TextAreaWithCounter` (bazujący na Shadcn `Textarea`) i `AnalyseButton` (Shadcn `Button`). Zaimplementować logikę stanu (`useState`), walidacji, komunikacji z `POST /api/analyses` i zapisywania tymczasowych analiz w sessionStorage dla niezalogowanych. Dodać `SpinnerOverlay`. Obsłużyć przekierowanie po sukcesie.
4.  **Implementacja `AnalysisDetailsView`:** Stworzyć komponent React. Zaimplementować custom hook `useAnalysisDetails` do zarządzania stanem, sprawdzania sessionStorage i pobierania danych API. Obsłużyć stany ładowania i błędy. Dodać `AuthNoticeAlert` dla niezalogowanych użytkowników.
5.  **Implementacja `DocumentViewer`:** Stworzyć komponent wyświetlający `text_content` i `LanguageBadge` (Shadcn `Badge`).
6.  **Implementacja `FilterControls`:** Stworzyć komponent z kontrolkami (np. Shadcn `Checkbox`) do filtrowania po `IssueCategory`. Połączyć ze stanem/hookiem w `AnalysisDetailsView`.
7.  **Implementacja `IssuesList`:** Stworzyć komponent renderujący listę `IssueCard`. Zaimplementować logikę paginacji/infinite scroll (np. przy użyciu `react-intersection-observer`) i przycisk/wskaźnik ładowania kolejnych problemów. Obsłużyć pusty stan. Ograniczyć liczbę problemów dla niezalogowanych.
8.  **Implementacja `IssueCard`:** Stworzyć komponent (np. na bazie Shadcn `Card` lub `Accordion`) wyświetlający kategorię (`CategoryBadge`), opis i sugestię.
9.  **Implementacja komponentów pomocniczych:** Stworzyć `CategoryBadge` (Shadcn `Badge` ze stylami warunkowymi) i `AuthNoticeAlert`.
10. **Styling i RWD:** Zastosować Tailwind CSS do stylizacji komponentów zgodnie z designem. Upewnić się, że widoki są responsywne, ze szczególnym uwzględnieniem układu `AnalysisDetailsView` (dwie kolumny na desktopie, stack na mobile).
11. **Testowanie:** Przetestować przepływ tworzenia analizy, wyświetlania szczegółów, filtrowania, paginacji oraz obsługę błędów i przypadków brzegowych (puste dane, bardzo długi tekst itp.) na różnych urządzeniach/rozmiarach ekranu, zarówno dla zalogowanych jak i niezalogowanych użytkowników. 