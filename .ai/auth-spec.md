# Specyfikacja Techniczna: Moduł Autentykacji GdprMate

## 1. Wprowadzenie

Niniejszy dokument opisuje architekturę i implementację modułu rejestracji, logowania, wylogowywania oraz odzyskiwania hasła dla aplikacji GdprMate. Specyfikacja bazuje na wymaganiach funkcjonalnych zdefiniowanych w `.ai/prd.md` oraz przyjętym stosie technologicznym opisanym w `.ai/tech-stack.md`. Głównym dostawcą usług autentykacji będzie Supabase Auth.

## 2. Architektura Interfejsu Użytkownika (Frontend)

Warstwa frontendowa zostanie zrealizowana przy użyciu Astro dla struktury stron i layoutów oraz React dla interaktywnych komponentów formularzy.

### 2.1. Nowe Strony (Astro)

-   **`/rejestracja`**: Strona zawierająca formularz rejestracji. Dostępna dla niezalogowanych użytkowników (Gości). Po pomyślnej rejestracji użytkownik jest automatycznie logowany i przekierowywany do strony głównej lub panelu użytkownika.
-   **`/logowanie`**: Strona zawierająca formularz logowania. Dostępna dla niezalogowanych użytkowników. Po pomyślnym logowaniu użytkownik jest przekierowywany do strony głównej lub panelu użytkownika.
-   **`/odzyskaj-haslo`**: Strona zawierająca formularz do zainicjowania procesu odzyskiwania hasła (wprowadzenie adresu e-mail). Dostępna dla niezalogowanych użytkowników.
-   **`/zresetuj-haslo`**: Strona (dostępna poprzez link z e-maila resetującego hasło) zawierająca formularz do ustawienia nowego hasła.

### 2.2. Nowe Komponenty Interaktywne (React)

Komponenty te będą renderowane w trybie `client:load` lub `client:visible` na odpowiednich stronach Astro. Będą odpowiedzialne za interakcję z użytkownikiem, walidację po stronie klienta oraz komunikację z **backendowymi endpointami API Astro**.

-   **`RegistrationForm.tsx`**:
    -   Pola: Adres e-mail, Hasło, Potwierdzenie hasła.
    -   Walidacja: Sprawdzenie formatu e-maila, minimalnej długości hasła, zgodności haseł.
    -   **Komunikacja:** Wywołanie `fetch('/api/auth/signup', { method: 'POST', body: JSON.stringify({ email, password, passwordConfirm }), headers: { 'Content-Type': 'application/json' } })`.
    -   Obsługa błędów: Wyświetlanie komunikatów błędów zwróconych przez API (np. "Użytkownik już istnieje", "Nieprawidłowe hasło", błędy walidacji).
    -   Stan: Loading podczas wysyłania, success/error po otrzymaniu odpowiedzi z API.
-   **`LoginForm.tsx`**:
    -   Pola: Adres e-mail, Hasło.
    -   Walidacja: Sprawdzenie formatu e-maila, obecności hasła.
    -   **Komunikacja:** Wywołanie `fetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }), headers: { 'Content-Type': 'application/json' } })`.
    -   Obsługa błędów: Wyświetlanie komunikatów błędów zwróconych przez API (np. "Nieprawidłowe dane logowania").
    -   Stan: Loading, success/error.
-   **`PasswordRecoveryForm.tsx`**:
    -   Pola: Adres e-mail.
    -   Walidacja: Sprawdzenie formatu e-maila.
    -   **Komunikacja:** Wywołanie `fetch('/api/auth/reset-password', { method: 'POST', body: JSON.stringify({ email }), headers: { 'Content-Type': 'application/json' } })`.
    -   Obsługa błędów: Wyświetlanie komunikatów (np. "Jeśli email istnieje w bazie, wysłano link").
    -   Stan: Loading, success/error.
-   **`PasswordResetForm.tsx`**:
    -   Pola: Nowe hasło, Potwierdzenie nowego hasła.
    -   Walidacja: Minimalna długość hasła, zgodność haseł.
    -   **Komunikacja:** *Podejście 1 (API):* Wywołanie `fetch('/api/auth/update-password', { method: 'POST', ... })`, wymagające przekazania tokena resetującego lub zarządzania sesją przez API. *Podejście 2 (Client-side z tokenem):* Bezpośrednie wywołanie `supabase.auth.updateUser({ password: newPassword })` z użyciem klienta Supabase JS skonfigurowanego na frontendzie, wykorzystując token z URL (wymaga obecności Supabase JS SDK na tej stronie). Wybór podejścia zależy od preferencji implementacyjnych.
    -   Obsługa błędów: Wyświetlanie komunikatów.
    -   Stan: Loading, success/error.

### 2.3. Modyfikacje Layoutów i Komponentów Istniejących

-   **Layout Główny (`src/layouts/Layout.astro` lub podobny)**:
    -   Musi dynamicznie renderować elementy nawigacji w zależności od statusu autentykacji użytkownika.
    -   *Gość*: Wyświetla linki "Zaloguj się" (`/logowanie`) i "Zarejestruj się" (`/rejestracja`).
    -   *Użytkownik zalogowany*: Wyświetla np. nazwę użytkownika/email, link do panelu/historii i przycisk/link "Wyloguj się".
    -   Implementacja stanu autentykacji może wykorzystać globalny store (np. Nanostores) lub komponent React nasłuchujący na zmiany stanu Supabase Auth.
-   **Komponent/Logika Wylogowania**:
    -   Przycisk "Wyloguj się" w layoucie dla zalogowanego użytkownika.
    -   Po kliknięciu wywołuje `fetch('/api/auth/logout', { method: 'POST' })`.
    -   Po pomyślnej odpowiedzi z API, aktualizuje stan globalny i przekierowuje użytkownika na stronę główną lub stronę logowania.
-   **Komponent `AnalysisForm.tsx` (lub odpowiednik)**:
    -   Musi uwzględniać status użytkownika (Gość vs Zalogowany) przy walidacji długości tekstu (limit 1000 znaków dla Gościa - WF-004).
    -   Przycisk "Analizuj" może być nieaktywny lub wyświetlać komunikat o limicie dla Gościa.
-   **Strona/Komponent Wyników Analizy (`ResultsView.tsx` lub podobny)**:
    -   Musi warunkowo renderować wyniki analizy zgodnie z WF-005 (Gość widzi max 2 problemy, Zalogowany widzi wszystkie).
    -   Musi warunkowo renderować sugestie poprawek zgodnie z WF-006 (Gość widzi sugestie dla max 2 problemów, Zalogowany dla wszystkich).
    -   Musi warunkowo wyświetlać zachętę do logowania dla Gościa.
-   **Strona/Sekcja Historii Analiz**:
    -   Dostępna tylko dla zalogowanych użytkowników (WF-008). Strona `/historia` (lub podobna) powinna być chroniona.
    -   Wyświetlanie historii i funkcje sortowania (US-010) dostępne tylko dla zalogowanych.

### 2.4. Zarządzanie Stanem Autentykacji (Client-Side)

-   Aktualizacja stanu autentykacji na frontendzie (np. w globalnym store Nanostores lub React Context) będzie opierać się **głównie na odpowiedziach otrzymanych z backendowych endpointów API** (`/api/auth/login`, `/api/auth/signup`, `/api/auth/logout`).
-   Po pomyślnym logowaniu/rejestracji, API zwraca dane sesji/użytkownika, które frontend zapisuje w stanie globalnym.
-   Po wywołaniu `/api/auth/logout` i otrzymaniu potwierdzenia, frontend czyści stan globalny związany z sesją.
-   Zmiana stanu powinna być propagowana do odpowiednich komponentów (Layout, formularze, widoki wyników) w celu dynamicznego dostosowania interfejsu.
-   Opcjonalnie, można nadal używać listenera `supabase.auth.onAuthStateChange` z Supabase JS SDK na kliencie do synchronizacji stanu sesji zarządzanej przez ciasteczka (jeśli Supabase Auth Helpers są używane i poprawnie skonfigurowane), jako dodatkowy mechanizm zapewniający spójność.

### 2.5. Walidacja i Komunikaty

-   Walidacja po stronie klienta w komponentach React (np. przy użyciu biblioteki jak `zod` lub `react-hook-form`).
-   Wyświetlanie jasnych komunikatów o błędach walidacji bezpośrednio przy polach formularzy.
-   Wyświetlanie komunikatów o błędach **zwróconych przez backendowe API** (np. nieprawidłowe hasło, email zajęty, błędy walidacji serwerowej) w sposób widoczny dla użytkownika, np. nad formularzem lub przy polach.
-   Obsługa stanów ładowania (np. deaktywacja przycisku, wyświetlanie spinnera) podczas komunikacji z API.

## 3. Logika Backendowa (Astro API Routes)

Logika autentykacji zostanie zaimplementowana jako dedykowane endpointy API w Astro, znajdujące się w katalogu `src/pages/api/auth/`. Endpointy te będą odpowiedzialne za walidację danych wejściowych, interakcję z Supabase Auth po stronie serwera i zwracanie odpowiedzi do klienta.

### 3.1. Struktura Endpointów API

-   **`POST /api/auth/signup`**:
    -   Odbiera: `email`, `password`, `passwordConfirm`.
    -   Waliduje dane wejściowe (format email, długość hasła, zgodność haseł) używając np. Zod.
    -   Wywołuje `supabase.auth.admin.createUser()` (lub odpowiednik server-side) do utworzenia użytkownika w Supabase.
    -   W przypadku sukcesu, może automatycznie zalogować użytkownika (opcjonalnie, tworząc sesję przez Auth Helpers) i zwraca dane użytkownika lub potwierdzenie sukcesu.
    -   Zwraca odpowiedni status HTTP (201 Created, 400 Bad Request, 409 Conflict, 500 Internal Server Error) i JSON z komunikatem.
-   **`POST /api/auth/login`**:
    -   Odbiera: `email`, `password`.
    -   Waliduje dane wejściowe.
    -   Wywołuje `supabase.auth.signInWithPassword()` (wersja server-side lub przez helpery) do weryfikacji danych i utworzenia sesji. Supabase Auth Helpers (`@supabase/auth-helpers-astro`) mogą automatycznie zarządzać ciasteczkami sesji.
    -   W przypadku sukcesu, zwraca dane zalogowanego użytkownika lub potwierdzenie sukcesu.
    -   Zwraca odpowiedni status HTTP (200 OK, 400 Bad Request, 401 Unauthorized, 500 Internal Server Error) i JSON z komunikatem.
-   **`POST /api/auth/logout`**:
    -   Nie wymaga ciała żądania.
    -   Wywołuje `supabase.auth.signOut()` (wersja server-side lub przez helpery) do unieważnienia sesji/tokena. Supabase Auth Helpers mogą zarządzać usuwaniem ciasteczek sesji.
    -   Zwraca odpowiedni status HTTP (200 OK, 500 Internal Server Error) i JSON z komunikatem.
-   **`POST /api/auth/reset-password`**:
    -   Odbiera: `email`.
    -   Waliduje dane wejściowe (format email).
    -   Wywołuje `supabase.auth.resetPasswordForEmail()` (wersja server-side/admin) z opcją `redirectTo` wskazującą na frontendową stronę `/zresetuj-haslo`.
    -   Zawsze zwraca odpowiedź sukcesu (np. 200 OK), aby nie ujawniać, czy dany email istnieje w bazie.
-   **`POST /api/auth/update-password`**:
    -   *Uwaga: Aktualizacja hasła po kliknięciu linka resetującego często wymaga aktywnej, specyficznej sesji utworzonej przez ten link. Implementacja tego jako czysty endpoint API może być złożona. Rozważenie obsługi tego kroku na stronie `/zresetuj-haslo` za pomocą Supabase JS SDK (Podejście 2 w sekcji 2.2) może być prostsze.*
    -   Jeśli realizowane przez API: Odbiera: `newPassword`, `passwordConfirm` oraz mechanizm weryfikacji sesji/tokena resetującego.
    -   Waliduje dane wejściowe.
    -   Wywołuje odpowiednią metodę Supabase do aktualizacji hasła użytkownika (np. `supabase.auth.updateUser()` w kontekście sesji resetującej lub `supabase.auth.admin.updateUserById()`).
    -   Zwraca odpowiedni status HTTP i JSON.

### 3.2. Mechanizm Walidacji Danych Wejściowych

-   Wykorzystanie biblioteki Zod w każdym endpoincie API (`/api/auth/*`) do definiowania schematów i walidacji danych przychodzących w ciele żądania (request body).
-   Walidacja obejmuje typy danych, format (np. email), minimalną długość (hasło), zgodność pól (hasło i potwierdzenie).
-   W przypadku błędu walidacji, endpoint zwraca status `400 Bad Request` oraz odpowiedź JSON zawierającą szczegóły błędów walidacji (np. `{ "errors": { "field_name": "Komunikat błędu" } }`).

### 3.3. Obsługa Wyjątków i Błędów

-   Logika każdego endpointu API jest opakowana w bloki `try...catch`.
-   Błędy zwracane przez Supabase SDK (np. email już istnieje, nieprawidłowe hasło) są przechwytywane i mapowane na odpowiednie odpowiedzi HTTP (np. 409 Conflict, 401 Unauthorized) z czytelnym komunikatem w JSON.
-   Nieoczekiwane błędy serwera (np. problemy z połączeniem do Supabase, błędy wewnętrzne) są logowane po stronie serwera w celu debugowania.
-   Klient otrzymuje generyczną odpowiedź błędu dla błędów serwera (np. `500 Internal Server Error` z komunikatem `{ "message": "Wystąpił wewnętrzny błąd serwera" }`), aby nie ujawniać szczegółów implementacji.


### 3.4. Middleware (`src/middleware/index.ts`)

-   Rola middleware pozostaje kluczowa dla ochrony stron renderowanych po stronie serwera (`/historia` itp.).
-   Wykorzystuje Supabase Auth Helpers (`@supabase/auth-helpers-astro`) do odczytania i weryfikacji sesji użytkownika z ciasteczek (ustawionych przez endpoint `/api/auth/login`).
-   Jeśli sesja jest nieprawidłowa dla chronionej trasy, przekierowuje na `/logowanie`.
-   Jeśli sesja jest prawidłowa, tworzy klienta Supabase w kontekście użytkownika i dodaje informacje (`session`, `user`, `supabaseClient`) do `Astro.locals`, udostępniając je chronionej stronie.
-   Dla stron publicznych, nadal może odczytywać sesję, aby umożliwić layoutowi dynamiczne wyświetlanie elementów (np. przycisku "Wyloguj").

### 3.5. Dostęp do Danych (Server-Side)

-   W endpointach API (`/api/auth/*`) oraz na chronionych stronach SSR, do interakcji z Supabase (Auth i Baza Danych) używany jest klient Supabase **skonfigurowany dla środowiska serwerowego**.
-   Wykorzystanie Supabase Auth Helpers (`@supabase/auth-helpers-astro`) pozwala na łatwe tworzenie klienta Supabase (`createSupabaseClient`) w kontekście żądania HTTP, który automatycznie zarządza sesją użytkownika.
-   Dla operacji administracyjnych (jak tworzenie użytkownika w `signup` lub potencjalnie reset hasła), może być potrzebne użycie klienta Supabase inicjalizowanego z kluczem `service_role` (Admin API). Należy go używać ostrożnie.
-   Polityki Row-Level Security (RLS) w bazie danych Supabase pozostają niezbędne do zapewnienia izolacji danych użytkowników przy odczycie/zapisie np. historii analiz, nawet przy użyciu klienta serwerowego.

## 4. System Autentykacji (Supabase Auth)

### 4.1. Konfiguracja Supabase

-   Utworzenie projektu Supabase.
-   Skonfigurowanie dostawcy autentykacji Email/Password.
-   **Szablony E-mail:** Skonfigurowanie szablonów e-mail dla:
    -   Potwierdzenia adresu e-mail (opcjonalnie, ale zalecane).
    -   Resetowania hasła (zawierającego link do strony `/zresetuj-haslo`).
-   **Adresy URL Przekierowań:** Ustawienie adresów URL aplikacji (np. adres strony `/zresetuj-haslo`) w ustawieniach Supabase Auth.
-   **RLS:** Włączenie i skonfigurowanie polityk Row-Level Security dla tabel przechowujących dane użytkowników (np. `historia_analiz`), aby zapewnić dostęp tylko dla właściciela rekordu (`auth.uid() = user_id`).

### 4.2. Integracja z Astro/React (Supabase SDK i Helpers)

-   Instalacja `@supabase/supabase-js` oraz `@supabase/auth-helpers-astro`.
-   **Konfiguracja Server-Side:**
    -   Endpointy API Astro (`src/pages/api/auth/*.ts`) oraz middleware (`src/middleware/index.ts`) będą używać `@supabase/auth-helpers-astro` do tworzenia instancji klienta Supabase (`createSupabaseClient`) w kontekście każdego żądania. Pozwala to na bezpieczną interakcję z Supabase Auth (logowanie, wylogowanie, sprawdzanie sesji) i bazą danych po stronie serwera.
    -   Do operacji wymagających uprawnień administratora (np. `signUp` jeśli używa Admin API), konieczne może być utworzenie oddzielnego klienta Supabase z kluczem `service_role` (przechowywanym bezpiecznie jako zmienna środowiskowa serwera).
    -   Zmienne środowiskowe (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, opcjonalnie `SUPABASE_SERVICE_ROLE_KEY`) są używane do konfiguracji helperów i klientów Supabase.
-   **Konfiguracja Client-Side (Minimalna):**
    -   Supabase JS SDK (`@supabase/supabase-js`) może być nadal potrzebne na frontendzie w ograniczonym zakresie:
        -   Do obsługi specyficznego przepływu resetowania hasła, jeśli strona `/zresetuj-haslo` bezpośrednio wywołuje `supabase.auth.updateUser()` (Podejście 2 w sekcji 2.2). Wymaga to inicjalizacji klienta Supabase JS na tej stronie.
        -   Do opcjonalnego nasłuchiwania na `onAuthStateChange` w celu dodatkowej synchronizacji stanu UI.
    -   Jeśli Supabase JS SDK jest używane na kliencie, należy je zainicjalizować za pomocą `SUPABASE_URL` i `SUPABASE_ANON_KEY`.

## 5. Kluczowe Wnioski i Uwagi

-   Architektura przenosi główną logikę autentykacji na **backend (Astro API Routes)**, co zwiększa bezpieczeństwo (klucze API i logika nie są eksponowane na frontendzie).
-   Frontend (React) jest odpowiedzialny za UI formularzy i komunikację z backendowymi API endpointami.
-   Kluczową rolę odgrywają **Supabase Auth Helpers (`@supabase/auth-helpers-astro`)** do zarządzania sesjami i tworzenia kontekstowych klientów Supabase na serwerze.
-   Stan autentykacji (zalogowany/niezalogowany) jest kluczowy dla warunkowego renderowania UI i ograniczania funkcjonalności zgodnie z PRD. Globalny listener `onAuthStateChange` jest centralnym elementem tej logiki.
-   Bezpieczeństwo opiera się na mechanizmach Supabase Auth (haszowanie haseł, bezpieczna obsługa sesji) oraz prawidłowej implementacji RLS w bazie danych Supabase.
-   Należy zadbać o spójne i zrozumiałe komunikaty dla użytkownika na każdym etapie procesu autentykacji (walidacja, błędy, sukces).
-   Wersja MVP zakłada autentykację email/hasło. W przyszłości można rozważyć dodanie dostawców OAuth (Google, GitHub itp.), co jest wspierane przez Supabase Auth. 