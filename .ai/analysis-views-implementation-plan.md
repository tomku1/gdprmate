# Plan implementacji widoków analizy (Nowa Analiza i Szczegóły Analizy)

## 1. Przegląd
Plan opisuje implementację dwóch powiązanych widoków w aplikacji GdprMate:
1.  **Widok Nowej Analizy** (`/dashboard`): Umożliwia zalogowanym użytkownikom wprowadzenie tekstu (np. klauzuli informacyjnej) i zainicjowanie analizy zgodności z GDPR.
2.  **Widok Szczegółów Analizy** (`/analyses/:id`): Wyświetla wyniki przeprowadzonej analizy, w tym listę zidentyfikowanych problemów (błędów/braków), ich kategorie oraz sugerowane poprawki. Umożliwia filtrowanie problemów.

Implementacja będzie zgodna z dostarczonymi wymaganiami (PRD), historyjkami użytkowników, opisem API i stackiem technologicznym (Astro, React, TypeScript, Tailwind, Shadcn/ui).

**Uwaga:** Interakcje użytkownika z sugestiami (np. kopiowanie, odrzucanie) nie są częścią tego planu implementacji i zostaną opisane w osobnym dokumencie.

## 2. Routing widoku
- **Nowa Analiza**: Dostępny pod ścieżką `/dashboard` (domyślna zakładka). Dostęp chroniony, wymaga zalogowania.
- **Szczegóły Analizy**: Dostępny pod dynamiczną ścieżką `/analyses/:id`, gdzie `:id` to UUID analizy. Dostęp chroniony, wymaga zalogowania i autoryzacji (użytkownik musi być właścicielem analizy).

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
```

## 4. Szczegóły komponentów

### `NewAnalysisForm`
- **Opis:** Kontener formularza do tworzenia nowej analizy. Zarządza stanem wprowadzania tekstu, walidacją, stanem ładowania i komunikacją z API (`POST /api/analyses`). Po pomyślnym utworzeniu analiz przekierowuje na `/analyses/:id`.
- **Główne elementy:** TextAreaWithCounter, AnalyseButton, SpinnerOverlay, komunikaty błędów walidacji i API.
- **Interakcje:** Wprowadzanie tekstu, kliknięcie przycisku analizy.
- **Walidacja:** Tekst nie może być pusty i nie może przekraczać 50 000 znaków. Wyświetla błędy API (400, 413).
- **Typy:** DTO: CreateAnalysisCommand, CreateAnalysisResponseDTO. ViewModel: NewAnalysisFormState { text: string; isLoading: boolean; error: string | null; validationError: string | null }.
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
- **Opis:** Kontener widoku szczegółów; pobiera dane (`GET /api/analyses/:id`), zarządza ładowaniem, błędami, filtrowaniem i paginacją.
- **Główne elementy:** DocumentViewer, FilterControls, IssuesList.
- **Interakcje:** Zmiana filtrów, ładowanie kolejnych stron problemów.
- **Walidacja:** Obsługa kodów API (200, 401, 403, 404, 500).
- **Typy:** DTO: AnalysisDetailsDTO, IssueDTO, PaginationDTO. ViewModel: AnalysisDetailsState { analysis: AnalysisDetailsDTO | null; isLoading: boolean; error: string | null; selectedFilters: IssueCategory[]; issues: IssueDTO[]; currentIssuePage: number; totalIssuePages: number; isLoadingIssues: boolean }.
- **Propsy:** analysisId: string.

### `DocumentViewer`
- **Opis:** Wyświetla treść dokumentu (text_content) i metadane, w tym język przez LanguageBadge; bez podświetlania problemów.
- **Główne elementy:** div/pre na tekst, LanguageBadge.
- **Interakcje:** —
- **Typy:** DTO: AnalysisDetailsDTO.
- **Propsy:** analysisData: AnalysisDetailsDTO.

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
- **Opis:** Renderuje listę IssueCard z paginacją lub infinite scroll; pozwala ładować kolejne problemy.
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
- **`AnalysisDetailsView`**: Ze względu na większą złożoność (pobieranie danych analizy, zarządzanie listą problemów, filtrowanie, paginacja, stany ładowania i błędów), zalecane jest stworzenie customowego hooka, np. `useAnalysisDetails(analysisId: string)`. Hook ten enkapsulowałby logikę pobierania danych z API (`GET /api/analyses/:id` z różnymi parametrami query), zarządzanie stanem (`AnalysisDetailsState`) i udostępniałby dane oraz funkcje do interakcji (np. `loadMoreIssues`, `setFilters`) komponentowi `AnalysisDetailsView`.

## 7. Integracja API
- **Tworzenie analizy:** Komponent `NewAnalysisForm` wywoła `fetch` (lub inną bibliotekę HTTP) z metodą `POST` na endpoint `/api/analyses`.
    - **Żądanie:** `Content-Type: application/json`, Body: `CreateAnalysisCommand` (`{ "text_content": string }`). Wymagana autoryzacja (Bearer token w nagłówku, obsłużone przez middleware Astro lub globalny wrapper fetch).
    - **Odpowiedź (Sukces 201):** `CreateAnalysisResponseDTO`. Zwraca podsumowanie nowo utworzonej analizy (ID, podgląd tekstu, status, język, data). **Uwaga:** Pełne szczegóły analizy, w tym lista znalezionych problemów (`issues`), nie są zwracane w tej odpowiedzi i wymagają osobnego zapytania `GET /api/analyses/:id` po przekierowaniu. Frontend użyje `id` z odpowiedzi do przekierowania na `/analyses/:id`.
    - **Odpowiedź (Błąd):** Obsługa statusów 400, 413 (błędy walidacji), 401 (przekierowanie do logowania), 500 (ogólny błąd serwera).
- **Pobieranie szczegółów analizy:** Custom hook `useAnalysisDetails` (lub bezpośrednio `AnalysisDetailsView`) wywoła `fetch` z metodą `GET` na endpoint `/api/analyses/:id` (po przekierowaniu z formularza lub bezpośrednim wejściu na stronę).
    - **Żądanie:** Wymagana autoryzacja. Opcjonalne parametry query: `page`, `limit`, `category` (do paginacji i filtrowania problemów `issues`).
    - **Odpowiedź (Sukces 200):** `AnalysisDetailsDTO`. Zawiera pełne dane analizy, w tym cały tekst (`text_content`) oraz pierwszą stronę listy problemów (`issues`) wraz z informacjami o paginacji (`issues_pagination`). Dane zostaną zapisane w stanie komponentu/hooka.
    - **Odpowiedź (Błąd):** Obsługa statusów 401 (przekierowanie), 403 (brak dostępu), 404 (nie znaleziono), 500 (błąd serwera).

## 8. Interakcje użytkownika
- **Wpisywanie tekstu:** Aktualizacja stanu `text` w `NewAnalysisForm`, aktualizacja licznika znaków, dynamiczna walidacja i zmiana stanu `AnalyseButton`.
- **Kliknięcie "Analizuj":** Wywołanie `POST /api/analyses`, pokazanie `SpinnerOverlay`, obsługa odpowiedzi (przekierowanie lub błąd).
- **Zmiana filtrów:** Aktualizacja stanu `selectedFilters` w `AnalysisDetailsView`, wywołanie `GET /api/analyses/:id` z parametrem `category`, aktualizacja `IssuesList`.
- **Ładowanie kolejnych problemów:** (Infinite scroll lub przycisk) Wywołanie `GET /api/analyses/:id` z parametrem `page`, dołączenie nowych problemów do `IssuesList`, aktualizacja stanu paginacji.

## 9. Warunki i walidacja
- **Formularz Nowej Analizy (`NewAnalysisForm`):**
    - Warunek: `text.length > 0` ORAZ `text.length <= 50000`.
    - Weryfikacja: W komponencie, przed wysłaniem żądania.
    - Wpływ na UI: Stan `disabled` komponentu `AnalyseButton`, ewentualne komunikaty walidacyjne przy `TextAreaWithCounter`. Walidacja jest też po stronie API (400, 413).
- **Dostęp do Szczegółów Analizy (`AnalysisDetailsView`):**
    - Warunek: Użytkownik zalogowany ORAZ użytkownik jest właścicielem analizy o danym `:id`.
    - Weryfikacja: Po stronie API (zwraca 401 lub 403).
    - Wpływ na UI: Przekierowanie na `/login` (dla 401) lub wyświetlenie komunikatu o braku dostępu (dla 403).
- **Paginacja Problemów (`IssuesList`):**
    - Warunek: `currentPage < totalPages`.
    - Weryfikacja: W komponencie `IssuesList` lub hooku `useAnalysisDetails` na podstawie `pagination` z API.
    - Wpływ na UI: Widoczność/aktywność przycisku "Załaduj więcej" lub działanie infinite scroll.

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
1.  **Utworzenie stron Astro:** Stworzyć pliki `src/pages/dashboard.astro` i `src/pages/analyses/[id].astro`. Zaimplementować podstawową logikę pobierania `id` w `[id].astro` i przekazania go do komponentu React. Zabezpieczyć trasy przed niezalogowanymi użytkownikami (np. za pomocą middleware Astro lub logiki w `Astro.locals`).
2.  **Implementacja `NewAnalysisForm`:** Stworzyć komponent React, zintegrować `TextAreaWithCounter` (bazujący na Shadcn `Textarea`) i `AnalyseButton` (Shadcn `Button`). Zaimplementować logikę stanu (`useState`), walidacji i komunikacji z `POST /api/analyses`. Dodać `SpinnerOverlay`. Obsłużyć przekierowanie po sukcesie.
3.  **Implementacja `AnalysisDetailsView`:** Stworzyć komponent React. Rozważyć implementację custom hooka `useAnalysisDetails` do zarządzania stanem i logiką pobierania danych (`GET /api/analyses/:id`). Obsłużyć stany ładowania i błędy (401, 403, 404, 500).
4.  **Implementacja `DocumentViewer`:** Stworzyć komponent wyświetlający `text_content` i `LanguageBadge` (Shadcn `Badge`).
5.  **Implementacja `FilterControls`:** Stworzyć komponent z kontrolkami (np. Shadcn `Checkbox`) do filtrowania po `IssueCategory`. Połączyć ze stanem/hookiem w `AnalysisDetailsView`.
6.  **Implementacja `IssuesList`:** Stworzyć komponent renderujący listę `IssueCard`. Zaimplementować logikę paginacji/infinite scroll (np. przy użyciu `react-intersection-observer`) i przycisk/wskaźnik ładowania kolejnych problemów. Obsłużyć pusty stan.
7.  **Implementacja `IssueCard`:** Stworzyć komponent (np. na bazie Shadcn `Card` lub `Accordion`) wyświetlający kategorię (`CategoryBadge`), opis i sugestię.
8.  **Implementacja komponentów pomocniczych:** Stworzyć `CategoryBadge` (Shadcn `Badge` ze stylami warunkowymi).
9.  **Styling i RWD:** Zastosować Tailwind CSS do stylizacji komponentów zgodnie z designem. Upewnić się, że widoki są responsywne, ze szczególnym uwzględnieniem układu `AnalysisDetailsView` (dwie kolumny na desktopie, stack na mobile).
10. **Testowanie:** Przetestować przepływ tworzenia analizy, wyświetlania szczegółów, filtrowania, paginacji oraz obsługę błędów i przypadków brzegowych (puste dane, bardzo długi tekst itp.) na różnych urządzeniach/rozmiarach ekranu. 