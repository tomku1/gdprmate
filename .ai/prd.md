# Dokument wymagań produktu (PRD) - GdprMate

## 1. Przegląd produktu

GdprMate to aplikacja webowa pełniąca rolę asystenta zgodności z GDPR (GDPR). Jej głównym celem jest pomoc użytkownikom w szybkiej i efektywnej analizie dokumentów prawnych, takich jak klauzule informacyjne i zgody, pod kątem zgodności z podstawowymi wymaganiami GDPR (w szczególności art. 7, 13 i 14). Aplikacja automatycznie identyfikuje potencjalne braki lub błędy w dokumentach, prezentuje je w czytelny sposób wraz z kategoriami ważności (krytyczne, ważne, drobne) i sugeruje poprawne sformułowania. GdprMate oferuje system kont użytkowników, umożliwiając przechowywanie wgranych dokumentów i historii przeprowadzonych analiz. Aplikacja jest przeznaczona dla osób i organizacji, które przetwarzają dane osobowe i potrzebują prostego narzędzia do weryfikacji zgodności swoich dokumentów. Interfejs użytkownika jest responsywny, co pozwala na korzystanie z aplikacji na różnych urządzeniach.

## 2. Problem użytkownika

Obecnie zapewnienie zgodności dokumentów z wymogami Rozporządzenia o Ochronie Danych Osobowych (GDPR) jest procesem złożonym, czasochłonnym i obarczonym ryzykiem błędów. Wiele organizacji, zwłaszcza mniejszych, nie dysponuje dedykowanymi zasobami prawnymi, a samodzielna analiza i interpretacja przepisów jest trudna. Brakuje prostego, dostępnego narzędzia, które pozwoliłoby użytkownikom bez specjalistycznej wiedzy prawniczej szybko sprawdzić kluczowe dokumenty (klauzule informacyjne, zgody marketingowe itp.) pod kątem fundamentalnych wymagań GDPR. Manualna weryfikacja zajmuje dużo czasu, a ewentualne błędy mogą prowadzić do poważnych konsekwencji prawnych i finansowych. Użytkownicy potrzebują narzędzia, które zautomatyzuje ten proces, wskaże konkretne problemy w ich dokumentach i zaproponuje gotowe do użycia, poprawne sformułowania.

## 3. Wymagania funkcjonalne

> **Uwaga:** Analiza dokumentów i generowanie sugestii poprawek są realizowane przy pomocy dużych modeli językowych (LLM) dostarczanych przez usługę OpenRouter.ai. W wersji MVP, dobór konkretnego modelu LLM zależy od statusu użytkownika (Gość vs Zalogowany), co wpływa na jakość i dostępność wyników analizy.

### WF-001: Analiza klauzul informacyjnych
   - System musi umożliwiać automatyczną analizę treści klauzul informacyjnych pod kątem zgodności z wymogami art. 13 i 14 GDPR.
   - Analiza powinna identyfikować brakujące elementy wymagane przez te artykuły.
   - *Gość (anonimowy):* Limit 1 analiza demo dziennie, limit 1000 znaków, używany model free LLM (np. google/gemini-1.0-free).
   - *Użytkownik zalogowany:* Brak limitu analiz i znaków, używany model premium LLM (np. google/gemini-2.0-flash-exp:free).

### WF-002: Analiza treści zgód
   - System musi umożliwiać automatyczną analizę treści zgód (np. marketingowych, na newsletter) pod kątem zgodności z wymogami art. 7 GDPR.
   - Analiza powinna weryfikować m.in. dobrowolność, konkretność, świadomość i jednoznaczność zgody.
   - *Gość (anonimowy):* Limit 1 analiza demo dziennie, limit 1000 znaków, używany model free LLM (np. google/gemini-1.0-free).
   - *Użytkownik zalogowany:* Brak limitu analiz i znaków, używany model premium LLM (np. google/gemini-2.0-flash-exp:free).

### WF-003: Obsługiwane typy dokumentów
   - System musi obsługiwać analizę następujących typów dokumentów: Klauzule informacyjne (Privacy Notices), Klauzule zgody (Consent Clauses), Zgody na newsletter i marketing (Newsletter and Marketing Consents), Klauzule dotyczące bezpośredniego i pośredniego zbierania danych (Direct & Indirect Data Collection Clauses).

### WF-004: Metody wprowadzania dokumentów
   - Użytkownik musi mieć możliwość wprowadzenia tekstu do analizy poprzez:
     - Kopiuj/Wklej do dedykowanego pola tekstowego.
   - *Gość (anonimowy):* Limit 1000 znaków na wprowadzany tekst.
   - *Użytkownik zalogowany:* Brak limitu znaków na wprowadzany tekst.

### WF-005: Wyświetlanie wyników analizy
   - Wyniki analizy muszą być prezentowane w sposób czytelny i zrozumiały.
   - Wykryte błędy lub braki muszą być jasno wskazane, z informacją czego brakuje lub co jest sformułowane błędnie.
   - Błędy powinny być kategoryzowane (np. krytyczne, ważne, drobne) i oznaczane wizualnie (np. kolorami).
   - Analiza wyników realizowana jest przy pomocy dużego modelu językowego (LLM) udostępnianego przez usługę OpenRouter.ai (model zależny od statusu użytkownika).
   - *Gość (anonimowy):* Wyświetlane są tylko 2 pierwsze wykryte problemy. Pod nimi znajduje się zachęta do zalogowania się w celu zobaczenia pełnych wyników.
   - *Użytkownik zalogowany:* Wyświetlane są wszystkie wykryte problemy.

### WF-006: Generowanie sugestii poprawek
   - Dla wykrytych błędów lub braków system musi generować przykładowe, poprawne sformułowania lub klauzule.
   - Sugestie muszą być łatwe do skopiowania przez użytkownika.
   - Sugestie generowane są przez model LLM (OpenRouter.ai - model zależny od statusu użytkownika).
   - *Gość (anonimowy):* Sugestie generowane są tylko dla 2 pierwszych wyświetlanych problemów.
   - *Użytkownik zalogowany:* Sugestie generowane są dla wszystkich wykrytych problemów.

### WF-007: Konta użytkowników
   - System musi zapewniać możliwość rejestracji i logowania użytkowników.
   - Zalogowani użytkownicy muszą mieć możliwość przechowywania wgranych dokumentów i historii przeprowadzonych analiz.

### WF-008: Historia analiz
   - System musi przechowywać historię analiz przeprowadzonych przez zalogowanego użytkownika.
   - Użytkownik musi mieć możliwość przeglądania historii i powrotu do wyników poprzednich analiz.
   - *Gość (anonimowy):* Brak dostępu do historii analiz.
   - *Użytkownik zalogowany:* Pełen dostęp do historii analiz.

### WF-009: Filtrowanie i sortowanie wyników
   - Użytkownik musi mieć możliwość filtrowania wyników analizy (np. według kategorii błędu). Filtrowanie jest dostępne zarówno dla Gościa (dla widocznych 2 problemów) jak i dla Użytkownika zalogowanego.
   - Użytkownik zalogowany musi mieć możliwość sortowania listy w historii (np. według daty, typu błędu).
   - *Gość (anonimowy):* Dostępne filtrowanie dla wyświetlanych wyników. Brak możliwości sortowania (brak historii).
   - *Użytkownik zalogowany:* Dostępne filtrowanie wyników analizy oraz sortowanie historii analiz.

### WF-010: Obsługa języków
   - System w wersji MVP obsługuje tylko język polski (zarówno w interfejsie jak i analizowanych dokumentach).
   - ~~System musi być przygotowany do obsługi analizy tekstów w wielu językach (początkowo co najmniej polski i angielski).~~

### WF-011: Interfejs użytkownika
   - Interfejs aplikacji webowej musi być responsywny (RWD), zapewniając wygodne użytkowanie na różnych rozmiarach ekranów (desktop, tablet, smartfon).
   - Interfejs musi być intuicyjny i przejrzysty.

### WF-012: Bezpieczeństwo
   - Muszą być wdrożone mechanizmy uwierzytelniania i autoryzacji użytkowników.
   - Dane wejściowe muszą być walidowane.
   - Należy zastosować odpowiednie środki bezpieczeństwa danych, w tym RLS (Row-Level Security) w bazie danych, aby zapewnić, że użytkownicy mają dostęp tylko do własnych danych.

## 4. Granice produktu (Co NIE wchodzi w zakres MVP)

### Funkcje prawne
- Dostarczanie szczegółowych interpretacji prawnych, wytycznych organów nadzorczych (np. UODO) czy orzecznictwa sądowego (np. TSUE). Analiza opiera się wyłącznie na podstawowym tekście wskazanych artykułów GDPR.
- Automatyczne śledzenie i uwzględnianie wszystkich bieżących zmian w prawie ochrony danych osobowych oraz nowych interpretacjach.
- Udzielanie porad prawnych.

### Integracje i zaawansowane funkcje
- Integracje z zewnętrznymi systemami (np. CRM, systemy do zarządzania zgodami, ERP).
- Moduł do kompleksowej analizy całych procesów przetwarzania danych osobowych w organizacji.
- Zaawansowane raporty i dashboardy analityczne dla firm.
- Dedykowana aplikacja mobilna (dostępna jest jedynie responsywna aplikacja webowa).
- System powiadomień o zmianach w przepisach lub interpretacjach.
- Funkcjonalność kontroli wersji analizowanych dokumentów.
- Opcja eksportu wyników analizy do plików zewnętrznych (np. PDF, CSV).
- Zaawansowane funkcje personalizacji wykraczające poza przechowywanie historii (np. notatki, tagi - możliwe w przyszłych iteracjach).
- Moduł raportowania wykraczający poza podstawowe logowanie zdarzeń.
- Zaawansowane materiały szkoleniowe i tutoriale interaktywne (poza podstawową pomocą).
- Obsługa wielu języków - w wersji MVP wspierany jest tylko język polski. Wsparcie dla innych języków (np. angielskiego) planowane jest w przyszłych iteracjach.

## 5. Model dostępu w MVP

W wersji MVP (Minimum Viable Product) aplikacja będzie oferować dwa podstawowe tryby dostępu:

### 1. Gość (użytkownik anonimowy)
   - **Limity:**
     - 1 analiza demo dziennie.
     - Maksymalnie 1000 znaków na analizowany tekst.
   - **Model LLM:** Używany jest darmowy, podstawowy model LLM (np. `google/gemini-1.0-free`), co może wpływać na głębokość i dokładność analizy.
   - **Wyniki:** Wyświetlane są tylko 2 pierwsze wykryte problemy/błędy. Poniżej znajduje się zachęta do zalogowania się w celu zobaczenia pełnych wyników.
   - **Historia:** Brak możliwości zapisywania i przeglądania historii analiz.
   - **Funkcje dodatkowe:** Dostępne filtrowanie wyników (dla widocznych problemów).

### 2. Użytkownik zalogowany
   - **Limity:**
     - Brak limitu dziennych analiz.
     - Brak limitu znaków na analizowany tekst.
   - **Model LLM:** Używany jest model premium LLM (np. `google/gemini-2.0-flash-exp:free`), oferujący potencjalnie lepszą jakość analizy i sugestii.
   - **Wyniki:** Wyświetlane są wszystkie wykryte problemy/błędy wraz z sugestiami poprawek.
   - **Historia:** Pełny dostęp do historii przeprowadzonych analiz, możliwość powrotu do wcześniejszych wyników.
   - **Funkcje dodatkowe:** Dostępne filtrowanie wyników oraz sortowanie historii analiz.

## 6. Historyjki użytkowników

### US-001: Rejestracja nowego użytkownika
- Tytuł: Rejestracja konta w systemie
- Opis: Jako nowy użytkownik, chcę móc założyć konto w aplikacji GdprMate, podając swój adres email i hasło, aby móc korzystać z funkcji zapisywania dokumentów i historii analiz.
- Kryteria akceptacji:
    - Formularz rejestracyjny zawiera pola na adres e-mail i hasło.
    - Po poprawnym wypełnieniu formularza i weryfikacji danych konto jest aktywowane.
    - Użytkownik otrzymuje potwierdzenie pomyślnej rejestracji i zostaje zalogowany.

### US-002: Logowanie użytkownika
- Tytuł: Logowanie do aplikacji
- Opis: Jako zarejestrowany użytkownik, chcę móc zalogować się do aplikacji GdprMate przy użyciu mojego adresu email i hasła, aby uzyskać dostęp do panelu użytkownika, moich dokumentów i historii analiz.
- Kryteria akceptacji:
    - Mogę przejść do formularza logowania.
    - Mogę wprowadzić zarejestrowany adres email.
    - Mogę wprowadzić odpowiadające mu hasło.
    - Po kliknięciu "Zaloguj", system weryfikuje poprawność danych.
    - Jeśli dane są poprawne, jestem przekierowywany do mojego panelu użytkownika (dashboardu).
    - Jeśli dane są niepoprawne (błędny email lub hasło), wyświetlany jest czytelny komunikat o błędzie, a ja pozostaję na stronie logowania.
    - Sesja użytkownika jest utrzymywana po zalogowaniu.

### US-003: Wylogowanie użytkownika
- Tytuł: Wylogowanie z aplikacji
- Opis: Jako zalogowany użytkownik, chcę móc się wylogować z aplikacji, aby zakończyć moją sesję i zabezpieczyć dostęp do konta.
- Kryteria akceptacji:
    - W interfejsie użytkownika (np. w menu konta) dostępna jest opcja "Wyloguj".
    - Kliknięcie opcji "Wyloguj" kończy moją aktywną sesję.
    - Jestem przekierowywany na stronę główną lub stronę logowania.
    - Nie mam już dostępu do chronionych sekcji aplikacji bez ponownego zalogowania.

### US-004: Wprowadzenie tekstu do analizy
- Tytuł: Wprowadzenie tekstu do analizy
- Opis: Jako użytkownik (gość lub zalogowany), chcę móc wprowadzić tekst dokumentu (np. klauzuli informacyjnej) bezpośrednio do pola tekstowego w aplikacji, aby przeprowadzić jego analizę pod kątem zgodności z GDPR.
- Kryteria akceptacji:
    - W interfejsie znajduje się wyraźnie widoczne pole tekstowe do wprowadzania tekstu.
    - Pole tekstowe jest odpowiednio duże.
    - Mogę wpisać lub wkleić tekst do tego pola.
    - Pole tekstowe zachowuje formatowanie tekstu (nowe linie, akapity).
    - Po wprowadzeniu tekstu dostępny jest wyraźny przycisk "Analizuj".
    - System informuje o minimalnej i maksymalnej długości tekstu do analizy (różne limity dla gościa i zalogowanego).
    - *Gość:* Jeśli tekst przekracza 1000 znaków, wyświetlany jest komunikat o limicie i zachęta do zalogowania.
    - *Zalogowany:* Brak limitu znaków (lub bardzo wysoki limit techniczny).
    - Jeśli tekst jest za krótki, wyświetlany jest odpowiedni komunikat (niezależnie od statusu).

### US-005: Przeprowadzenie analizy zgodności
- Tytuł: Uruchomienie analizy dokumentu
- Opis: Jako użytkownik (gość lub zalogowany), po wprowadzeniu tekstu do pola tekstowego, chcę móc uruchomić proces analizy tego tekstu pod kątem zgodności z art. 7, 13 i 14 GDPR, z uwzględnieniem limitów i modelu LLM przypisanego do mojego statusu.
- Kryteria akceptacji:
    - Po wprowadzeniu tekstu (i spełnieniu warunków długości) widoczny jest przycisk "Analizuj".
    - Kliknięcie przycisku "Analizuj" inicjuje proces analizy - komunikacja z modelami przez usługę Openrouter.ai.
    - *Gość:* System sprawdza limit 1 analizy demo na dzień. Jeśli limit wyczerpany, wyświetla komunikat. Używany jest model free LLM.
    - *Zalogowany:* Brak limitu dziennych analiz. Używany jest model premium LLM.
    - Proces analizy realizowany jest przez odpowiedni model LLM (free/premium) poprzez usługę OpenRouter.ai.
    - Użytkownik otrzymuje informację zwrotną, że analiza jest w toku (np. animacja ładowania, komunikat).
    - Analiza obejmuje sprawdzenie zgodności z art. 7 (dla zgód), art. 13 i 14 (dla klauzul informacyjnych) GDPR.
    - Po zakończeniu analizy, jej wyniki są dostępne do wyświetlenia.
    - *Zalogowany:* Wyniki są zapisywane i powiązane z moim kontem użytkownika. Analizowany tekst jest zapisywany w historii użytkownika.
    - *Gość:* Wyniki nie są zapisywane w historii.
    - Jestem powiadamiany o zakończeniu analizy i mogę przejść do widoku wyników.

### US-006: Wyświetlanie wyników analizy
- Tytuł: Przeglądanie wyników analizy
- Opis: Jako użytkownik (gość lub zalogowany), po zakończeniu analizy dokumentu, chcę zobaczyć jej wyniki w sposób jasny i zrozumiały, w tym listę wykrytych błędów/braków (zgodnie z limitami dla gościa), ich kategorie oraz sugerowane poprawki.
- Kryteria akceptacji:
    - Po zakończeniu analizy jestem przekierowywany do widoku wyników lub otrzymuję link/przycisk do tego widoku.
    - Widok wyników prezentuje podsumowanie analizy.
    - *Gość:* Wyświetlana jest lista max. 2 pierwszych wykrytych problemów. Pod listą znajduje się link/przycisk "Zaloguj się lub zarejestruj, aby zobaczyć wszystkie wyniki".
    - *Zalogowany:* Wyświetlana jest pełna lista wykrytych problemów (błędów, braków).
    - Każdy wyświetlony problem ma przypisaną kategorię (np. Krytyczny, Ważny, Drobny).
    - Kategorie są wizualnie rozróżnione (np. kolorami).
    - Dla każdego wyświetlonego problemu wyświetlany jest opis wyjaśniający, na czym polega błąd lub czego brakuje w dokumencie.
    - Dla każdego wyświetlonego problemu wyświetlane są konkretne sugestie poprawek lub przykładowe prawidłowe sformułowania (generowane przez odpowiedni model LLM).
    - Widok wyników jest powiązany z konkretnym analizowanym tekstem (dla zalogowanego również w kontekście historii).

### US-007: Kopiowanie sugerowanych poprawek (Zmieniono numerację z US-006 na US-007)
- Tytuł: Kopiowanie sugestii
- Opis: Jako użytkownik (gość lub zalogowany), przeglądając wyniki analizy, chcę mieć możliwość łatwego skopiowania tekstu sugerowanej poprawki (dla widocznych problemów) do schowka, aby móc ją wkleić do edytowanego przeze mnie dokumentu.
- Kryteria akceptacji:
    - Obok każdej wyświetlonej sugestii poprawki znajduje się przycisk/ikona "Kopiuj".
    - Kliknięcie tego przycisku/ikony kopiuje tekst danej sugestii do schowka systemowego.
    - Otrzymuję wizualne potwierdzenie, że tekst został skopiowany (np. zmiana ikony, krótki komunikat "Skopiowano!").
    - *Gość:* Mogę kopiować sugestie tylko dla 2 wyświetlonych problemów.

### US-008 Przeglądanie historii analiz
- Tytuł: Dostęp do historii analiz (tylko dla zalogowanych)
- Opis: Jako **zalogowany** użytkownik, chcę mieć dostęp do listy wszystkich moich poprzednich analiz, abym mógł wrócić do wcześniejszych wyników lub sprawdzić, jakie teksty już analizowałem.
- Kryteria akceptacji:
    - W panelu użytkownika dostępna jest sekcja "Historia analiz".
    - Sekcja ta wyświetla listę przeprowadzonych przeze mnie analiz.
    - Każdy wpis na liście zawiera fragment analizowanego tekstu oraz datę przeprowadzenia analizy.
    - Lista jest posortowana domyślnie od najnowszej analizy.
    - Mogę kliknąć na wybrany wpis w historii, aby przejść do szczegółowego widoku wyników tej konkretnej analizy.
    - *Gość:* Sekcja "Historia analiz" jest wyszarzona z informacją o konieczności logowania.

### US-009: Filtrowanie wyników analizy
- Tytuł: Filtrowanie listy błędów (dla gościa i zalogowanego)
- Opis: Jako użytkownik (gość lub zalogowany), przeglądając szczegółowe wyniki analizy (widoczne problemy), chcę móc filtrować listę wykrytych problemów według ich kategorii (Krytyczny, Ważny, Drobny), aby skupić się na najważniejszych kwestiach.
- Kryteria akceptacji:
    - W widoku wyników analizy dostępne są kontrolki umożliwiające filtrowanie (np. checkboxy, przyciski).
    - Mogę wybrać jedną lub więcej kategorii błędów do wyświetlenia.
    - Po wybraniu filtra lista problemów jest dynamicznie aktualizowana, pokazując tylko te (spośród widocznych), które pasują do wybranego filtra.
    - Mogę łatwo usunąć filtry, aby ponownie zobaczyć wszystkie widoczne problemy.
    - *Gość:* Filtrowanie działa na max. 2 wyświetlonych problemach.
    - *Zalogowany:* Filtrowanie działa na wszystkich wyświetlonych problemach.

### US-010: Sortowanie historii analiz
- Tytuł: Sortowanie listy historii (tylko dla zalogowanych)
- Opis: Jako **zalogowany** użytkownik, przeglądając historię analiz, chcę móc sortować listę analiz według daty analizy, aby łatwiej znaleźć interesującą mnie analizę.
- Kryteria akceptacji:
    - W widoku historii analiz dostępne są opcje sortowania (np. rozwijana lista, klikalne nagłówki kolumn).
    - Mogę wybrać kierunek sortowania (rosnąco/malejąco).
    - Lista analiz jest dynamicznie aktualizowana zgodnie z wybranymi opcjami sortowania.
    - *Gość:* Opcje sortowania nie są dostępne (brak historii).

### US-011: ~~Obsługa tekstu w innym języku (np. angielskim)~~ Wersja MVP nie obsługuje dodatkowych języków
- Tytuł: ~~Analiza tekstu w języku angielskim~~ Język polski jako jedyny obsługiwany język
- Opis: ~~Jako użytkownik, chcę móc wprowadzić tekst napisany w języku angielskim i uzyskać dla niego poprawną analizę zgodności z GDPR oraz angielskie sugestie poprawek.~~ W wersji MVP system obsługuje wyłącznie dokumenty w języku polskim. Wsparcie dla innych języków zostanie dodane w przyszłych wersjach produktu.
- Kryteria akceptacji:
    - ~~Mogę wskazać język analizowanego tekstu (np. wybierając z listy przed analizą) lub system próbuje go automatycznie wykryć.~~
    - ~~Jeśli tekst jest w obsługiwanym języku (np. angielskim), analiza jest przeprowadzana z użyciem reguł i słownictwa właściwego dla tego języka.~~
    - ~~Wykryte problemy i błędy są opisywane w języku angielskim.~~
    - ~~Sugerowane poprawki są generowane w języku angielskim.~~
    - ~~Wyniki analizy dla tekstu angielskiego są poprawne i adekwatne.~~
    - System informuje użytkownika, że obsługiwany jest tylko język polski.
    - Interfejs użytkownika jest dostępny wyłącznie w języku polskim.
    - Analiza dokumentów i generowanie sugestii działa poprawnie dla tekstów w języku polskim.

### US-012: Responsywny interfejs na urządzeniu mobilnym
- Tytuł: Używanie aplikacji na smartfonie
- Opis: Jako użytkownik, chcę móc wygodnie korzystać z aplikacji GdprMate na moim smartfonie poprzez przeglądarkę internetową, aby móc szybko sprawdzić dokument nawet poza biurem.
- Kryteria akceptacji:
    - Strona aplikacji poprawnie wyświetla się na ekranie smartfona w orientacji pionowej.
    - Wszystkie elementy interfejsu (przyciski, pola tekstowe, menu) są czytelne i łatwe do użycia (kliknięcia/dotknięcia).
    - Nawigacja jest dostosowana do mniejszych ekranów.
    - Tekst wyników analizy jest czytelny i poprawnie zawijany.
    - Mogę wykonać wszystkie kluczowe akcje (logowanie, wprowadzanie tekstu, uruchamianie analizy, przeglądanie wyników, kopiowanie sugestii) na smartfonie.

### US-013: Bezpieczeństwo danych użytkownika
- Tytuł: Ochrona danych konta i dokumentów
- Opis: Jako użytkownik, chcę mieć pewność, że moje dane logowania, dane osobowe (jeśli zbierane) oraz treść analizowanych tekstów są bezpiecznie przechowywane i chronione przed nieautoryzowanym dostępem.
- Kryteria akceptacji:
    - Hasła użytkowników są przechowywane w bazie danych w postaci zahashowanej z użyciem silnego algorytmu (np. bcrypt, Argon2).
    - Komunikacja między przeglądarką a serwerem jest szyfrowana (HTTPS).
    - Wdrożono mechanizmy chroniące przed popularnymi atakami webowymi (np. XSS, CSRF).
    - Zastosowano Row-Level Security (RLS) lub równoważny mechanizm na poziomie aplikacji/bazy danych, aby użytkownik miał dostęp wyłącznie do swoich danych (historii analiz, wprowadzonych tekstów).
    - Dane (np. treść analizowanych tekstów) są chronione przed dostępem osób nieuprawnionych.

## 7. Metryki sukcesu

### MS-001: Wartość generowanych sugestii
- Miernik: Procent użytkowników, którzy w ankiecie lub systemie feedbacku oceniają wygenerowane sugestie jako "wartościowe" lub "łatwe do zastosowania".
- Cel: Minimum 70%.

### MS-002: Regularność użytkowania
- Miernik: Procent zarejestrowanych użytkowników, którzy przeprowadzają co najmniej jedną analizę nowego lub zaktualizowanego dokumentu w ciągu miesiąca.
- Cel: Minimum 75% aktywnych użytkowników.

### MS-003: Oszczędność czasu
- Miernik: Deklarowane przez użytkowników (w ankietach) zmniejszenie czasu spędzanego na manualnej analizie zgodności dokumentów GDPR.
- Cel: Minimum 50% redukcji czasu.

### MS-004: Akceptacja sugestii (pośrednia)
- Miernik: Liczba użyć funkcji "Kopiuj sugestię" w stosunku do liczby przeprowadzonych analiz lub wyświetlonych sugestii (jako wskaźnik zainteresowania sugestiami).

- Cel: Monitorowanie trendu; wzrost w czasie.