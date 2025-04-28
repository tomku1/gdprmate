
# Plan Testów Aplikacji GdprMate

## 1. Wprowadzenie i Cele Testowania

### 1.1. Wprowadzenie

Niniejszy dokument określa strategię, zakres, podejście oraz zasoby wymagane do przeprowadzenia testów aplikacji GdprMate. GdprMate to aplikacja webowa wspomagająca użytkowników w analizie zgodności dokumentów prawnych (np. klauzul informacyjnych, zgód) z wybranymi artykułami GDPR (Art. 7, 13, 14). Aplikacja wykorzystuje modele językowe (LLM) poprzez usługę OpenRouter.ai do identyfikacji problemów i generowania sugestii. Projekt jest w fazie MVP (Minimum Viable Product).

### 1.2. Cele Testowania

Główne cele procesu testowania aplikacji GdprMate to:

*   Weryfikacja zgodności zaimplementowanych funkcjonalności z wymaganiami produktu (PRD) i historyjkami użytkowników.
*   Zapewnienie stabilności i niezawodności kluczowych funkcji aplikacji, w szczególności procesu analizy tekstu oraz systemu autentykacji.
*   Identyfikacja i raportowanie defektów oprogramowania w celu ich naprawy przed wdrożeniem produkcyjnym.
*   Ocena użyteczności i spójności interfejsu użytkownika na różnych urządzeniach (RWD).
*   Sprawdzenie podstawowych aspektów bezpieczeństwa, w tym autoryzacji i ochrony danych użytkownika.
*   Weryfikacja poprawnej integracji z usługami zewnętrznymi (Supabase, OpenRouter.ai).
*   Zapewnienie, że aplikacja działa poprawnie w docelowych środowiskach.

## 2. Zakres Testów

### 2.1. Funkcjonalności w Zakresie Testów (In-Scope)

Testy obejmą wszystkie funkcjonalności zdefiniowane jako "In-Scope" w pliku `README.md` oraz wymaganiach PRD, w tym:

*   **Analiza Tekstu:**
    *   Automatyczna analiza klauzul informacyjnych (Art. 13, 14) i zgód (Art. 7).
    *   Obsługa wprowadzania tekstu przez kopiuj/wklej.
    *   Rozróżnienie funkcjonalności dla użytkownika Gościa (limity znaków, liczby analiz, używany model LLM) i Zalogowanego.
    *   Poprawność działania integracji z OpenRouter.ai (przekazywanie promptów, odbieranie odpowiedzi, obsługa błędów API).
*   **Wyświetlanie Wyników:**
    *   Prezentacja zidentyfikowanych problemów.
    *   Kategoryzacja problemów (krytyczne, ważne, drobne) i ich wizualne oznaczenie.
    *   Generowanie i wyświetlanie sugestii poprawek.
    *   Ograniczenie widoczności wyników i sugestii dla Gościa (max 2 problemy).
    *   Filtrowanie listy problemów według kategorii.
*   **Autentykacja i Konta Użytkowników:**
    *   Rejestracja nowych użytkowników.
    *   Logowanie i wylogowywanie.
    *   Odzyskiwanie hasła (inicjacja i ustawienie nowego hasła).
    *   Zarządzanie sesją użytkownika (middleware, stan w UI).
*   **Historia Analiz (dla zalogowanych):**
    *   Zapisywanie przeprowadzonych analiz i powiązanych dokumentów.
    *   Możliwość przeglądania historii.
    *   Możliwość powrotu do szczegółów archiwalnej analizy.
    *   Sortowanie historii (jeśli zaimplementowane w MVP).
*   **Interfejs Użytkownika (UI/UX):**
    *   Responsywność interfejsu (Desktop, Tablet, Mobile).
    *   Spójność wizualna (zgodność z Shadcn/ui i Tailwind).
    *   Podstawowa użyteczność i nawigacja.
    *   Obsługa wielu języków (PL/EN) - weryfikacja elementów UI i potencjalnie analizy.
*   **Bezpieczeństwo:**
    *   Podstawowa walidacja danych wejściowych (frontend/backend).
    *   Weryfikacja mechanizmów autoryzacji (dostęp do danych własnych, RLS w Supabase - po jego włączeniu).
    *   Bezpieczeństwo sesji (np. flagi `HttpOnly`, `Secure` dla ciasteczek).

### 2.2. Funkcjonalności Poza Zakresem Testów (Out-of-Scope)

Następujące elementy nie będą objęte testami w ramach tej fazy (MVP):

*   **Dokładność merytoryczna analizy LLM:** Testy nie będą weryfikować, czy analiza przeprowadzona przez LLM jest w 100% poprawna z punktu widzenia prawa GDPR. Sprawdzane będzie, czy system poprawnie *obsługuje* odpowiedź z LLM (parsuje, wyświetla, obsługuje błędy), a nie jej treść merytoryczna.
*   **Walidacja prawna sugestii:** Sugestie generowane przez LLM nie będą podlegały formalnej weryfikacji prawnej.
*   **Zaawansowane interpretacje prawne:** Funkcje wykraczające poza podstawowe sprawdzenie zgodności z Art. 7, 13, 14.
*   **Integracje zewnętrzne (poza Supabase/OpenRouter):** Brak testów integracji z CRM, ERP itp.
*   **Zaawansowane raporty i dashboardy:** Funkcje analityczne wykraczające poza historię analiz.
*   **Dedykowana aplikacja mobilna.**
*   **System powiadomień.**
*   **Wersjonowanie dokumentów.**
*   **Eksport danych (PDF/CSV).**
*   **Testy obciążeniowe na dużą skalę:** W fazie MVP skupiamy się na testach funkcjonalnych i podstawowych wydajnościowych.
*   **Pełne testy penetracyjne:** Podstawowe testy bezpieczeństwa tak, ale pełny audyt bezpieczeństwa jest poza zakresem.
*   **Obsługa plików `.pdf`, `.docx`:** Funkcjonalność opisana w README jako "In-Scope", ale nie ma komponentów/logiki do jej obsługi w dostarczonym kodzie – testy w tym zakresie zostaną dodane po implementacji.

## 3. Typy Testów do Przeprowadzenia

*   **Testy Jednostkowe (Unit Tests):**
    *   **Cel:** Weryfikacja poprawności działania izolowanych fragmentów kodu (komponenty React, funkcje pomocnicze, metody serwisów z zamockowanymi zależnościami).
    *   **Zakres:** Logika komponentów UI (renderowanie warunkowe, obsługa zdarzeń), funkcje w `src/lib/utils.ts`, logika walidacji w schematach Zod, metody `AnalysisService` i `OpenRouterService` z mockami Supabase/fetch/LLM.
    *   **Narzędzia:** Vitest
*   **Testy Integracyjne (Integration Tests):**
    *   **Cel:** Sprawdzenie poprawności współpracy pomiędzy różnymi modułami i komponentami systemu.
    *   **Zakres:** Interakcja komponentów React (np. formularz -> lista wyników), współpraca serwisów (`AnalysisService` z `OpenRouterService`, `AnalysisService` z `SupabaseClient`), działanie endpointów API Astro wraz z middlewarem i logiką serwisową, interakcje z bazą danych (testy z użyciem lokalnej/testowej instancji Supabase).
    *   **Narzędzia:** Vitest, Supertest (dla API routes), lokalna instancja Supabase (Docker).
*   **Testy End-to-End (E2E Tests):**
    *   **Cel:** Weryfikacja kompletnych przepływów użytkownika z perspektywy przeglądarki, symulując rzeczywiste interakcje.
    *   **Zakres:** Pełne scenariusze: Rejestracja -> Logowanie -> Utworzenie analizy -> Wyświetlenie wyników -> Filtrowanie -> Wylogowanie. Testowanie responsywności.
    *   **Narzędzia:** Playwright
*   **Testy API:**
    *   **Cel:** Bezpośrednia weryfikacja endpointów API pod kątem zgodności z kontraktem, obsługi danych wejściowych, autentykacji/autoryzacji i odpowiedzi.
    *   **Zakres:** Wszystkie endpointy w `src/pages/api/` (`/api/analyses`, `/api/analyses/[id]`, `/api/auth/*`). Testowanie poprawnych żądań, błędnych danych, braku autoryzacji, obsługi błędów serwera.
    *   **Narzędzia:** Postman, curl, Supertest (w ramach testów integracyjnych backendu).
*   **Testy Wydajnościowe (Podstawowe):**
    *   **Cel:** Wstępna ocena czasu odpowiedzi API (szczególnie `/api/analyses`) i czasu ładowania kluczowych stron.
    *   **Zakres:** Mierzenie czasu odpowiedzi dla endpointu analizy przy różnych długościach tekstu (w granicach limitów), czas ładowania strony `/dashboard` i `/analyses/[id]`.
    *   **Narzędzia:** Narzędzia deweloperskie przeglądarki (Network, Performance), Lighthouse, ew. proste skrypty k6.
*   **Testy Bezpieczeństwa (Podstawowe):**
    *   **Cel:** Identyfikacja podstawowych luk bezpieczeństwa.
    *   **Zakres:** Weryfikacja działania RLS (gdy włączone), sprawdzanie flag ciasteczek sesyjnych, testowanie walidacji danych wejściowych pod kątem XSS (w polach tekstowych), próby dostępu do zasobów innego użytkownika (poprzez API lub URL).
    *   **Narzędzia:** Narzędzia deweloperskie przeglądarki, Postman/curl, manualna inspekcja kodu.
*   **Testy Użyteczności (Manualne):**
    *   **Cel:** Ocena intuicyjności, przejrzystości i ogólnego doświadczenia użytkownika.
    *   **Zakres:** Przepływy rejestracji, logowania, tworzenia analizy, przeglądania wyników. Ocena komunikatów błędów i informacji zwrotnych.
    *   **Metodyka:** Testy eksploracyjne, realizacja scenariuszy przez testera.
*   **Testy Kompatybilności:**
    *   **Cel:** Zapewnienie poprawnego działania aplikacji w różnych środowiskach.
    *   **Zakres:** Testowanie na najnowszych wersjach głównych przeglądarek (Chrome, Firefox, Safari, Edge) na systemach Windows i macOS. Testowanie na różnych rozdzielczościach ekranu (desktop, tablet, mobile).
*   **Testy Regresyjne:**
    *   **Cel:** Upewnienie się, że wprowadzone zmiany (naprawa błędów, nowe funkcje) nie spowodowały pojawienia się nowych błędów w istniejących funkcjonalnościach.
    *   **Zakres:** Uruchomienie zdefiniowanego zestawu testów (głównie automatycznych - jednostkowych, integracyjnych, E2E) po każdej istotnej zmianie w kodzie.

## 4. Scenariusze Testowe dla Kluczowych Funkcjonalności

Poniżej przedstawiono przykładowe, wysokopoziomowe scenariusze testowe. Szczegółowe przypadki testowe zostaną opracowane na ich podstawie.

### 4.1. Autentykacja

*   **TC-AUTH-01 (Rejestracja - Sukces):** Użytkownik poprawnie wypełnia formularz rejestracji, konto zostaje utworzone, użytkownik jest zalogowany i przekierowany.
*   **TC-AUTH-02 (Rejestracja - Email zajęty):** Użytkownik próbuje zarejestrować się przy użyciu istniejącego adresu email, otrzymuje komunikat o błędzie.
*   **TC-AUTH-03 (Rejestracja - Błędne dane):** Użytkownik wprowadza nieprawidłowy format emaila lub hasła niespełniające wymagań/niezgodne, otrzymuje błędy walidacji przy polach.
*   **TC-AUTH-04 (Logowanie - Sukces):** Użytkownik podaje poprawne dane logowania, zostaje zalogowany i przekierowany. Sesja jest utrzymywana.
*   **TC-AUTH-05 (Logowanie - Błędne dane):** Użytkownik podaje błędny email lub hasło, otrzymuje komunikat o błędzie, pozostaje na stronie logowania.
*   **TC-AUTH-06 (Wylogowanie):** Zalogowany użytkownik klika "Wyloguj", sesja jest kończona, użytkownik jest przekierowany.
*   **TC-AUTH-07 (Odzyskiwanie Hasła - Inicjacja):** Użytkownik podaje poprawny email na stronie odzyskiwania, otrzymuje komunikat o wysłaniu linku (niezależnie od istnienia emaila).
*   **TC-AUTH-08 (Reset Hasła - Sukces):** Użytkownik przechodzi przez link resetujący, poprawnie ustawia nowe hasło (spełniające wymagania, zgodne potwierdzenie), otrzymuje potwierdzenie i może zalogować się nowym hasłem.
*   **TC-AUTH-09 (Reset Hasła - Błędne dane):** Użytkownik wprowadza hasła niespełniające wymagań lub niezgodne, otrzymuje błędy walidacji.
*   **TC-AUTH-10 (Dostęp do stron chronionych):** Niezalogowany użytkownik próbuje uzyskać dostęp do `/dashboard` lub `/analyses/:id`, zostaje przekierowany do `/login`.

### 4.2. Analiza Tekstu

*   **TC-ANL-01 (Analiza - Gość - Sukces):** Gość wprowadza poprawny tekst (< 1000 znaków), analiza jest przeprowadzana (model free), wyniki są wyświetlane (max 2 problemy).
*   **TC-ANL-02 (Analiza - Gość - Limit znaków):** Gość wprowadza tekst > 1000 znaków, przycisk "Analizuj" jest nieaktywny lub wyświetlany jest komunikat o błędzie/limicie.
*   **TC-ANL-03 (Analiza - Gość - Pusty tekst):** Gość próbuje analizować pusty tekst, otrzymuje błąd walidacji.
*   **TC-ANL-04 (Analiza - Zalogowany - Sukces):** Zalogowany użytkownik wprowadza poprawny, długi tekst (> 1000 znaków), analiza jest przeprowadzana (model premium), wszystkie wyniki są dostępne. Analiza pojawia się w historii.
*   **TC-ANL-05 (Analiza - Zalogowany - Pusty tekst):** Zalogowany użytkownik próbuje analizować pusty tekst, otrzymuje błąd walidacji.
*   **TC-ANL-06 (Analiza - Obsługa błędu LLM):** Podczas analizy OpenRouter.ai zwraca błąd (np. 500, 429), użytkownik otrzymuje czytelny komunikat o niepowodzeniu analizy. Status analizy w DB (dla zalogowanego) to 'failed'.
*   **TC-ANL-07 (Analiza - Obsługa błędu DB):** Podczas zapisu wyników do Supabase występuje błąd, użytkownik otrzymuje komunikat.
*   **TC-ANL-08 (Analiza - Różne typy dokumentów):** Wprowadzenie tekstu typowej klauzuli informacyjnej (Art. 13/14) i typowej zgody (Art. 7) - weryfikacja, czy analiza zwraca sensowne (choć niekoniecznie prawnie doskonałe) wyniki dla obu typów.

### 4.3. Wyświetlanie Wyników i Interfejs

*   **TC-UI-01 (Widok Szczegółów - Gość):** Poprawne wyświetlenie analizowanego tekstu, max 2 problemów z kategoriami i sugestiami, zachęta do logowania.
*   **TC-UI-02 (Widok Szczegółów - Zalogowany):** Poprawne wyświetlenie analizowanego tekstu, wszystkich problemów z kategoriami i sugestiami.
*   **TC-UI-03 (Filtrowanie):** Poprawne działanie filtrów kategorii problemów - lista problemów aktualizuje się zgodnie z wyborem. Działa dla Gościa i Zalogowanego.
*   **TC-UI-04 (Paginacja/Ładowanie problemów - Zalogowany):** Jeśli problemów jest więcej niż limit na stronę, przycisk "Załaduj więcej" lub infinite scroll poprawnie doładowuje kolejne problemy.
*   **TC-UI-05 (Pusta lista problemów):** Gdy analiza nie wykryje problemów lub filtry wyeliminują wszystkie, wyświetlany jest odpowiedni komunikat.
*   **TC-UI-06 (Kopiowanie sugestii):** Przycisk kopiowania działa poprawnie dla widocznych sugestii.
*   **TC-UI-07 (Responsywność):** Kluczowe widoki (formularz, wyniki) poprawnie wyświetlają się i są używalne na różnych szerokościach ekranu (desktop, tablet, mobile). Układ kolumnowy/stackowany w `AnalysisDetailsView`.
*   **TC-UI-08 (Nawigacja):** Poprawne działanie linków w NavBar, dynamiczne wyświetlanie opcji Zaloguj/Zarejestruj vs Panel/Wyloguj.

### 4.4. Historia Analiz (dla zalogowanych)

*   **TC-HIST-01 (Wyświetlanie historii):** Zalogowany użytkownik widzi listę swoich poprzednich analiz w odpowiedniej sekcji.
*   **TC-HIST-02 (Dostęp do szczegółów):** Kliknięcie na wpis w historii poprawnie przenosi do widoku szczegółów danej analizy.
*   **TC-HIST-03 (Sortowanie):** (Jeśli dotyczy MVP) Sprawdzenie działania opcji sortowania listy historii.

## 5. Środowisko Testowe

*   **Środowisko lokalne (Development):**
    *   System operacyjny: Windows, macOS, Linux (zgodnie ze środowiskiem deweloperskim).
    *   Przeglądarki: Najnowsza wersja Chrome lub Firefox.
    *   Backend: Aplikacja uruchomiona lokalnie (`npm run dev`).
    *   Baza danych: Lokalna instancja Supabase uruchomiona przez Supabase CLI (Docker).
    *   Zależności: Dostęp do OpenRouter.ai (wymagane klucze API w `.env`).
*   **Środowisko testowe (Staging):**
    *   Infrastruktura: Odzwierciedlenie środowiska produkcyjnego (DigitalOcean, Docker).
    *   Baza danych: Dedykowana instancja Supabase dla Staging.
    *   Dostęp: Dostępne dla zespołu QA i PO.
    *   Cel: Testy akceptacyjne, regresyjne, wydajnościowe przed wdrożeniem na produkcję.
*   **Środowisko produkcyjne (Production):**
    *   Infrastruktura: DigitalOcean, Docker.
    *   Baza danych: Produkcyjna instancja Supabase.
    *   Cel: Testy typu "smoke test" po wdrożeniu nowej wersji.
*   **Przeglądarki i Urządzenia:**
    *   Desktop: Chrome (latest), Firefox (latest), Safari (latest), Edge (latest).
    *   Mobile/Tablet: Symulacja w narzędziach deweloperskich Chrome/Firefox dla różnych rozdzielczości (np. iPhone, iPad, typowy Android). Testy na fizycznych urządzeniach (jeśli dostępne).

## 6. Narzędzia do Testowania

*   **Testy Jednostkowe/Integracyjne:** Vitest
*   **Testy E2E:** Playwright (preferowany ze względu na lepszą obsługę nowoczesnych frameworków jak Astro)
*   **Testy API:** Postman (manualne i automatyzacja), curl, Supertest (w ramach testów integracyjnych Node.js).
*   **Zarządzanie Testami i Błędami:** GitHub Issues (lub dedykowane narzędzie jak Jira, TestRail - w zależności od preferencji zespołu).
*   **Testy Wydajnościowe (podstawowe):** Lighthouse, Narzędzia Deweloperskie Przeglądarki.
*   **Kontrola Wersji:** Git, GitHub.
*   **CI/CD:** GitHub Actions (do automatycznego uruchamiania testów).
*   **Mockowanie:** Vitest Mocks (dla testów jednostkowych/integracyjnych), MSW (Mock Service Worker) dla mockowania API w testach E2E/frontendowych.

## 7. Harmonogram Testów

Harmonogram testów będzie ściśle powiązany z cyklem rozwojowym projektu (np. sprinty).

*   **Faza planowania:** Równolegle z rozwojem funkcjonalności - tworzenie i aktualizacja planu testów, przypadków testowych.
*   **Testy jednostkowe i integracyjne:** Przeprowadzane przez deweloperów podczas implementacji i w ramach CI.
*   **Testy funkcjonalne i E2E:** Przeprowadzane przez QA po dostarczeniu funkcjonalności na środowisko testowe/staging.
*   **Testy regresyjne:** Wykonywane przed każdym wydaniem nowej wersji na produkcję.
*   **Testy akceptacyjne:** Przeprowadzane przez Product Ownera/interesariuszy na środowisku staging.
*   **Smoke Testy:** Wykonywane przez QA/DevOps bezpośrednio po wdrożeniu na produkcję.

*Szacunkowy czas na główne fazy testowania MVP zostanie określony po finalizacji zakresu sprintów.*

## 8. Kryteria Akceptacji Testów

### 8.1. Kryteria Wejścia (Rozpoczęcia Testów Fazy)

*   Plan testów został zatwierdzony.
*   Środowisko testowe jest gotowe i stabilne.
*   Build aplikacji został pomyślnie wdrożony na środowisko testowe.
*   Dokumentacja funkcjonalna (PRD, User Stories) jest dostępna.
*   Wszystkie testy jednostkowe i integracyjne (w ramach CI) zakończyły się sukcesem.

### 8.2. Kryteria Wyjścia (Zakończenia Testów Fazy / Wydania)

*   Wszystkie zaplanowane przypadki testowe zostały wykonane.
*   Osiągnięto zdefiniowany poziom pokrycia testami (jeśli mierzony).
*   **Krytyczne i Poważne Błędy:** 100% zidentyfikowanych błędów krytycznych (Blocker) i poważnych (Critical/Major) zostało naprawionych i pomyślnie przetestowanych (re-test i regresja).
*   **Błędy Średnie i Niskie:** Liczba otwartych błędów o niższym priorytecie (Minor, Trivial) jest na akceptowalnym poziomie, uzgodnionym z Product Ownerem.
*   Wszystkie kluczowe scenariusze E2E zakończyły się sukcesem.
*   Dokumentacja testowa (wyniki, raporty błędów) jest kompletna i zaktualizowana.
*   Product Owner formalnie zaakceptował wyniki testów (Testy Akceptacyjne Użytkownika - UAT).

## 9. Role i Odpowiedzialności w Procesie Testowania

*   **Inżynier QA (Tester):**
    *   Tworzenie i utrzymanie planu testów oraz przypadków testowych.
    *   Wykonywanie testów manualnych (funkcjonalnych, eksploracyjnych, użyteczności, kompatybilności).
    *   Implementacja i utrzymanie testów automatycznych (E2E, API - w zależności od ustaleń w zespole).
    *   Raportowanie i śledzenie błędów.
    *   Weryfikacja naprawionych błędów (re-testy).
    *   Przeprowadzanie testów regresyjnych.
    *   Komunikacja statusu testów i ryzyka.
*   **Deweloperzy:**
    *   Implementacja testów jednostkowych i integracyjnych dla swojego kodu.
    *   Utrzymanie działania testów w ramach CI/CD.
    *   Naprawa zgłoszonych błędów.
    *   Wsparcie QA w analizie i reprodukcji błędów.
    *   Udział w przeglądach kodu pod kątem testowalności.
*   **Product Owner (PO):**
    *   Dostarczenie wymagań i kryteriów akceptacji.
    *   Priorytetyzacja funkcjonalności i błędów.
    *   Przeprowadzenie testów akceptacyjnych użytkownika (UAT).
    *   Podejmowanie decyzji o wydaniu produktu na podstawie wyników testów i oceny ryzyka.
*   **DevOps (jeśli dotyczy):**
    *   Konfiguracja i utrzymanie środowisk testowych i produkcyjnych.
    *   Konfiguracja i utrzymanie pipeline'u CI/CD, w tym automatyzacji testów.
    *   Monitorowanie aplikacji na produkcji.

## 10. Procedury Raportowania Błędów

*   **Narzędzie:** GitHub Issues (lub inne ustalone narzędzie).
*   **Proces Zgłaszania:**
    1.  Sprawdzenie, czy błąd nie został już zgłoszony.
    2.  Utworzenie nowego zgłoszenia (Issue).
    3.  Wypełnienie zgłoszenia zgodnie ze szablonem.
*   **Wymagane Informacje w Zgłoszeniu Błędu:**
    *   **Tytuł:** Krótki, zwięzły opis problemu.
    *   **Środowisko:** Wersja aplikacji, przeglądarka/OS, środowisko (Local, Staging, Prod).
    *   **Kroki do Reprodukcji:** Dokładna, numerowana lista kroków pozwalająca na odtworzenie błędu.
    *   **Wynik Oczekiwany:** Co powinno się wydarzyć.
    *   **Wynik Aktualny:** Co faktycznie się wydarzyło.
    *   **Priorytet/Ważność (Severity):** (np. Blocker, Critical, Major, Minor, Trivial) - wstępnie określony przez QA.
    *   **Zrzuty Ekranu/Nagrania Wideo:** Jeśli to możliwe i pomocne.
    *   **Dodatkowe Informacje:** Wszelkie inne istotne dane (np. logi konsoli przeglądarki, dane testowe).
*   **Cykl Życia Błędu:**
    *   `New/Open`: Nowo zgłoszony błąd.
    *   `Assigned/In Progress`: Deweloper pracuje nad naprawą.
    *   `Resolved/Fixed`: Deweloper oznaczył błąd jako naprawiony (oczekuje na weryfikację QA).
    *   `In Testing/Verification`: QA weryfikuje naprawę na środowisku testowym.
    *   `Closed`: QA potwierdził poprawność naprawy. Błąd zamknięty.
    *   `Reopened`: QA stwierdził, że błąd nadal występuje lub naprawa wprowadziła regresję. Błąd wraca do `Assigned`.
    *   `Rejected/Won't Fix`: Błąd odrzucony (np. duplikat, nie jest błędem, odłożony na później).
*   **Priorytetyzacja:** Product Owner i zespół ustalają priorytet biznesowy naprawy błędów.
