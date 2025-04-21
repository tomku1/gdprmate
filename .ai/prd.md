# Dokument wymagań produktu (PRD) - GdprMate

## 1. Przegląd produktu

GdprMate to aplikacja webowa pełniąca rolę asystenta zgodności z GDPR (GDPR). Jej głównym celem jest pomoc użytkownikom w szybkiej i efektywnej analizie dokumentów prawnych, takich jak klauzule informacyjne i zgody, pod kątem zgodności z podstawowymi wymaganiami GDPR (w szczególności art. 7, 13 i 14). Aplikacja automatycznie identyfikuje potencjalne braki lub błędy w dokumentach, prezentuje je w czytelny sposób wraz z kategoriami ważności (krytyczne, ważne, drobne) i sugeruje poprawne sformułowania. GdprMate oferuje system kont użytkowników, umożliwiając przechowywanie wgranych dokumentów i historii przeprowadzonych analiz. Aplikacja jest przeznaczona dla osób i organizacji, które przetwarzają dane osobowe i potrzebują prostego narzędzia do weryfikacji zgodności swoich dokumentów. Interfejs użytkownika jest responsywny, co pozwala na korzystanie z aplikacji na różnych urządzeniach.

## 2. Problem użytkownika

Obecnie zapewnienie zgodności dokumentów z wymogami Rozporządzenia o Ochronie Danych Osobowych (GDPR) jest procesem złożonym, czasochłonnym i obarczonym ryzykiem błędów. Wiele organizacji, zwłaszcza mniejszych, nie dysponuje dedykowanymi zasobami prawnymi, a samodzielna analiza i interpretacja przepisów jest trudna. Brakuje prostego, dostępnego narzędzia, które pozwoliłoby użytkownikom bez specjalistycznej wiedzy prawniczej szybko sprawdzić kluczowe dokumenty (klauzule informacyjne, zgody marketingowe itp.) pod kątem fundamentalnych wymagań GDPR. Manualna weryfikacja zajmuje dużo czasu, a ewentualne błędy mogą prowadzić do poważnych konsekwencji prawnych i finansowych. Użytkownicy potrzebują narzędzia, które zautomatyzuje ten proces, wskaże konkretne problemy w ich dokumentach i zaproponuje gotowe do użycia, poprawne sformułowania.

## 3. Wymagania funkcjonalne

### WF-001: Analiza klauzul informacyjnych
   - System musi umożliwiać automatyczną analizę treści klauzul informacyjnych pod kątem zgodności z wymogami art. 13 i 14 GDPR.
   - Analiza powinna identyfikować brakujące elementy wymagane przez te artykuły.

### WF-002: Analiza treści zgód
   - System musi umożliwiać automatyczną analizę treści zgód (np. marketingowych, na newsletter) pod kątem zgodności z wymogami art. 7 GDPR.
   - Analiza powinna weryfikować m.in. dobrowolność, konkretność, świadomość i jednoznaczność zgody.

### WF-003: Obsługiwane typy dokumentów
   - System musi obsługiwać analizę następujących typów dokumentów: Klauzule informacyjne (Privacy Notices), Klauzule zgody (Consent Clauses), Zgody na newsletter i marketing (Newsletter and Marketing Consents), Klauzule dotyczące bezpośredniego i pośredniego zbierania danych (Direct & Indirect Data Collection Clauses).

### WF-004: Metody wprowadzania dokumentów
   - Użytkownik musi mieć możliwość wprowadzenia tekstu do analizy poprzez:
     - Kopiuj/Wklej do dedykowanego pola tekstowego.
     - Wgranie pliku w formacie .txt.
     - Wgranie pliku w formacie PDF (z ekstrakcją tekstu).

### WF-005: Wyświetlanie wyników analizy
   - Wyniki analizy muszą być prezentowane w sposób czytelny i zrozumiały.
   - Wykryte błędy lub braki muszą być jasno wskazane, z informacją czego brakuje lub co jest sformułowane błędnie.
   - Błędy powinny być kategoryzowane (np. krytyczne, ważne, drobne) i oznaczane wizualnie (np. kolorami).

### WF-006: Generowanie sugestii poprawek
   - Dla wykrytych błędów lub braków system musi generować przykładowe, poprawne sformułowania lub klauzule.
   - Sugestie muszą być łatwe do skopiowania przez użytkownika.

### WF-007: Konta użytkowników
   - System musi zapewniać możliwość rejestracji i logowania użytkowników.
   - Zalogowani użytkownicy muszą mieć możliwość przechowywania wgranych dokumentów i historii przeprowadzonych analiz.

### WF-008: Historia analiz
   - System musi przechowywać historię analiz przeprowadzonych przez zalogowanego użytkownika.
   - Użytkownik musi mieć możliwość przeglądania historii i powrotu do wyników poprzednich analiz.

### WF-009: Filtrowanie i sortowanie wyników
   - Użytkownik musi mieć możliwość filtrowania wyników analizy (np. według kategorii błędu).
   - Użytkownik musi mieć możliwość sortowania wyników analizy lub listy w historii (np. według daty, typu błędu).

### WF-010: Obsługa wielu języków (Dokumenty)
   - System musi być przygotowany do obsługi analizy dokumentów w wielu językach (początkowo co najmniej polski i angielski).

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

## 5. Historyjki użytkowników

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

### US-004: Wprowadzenie tekstu przez kopiuj/wklej
- Tytuł: Analiza tekstu wklejonego
- Opis: Jako zalogowany użytkownik, chcę móc wkleić skopiowany tekst dokumentu (np. klauzuli informacyjnej) bezpośrednio do pola tekstowego w aplikacji, aby szybko zainicjować jego analizę.
- Kryteria akceptacji:
    - W panelu użytkownika znajduje się widoczne pole tekstowe przeznaczone do wklejania tekstu.
    - Mogę wkleić tekst do tego pola.
    - Po wklejeniu tekstu dostępny jest przycisk/opcja "Analizuj".
    - Kliknięcie "Analizuj" rozpoczyna proces analizy wklejonego tekstu (zgodnie z US-007).
    - System obsługuje wklejanie tekstów o różnej długości (w ramach rozsądnych limitów technicznych).

### US-005: Wgranie dokumentu z pliku .txt
- Tytuł: Analiza dokumentu z pliku .txt
- Opis: Jako zalogowany użytkownik, chcę móc wybrać i wgrać plik tekstowy (.txt) z mojego komputera, zawierający dokument do analizy, aby sprawdzić jego zgodność z GDPR.
- Kryteria akceptacji:
    - W panelu użytkownika znajduje się opcja wgrania pliku.
    - Mogę wybrać plik z rozszerzeniem .txt z mojego urządzenia.
    - System akceptuje tylko pliki .txt (lub wyświetla błąd dla innych typów, zgodnie z US-016).
    - Po wybraniu pliku jest on przesyłany na serwer.
    - Po pomyślnym wgraniu dostępny jest przycisk/opcja "Analizuj".
    - Kliknięcie "Analizuj" rozpoczyna proces analizy treści pliku (zgodnie z US-007).
    - System poprawnie odczytuje treść pliku .txt (uwzględniając popularne kodowania, np. UTF-8).

### US-006: Wgranie dokumentu z pliku PDF, docx
- Tytuł: Analiza dokumentu z pliku PDF
- Opis: Jako zalogowany użytkownik, chcę móc wybrać i wgrać plik PDF oraz .docx z mojego komputera, zawierający dokument do analizy, aby sprawdzić jego zgodność z GDPR.
- Kryteria akceptacji:
    - W panelu użytkownika znajduje się opcja wgrania pliku.
    - Mogę wybrać plik z rozszerzeniem .pdf oraz .docx z mojego urządzenia.
    - System akceptuje tylko pliki .pdf  oraz .docx(lub wyświetla błąd dla innych typów, zgodnie z US-016).
    - Po wybraniu pliku jest on przesyłany na serwer.
    - System próbuje wyekstrahować treść tekstową z pliku.
    - Jeśli ekstrakcja tekstu powiedzie się, dostępny jest przycisk/opcja "Analizuj".
    - Kliknięcie "Analizuj" rozpoczyna proces analizy wyekstrahowanego tekstu (zgodnie z US-007).
    - Jeśli ekstrakcja tekstu nie powiedzie się (np. dokument obrazkowy, zabezpieczony hasłem uniemożliwiającym ekstrakcję), wyświetlany jest czytelny komunikat o błędzie (zgodnie z US-017).

### US-007: Przeprowadzenie analizy zgodności
- Tytuł: Uruchomienie analizy dokumentu
- Opis: Jako zalogowany użytkownik, po wprowadzeniu tekstu (przez wklejenie lub wgranie pliku), chcę móc uruchomić proces analizy tego tekstu pod kątem zgodności z art. 7, 13 i 14 GDPR.
- Kryteria akceptacji:
    - Po wprowadzeniu tekstu (wklejeniu lub pomyślnym wgraniu pliku i ekstrakcji tekstu) widoczny jest przycisk/opcja "Analizuj".
    - Kliknięcie przycisku "Analizuj" inicjuje proces analizy na serwerze.
    - Użytkownik otrzymuje informację zwrotną, że analiza jest w toku (np. animacja ładowania, komunikat).
    - Analiza obejmuje sprawdzenie zgodności z art. 7 (dla zgód), art. 13 i 14 (dla klauzul informacyjnych) GDPR.
    - Po zakończeniu analizy, jej wyniki są zapisywane i powiązane z moim kontem użytkownika.
    - Jestem powiadamiany o zakończeniu analizy i mogę przejść do widoku wyników (zgodnie z US-008).
    - Dokument (lub jego treść) jest zapisywany w historii użytkownika.

### US-008: Wyświetlanie wyników analizy
- Tytuł: Przeglądanie wyników analizy
- Opis: Jako zalogowany użytkownik, po zakończeniu analizy dokumentu, chcę zobaczyć jej wyniki w sposób jasny i zrozumiały, w tym listę wykrytych błędów/braków, ich kategorie oraz sugerowane poprawki.
- Kryteria akceptacji:
    - Po zakończeniu analizy jestem przekierowywany do widoku wyników lub otrzymuję link/przycisk do tego widoku.
    - Widok wyników prezentuje podsumowanie analizy.
    - Wyświetlana jest lista wykrytych problemów (błędów, braków).
    - Każdy problem ma przypisaną kategorię (np. Krytyczny, Ważny, Drobny).
    - Kategorie są wizualnie rozróżnione (np. kolorami).
    - Dla każdego problemu wyświetlany jest opis wyjaśniający, na czym polega błąd lub czego brakuje w dokumencie.
    - Dla (przynajmniej niektórych) problemów wyświetlane są konkretne sugestie poprawek lub przykładowe prawidłowe sformułowania.
    - Widok wyników jest powiązany z konkretnym analizowanym dokumentem/tekstem.

### US-009: Kopiowanie sugerowanych poprawek
- Tytuł: Kopiowanie sugestii
- Opis: Jako zalogowany użytkownik, przeglądając wyniki analizy, chcę mieć możliwość łatwego skopiowania tekstu sugerowanej poprawki do schowka, aby móc ją wkleić do edytowanego przeze mnie dokumentu.
- Kryteria akceptacji:
    - Obok każdej wyświetlonej sugestii poprawki znajduje się przycisk/ikona "Kopiuj".
    - Kliknięcie tego przycisku/ikony kopiuje tekst danej sugestii do schowka systemowego.
    - Otrzymuję wizualne potwierdzenie, że tekst został skopiowany (np. zmiana ikony, krótki komunikat "Skopiowano!").

### US-010: Przeglądanie historii analiz
- Tytuł: Dostęp do historii analiz
- Opis: Jako zalogowany użytkownik, chcę mieć dostęp do listy wszystkich moich poprzednich analiz, abym mógł wrócić do wcześniejszych wyników lub sprawdzić, jakie dokumenty już analizowałem.
- Kryteria akceptacji:
    - W panelu użytkownika dostępna jest sekcja "Historia analiz".
    - Sekcja ta wyświetla listę przeprowadzonych przeze mnie analiz.
    - Każdy wpis na liście zawiera identyfikator dokumentu (np. nazwa pliku, data analizy, fragment tekstu) oraz datę przeprowadzenia analizy.
    - Lista jest posortowana domyślnie np. od najnowszej analizy.
    - Mogę kliknąć na wybrany wpis w historii, aby przejść do szczegółowego widoku wyników tej konkretnej analizy (zgodnie z US-008).

### US-011: Filtrowanie wyników analizy
- Tytuł: Filtrowanie listy błędów
- Opis: Jako zalogowany użytkownik, przeglądając szczegółowe wyniki analizy, chcę móc filtrować listę wykrytych problemów według ich kategorii (Krytyczny, Ważny, Drobny), aby skupić się na najważniejszych kwestiach.
- Kryteria akceptacji:
    - W widoku wyników analizy dostępne są kontrolki umożliwiające filtrowanie (np. checkboxy, przyciski).
    - Mogę wybrać jedną lub więcej kategorii błędów do wyświetlenia.
    - Po wybraniu filtra lista problemów jest dynamicznie aktualizowana, pokazując tylko te, które pasują do wybranego filtra.
    - Mogę łatwo usunąć filtry, aby ponownie zobaczyć wszystkie problemy.

### US-012: Sortowanie historii analiz
- Tytuł: Sortowanie listy historii
- Opis: Jako zalogowany użytkownik, przeglądając historię analiz, chcę móc sortować listę analiz według różnych kryteriów (np. daty analizy, nazwy dokumentu - jeśli dotyczy), aby łatwiej znaleźć interesującą mnie analizę.
- Kryteria akceptacji:
    - W widoku historii analiz dostępne są opcje sortowania (np. rozwijana lista, klikalne nagłówki kolumn).
    - Mogę wybrać kryterium sortowania (np. Data analizy).
    - Mogę wybrać kierunek sortowania (rosnąco/malejąco).
    - Lista analiz jest dynamicznie aktualizowana zgodnie z wybranymi opcjami sortowania.

### US-013: Obsługa dokumentu w innym języku (np. angielskim)
- Tytuł: Analiza dokumentu w języku angielskim
- Opis: Jako użytkownik, chcę móc wgrać lub wkleić dokument napisany w języku angielskim i uzyskać dla niego poprawną analizę zgodności z GDPR oraz angielskie sugestie poprawek.
- Kryteria akceptacji:
    - Mogę wskazać język analizowanego dokumentu (np. wybierając z listy przed analizą) lub system próbuje go automatycznie wykryć.
    - Jeśli dokument jest w obsługiwanym języku (np. angielskim), analiza jest przeprowadzana z użyciem reguł i słownictwa właściwego dla tego języka.
    - Wykryte problemy i błędy są opisywane w języku angielskim.
    - Sugerowane poprawki są generowane w języku angielskim.
    - Wyniki analizy dla dokumentu angielskiego są poprawne i adekwatne.

### US-014: Responsywny interfejs na urządzeniu mobilnym
- Tytuł: Używanie aplikacji na smartfonie
- Opis: Jako użytkownik, chcę móc wygodnie korzystać z aplikacji GdprMate na moim smartfonie poprzez przeglądarkę internetową, aby móc szybko sprawdzić dokument nawet poza biurem.
- Kryteria akceptacji:
    - Strona aplikacji poprawnie wyświetla się na ekranie smartfona w orientacji pionowej.
    - Wszystkie elementy interfejsu (przyciski, pola tekstowe, menu) są czytelne i łatwe do użycia (kliknięcia/dotknięcia).
    - Nawigacja jest dostosowana do mniejszych ekranów.
    - Tekst wyników analizy jest czytelny i poprawnie zawijany.
    - Mogę wykonać wszystkie kluczowe akcje (logowanie, wklejanie tekstu, wgrywanie pliku, uruchamianie analizy, przeglądanie wyników, kopiowanie sugestii) na smartfonie.

### US-015: Bezpieczeństwo danych użytkownika
- Tytuł: Ochrona danych konta i dokumentów
- Opis: Jako użytkownik, chcę mieć pewność, że moje dane logowania, dane osobowe (jeśli zbierane) oraz treść analizowanych dokumentów są bezpiecznie przechowywane i chronione przed nieautoryzowanym dostępem.
- Kryteria akceptacji:
    - Hasła użytkowników są przechowywane w bazie danych w postaci zahashowanej z użyciem silnego algorytmu (np. bcrypt, Argon2).
    - Komunikacja między przeglądarką a serwerem jest szyfrowana (HTTPS).
    - Wdrożono mechanizmy chroniące przed popularnymi atakami webowymi (np. XSS, CSRF).
    - Zastosowano Row-Level Security (RLS) lub równoważny mechanizm na poziomie aplikacji/bazy danych, aby użytkownik miał dostęp wyłącznie do swoich danych (historii analiz, wgranych dokumentów).
    - Dane (np. treść dokumentów) są chronione przed dostępem osób nieuprawnionych.


### US-016: Obsługa błędów wgrywania plików
- Tytuł: Informacja o błędnym pliku
- Opis: Jako użytkownik, próbując wgrać plik do analizy, chcę otrzymać jasny komunikat o błędzie, jeśli plik ma nieobsługiwany format (inny niż .txt lub .pdf), jest uszkodzony, przekracza dozwolony rozmiar lub (w przypadku PDF) nie można z niego wyekstrahować tekstu.
- Kryteria akceptacji:
    - System sprawdza rozszerzenie wgrywanego pliku. Jeśli jest inne niż .txt lub .pdf, proces wgrywania jest przerywany i wyświetlany jest komunikat "Nieobsługiwany format pliku. Dozwolone formaty to .txt i .pdf.".
    - System sprawdza rozmiar wgrywanego pliku. Jeśli przekracza on ustalony limit (np. 5MB), proces wgrywania jest przerywany i wyświetlany jest komunikat "Plik jest za duży. Maksymalny rozmiar pliku to X MB.".
    - Podczas próby ekstrakcji tekstu z PDF, jeśli proces się nie powiedzie (np. plik uszkodzony, PDF obrazkowy, zabezpieczony hasłem), proces analizy jest przerywany i wyświetlany jest komunikat "Nie można przetworzyć pliku PDF. Upewnij się, że plik nie jest uszkodzony, nie jest obrazem i nie jest zabezpieczony hasłem uniemożliwiającym kopiowanie treści.".
    - Komunikaty błędów są wyświetlane w sposób widoczny dla użytkownika.

## 6. Metryki sukcesu

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
