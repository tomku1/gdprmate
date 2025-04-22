# Schemat bazy danych dla GdprMate

## 1. Tabele

### users
This table is managed by Supabase Auth.
- **id** UUID PRIMARY KEY
- **email** TEXT NOT NULL UNIQUE
- **encrypted_password** TEXT NOT NULL
- **created_at** TIMESTAMPTZ NOT NULL DEFAULT now()
- **confirmed_at** TIMESTAMPTZ

### documents
- **id** UUID PRIMARY KEY DEFAULT uuid_generate_v4()
- **user_id** UUID NOT NULL REFERENCES users(id)
- **original_filename** TEXT NOT NULL
- **mime_type** TEXT NOT NULL
- **size_bytes** INTEGER NOT NULL CHECK (size_bytes <= 10000000)
- **s3_key** TEXT NOT NULL
- **text_content** TEXT NOT NULL
- **detected_language** CHAR(2) NOT NULL
- **created_at** TIMESTAMPTZ NOT NULL DEFAULT now()

### analyses
- **id** UUID PRIMARY KEY DEFAULT uuid_generate_v4()
- **user_id**: UUID NOT NULL REFERENCES users(id)
- **document_id** UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE
- **status** analysis_status_enum NOT NULL
- **model_version** TEXT NOT NULL
- **duration_ms** INTEGER
- **started_at** TIMESTAMPTZ NOT NULL DEFAULT now()
- **completed_at** TIMESTAMPTZ
- **error_message** TEXT
- **created_at** TIMESTAMPTZ NOT NULL DEFAULT now()

### analysis_issues
- **id** UUID PRIMARY KEY DEFAULT uuid_generate_v4()
- **user_id**: UUID NOT NULL REFERENCES users(id)
- **analysis_id** UUID NOT NULL REFERENCES analyses(id) ON DELETE CASCADE
- **category** issue_category_enum NOT NULL
- **description** TEXT NOT NULL
- **suggestion** TEXT NOT NULL
- **created_at** TIMESTAMPTZ NOT NULL DEFAULT now()

### suggestion_interactions
- **id** UUID PRIMARY KEY DEFAULT uuid_generate_v4()
- **user_id**: UUID NOT NULL REFERENCES users(id)
- **issue_id** UUID NOT NULL REFERENCES analysis_issues(id) ON DELETE CASCADE
- **interaction_type** interaction_type_enum NOT NULL
- **created_at** TIMESTAMPTZ NOT NULL DEFAULT now()

## 2. Enums PostgreSQL

```sql
CREATE TYPE analysis_status_enum AS ENUM ('pending','in_progress','completed','failed');
CREATE TYPE issue_category_enum AS ENUM ('critical','important','minor');
CREATE TYPE interaction_type_enum AS ENUM ('accepted','rejected');
```

## 3. Relacje

- Jeden użytkownik (`users`) może mieć wiele dokumentów (`documents`); każdy dokument jest powiązany z jednym użytkownikiem.
- Jeden użytkownik (`users`) może mieć wiele analiz (`analyses`); każda analiza jest powiązana z jednym użytkownikiem oraz z jednym dokumentem.
- Jedna analiza (`analyses`) może zawierać wiele zgłoszonych problemów (`analysis_issues`); każdy problem jest powiązany z jedną analizą i jednym użytkownikiem.
- Jeden problem (`analysis_issues`) może mieć wiele interakcji (`suggestion_interactions`); każda interakcja jest powiązana z jednym problemem i jednym użytkownikiem.

## 4. Indeksy

- Indeks na `documents(user_id, created_at)` przyspiesza pobieranie dokumentów danego użytkownika w kolejności czasowej.
- Indeks na `analyses(user_id, document_id)` przyspiesza filtrowanie analiz po właścicielu i powiązanym dokumencie.
- Indeks na `analyses(status)` wspiera szybkie wyszukiwanie analiz według statusu.
- Indeks na `analysis_issues(analysis_id, user_id, category)` przyspiesza wyszukiwanie problemów według analizy, właściciela i kategorii.
- Indeks na `suggestion_interactions(issue_id, user_id, interaction_type)` przyspiesza filtrowanie interakcji według problemu, właściciela i typu akcji.

## 5. RLS (Row Level Security)

- Włączyć RLS na tabelach: `documents`, `analyses`, `analysis_issues` oraz `suggestion_interactions`.
- Zasady dostępu pozwalają na SELECT, INSERT, UPDATE i DELETE tylko wtedy, gdy `auth.uid() = user_id` w danej tabeli dla wszystkich czterech tabel.

## 6. Dodatkowe uwagi

- **Retention**: rekordy starsze niż 180 dni usuwane za pomocą pg_cron.
- **S3 lifecycle**: 30d → Standard‑IA, 90d → Glacier, 180d → usunięcie.
- **Limit rozmiaru pliku**: CHECK w kolumnie `size_bytes` do 10 000 000 (10MB).
- **Bezpieczeństwo**: rozważ szyfrowanie `text_content` (pgcrypto) i PITR.
- **Audyt**: opcjonalne wdrożenie pgAudit na wrażliwych tabelach.

*Schemat zgodny z 3NF, używa UUID, natywnych enumów i RLS dla bezpieczeństwa.* 