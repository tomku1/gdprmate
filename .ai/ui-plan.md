# Architektura UI dla GdprMate

## 1. Przegląd struktury UI
Aplikacja dzieli się na dwie główne strefy: publiczną (rejestracja, logowanie) i chronioną (dashboard i widoki analiz). Po zalogowaniu użytkownik trafia na dashboard z dwoma kartami: "Nowa analiza" i "Historia analiz". Wyniki analizy są dostępne w dedykowanym widoku szczegółów. Nawigacja realizowana jest przez komponent TabNavigation i trasy chronione przez ProtectedRoute.

## 2. Lista widoków

### 2.1. Ekran uwierzytelniania
- Ścieżka: /login i /register
- Główny cel: Umożliwienie użytkownikowi logowania oraz rejestracji.
- Kluczowe informacje: Formularze z polami e-mail i hasło; wiadomości o błędach uwierzytelniania.
- Kluczowe komponenty: Formularz logowania/rejestracji, komponent walidacji, przyciski, komunikaty błędów.
- UX, dostępność i względy bezpieczeństwa: Prosty formularz, czytelne komunikaty błędów, obsługa klawiatury, zabezpieczenia JWT.

### 2.2. Dashboard – Nowa analiza
- Ścieżka: `/dashboard` (domyślnie zakładka Nowa analiza)
- Cel: Wprowadzenie tekstu i uruchomienie analizy GDPR
- Kluczowe informacje: TextArea z licznikiem (0–10 000 znaków), stan przycisku "Analizuj", spinner ładowania
- Kluczowe komponenty: `TextAreaWithCounter`, `AnalyseButton`, `SpinnerOverlay`, `LanguageBadge`
- UX & dostępność & bezpieczeństwo: walidacja długości, ARIA dla textarea, disable button, ochrona przed XSS przez sanitizację

### 2.3. Dashboard – Historia analiz
- Ścieżka: `/dashboard?tab=history`
- Cel: Przeglądanie i nawigacja po poprzednich analizach
- Kluczowe informacje: lista analiz (preview, data utworzenia, liczba błędów według kategorii), sortowanie, infinite scroll
- Kluczowe komponenty: `SortDropdown`, `InfiniteScrollList`, `HistoryItemCard`
- UX & dostępność & bezpieczeństwo: czytelne priorytety błędów (badges), ARIA dla listy, puste stany, ochrona RLS

### 2.4. Szczegóły analizy
- Ścieżka: `/analyses/:id`
- Cel: Wyświetlenie wyników analizy i interakcje z sugestiami
- Kluczowe informacje: podświetlony tekst dokumentu, filtry kategorii, lista IssueCard, przyciski "Kopiuj", "Odrzuć"
- Kluczowe komponenty: `DocumentViewer`, `FilterControls`, `InfiniteScrollIssues`, `IssueCard`, 
- UX & dostępność & bezpieczeństwo: dwa układy (dwa kolumny na desktop, stack na mobile), ARIA dla accordion/filtrowania, obsługa 403/404

### 2.5. Panel użytkownika
- Ścieżka: `/profile`
- Główny cel: Zarządzanie informacjami o koncie użytkownika i ustawieniami.
- Kluczowe informacje: Dane użytkownika, opcje edycji profilu, przycisk wylogowania.
- Kluczowe komponenty: `ProfileForm`, `PasswordChangeForm`, `DeleteAccountButton`, `LogoutButton`
- UX, dostępność i względy bezpieczeństwa: Bezpieczne wylogowanie, łatwy dostęp do ustawień, prosty i czytelny interfejs, potwierdzenia dla krytycznych akcji, ARIA dla formularzy.


## 3. Mapa podróży użytkownika
1. Użytkownik nie ma konta -> `/auth/register` -> wypełnia formularz -> zostaje zalogowany -> przejście do dashboard.
2. Użytkownik zalogowany -> widok Nowa analiza -> wkleja lub wpisuje tekst -> przycisk "Analizuj" → spinner podczas analizy.
3. Po zakończeniu analizy: wpis jest prepended do Historii, redirect do `/analyses/:id`.
4. W widoku szczegółów użytkownik:
   - Przegląda podświetlenia i listę IssueCard,
   - Filtrowanie po kategoriach,
   - Kopiuje sugestię (POST /api/issues/{id}/interactions), otrzymuje toast,
5. Użytkownik przechodzi do zakładki Historia analiz, sortuje lub przewija z infinite scroll, klika wpis -> `/analyses/:id`.
6. W każdej chwili może otworzyć menu użytkownika i wylogować się, przejść do `/auth/login`.

## 4. Układ i struktura nawigacji
- **Header (stały)**: logo/aplikacja + jeśli zalogowany: TabNavigation ("Nowa analiza", "Historia analiz") + UserMenu (avatar + Wyloguj).
- **Publiczne trasy**: `/auth/login`, `/auth/register` (bez Header Tabs, ale z logo i wrapperem auth).
- **Chronione trasy**: `/dashboard`, `/analyses/:id` zabezpieczone przez `ProtectedRoute` z przekierowaniem do login przy 401.
- **TabNavigation**: zmienia widok w dashboardzie bez przeładowania, synchronizuje query param `tab`.
- **Back navigation**: w widoku szczegółów przycisk powrotu do historii.

## 5. Kluczowe komponenty
- **Komponenty analizy tekstu**: Interaktywne pole tekstowe z licznikiem znaków i walidacją limitu, wraz z przyciskiem uruchamiającym proces analizy GDPR z wizualnym wskaźnikiem postępu.
- **System wyświetlania wyników**: Komponenty prezentujące wyniki analizy z podświetleniami problematycznych fragmentów tekstu oraz możliwością filtrowania według kategorii naruszeń.
- **Komponenty historii analiz**: Interaktywna lista poprzednich analiz z dynamicznym ładowaniem przy przewijaniu, zawierająca podgląd tekstu, datę utworzenia i oznaczenia kategorii naruszeń.
- **Karty problemów GDPR**: Komponenty wyświetlające szczegóły wykrytych naruszeń z kolorowymi oznaczeniami kategorii, opisem problemu, sugerowanym rozwiązaniem oraz przyciskami do kopiowania i odrzucania sugestii.
- **System nawigacji i powtórnej analizy**: Elementy umożliwiające powrót do poprzednich widoków oraz ponowne wczytanie tekstu do edycji i analizy.
- **System powiadomień**: Komponent wyświetlający komunikaty o sukcesach i błędach w prawym górnym rogu ekranu.
- **Komponenty zabezpieczeń**: Mechanizmy ochrony tras wymagających uwierzytelnienia oraz zarządzania stanem autoryzacji użytkownika z obsługą żądań HTTP.
