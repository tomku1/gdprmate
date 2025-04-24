# API Endpoint Implementation Plan: POST /api/documents

## 1. Overview of the Endpoint
The endpoint allows authenticated users to submit a document as a file or raw text. The document is stored in S3, and metadata is saved in the `documents` table in Supabase.

## 2. Request Details
- HTTP Method: POST
- Path: `/api/documents`
- Headers:
  - `Authorization: Bearer <token>`
  - `Content-Type: multipart/form-data` **or** `application/json`
- Parameters:
  - Required:
    - **file** (`file`) – for `multipart/form-data`
    - **text_content** (string) – for `application/json`
  - Optional:
    - **original_filename** (string) – for `application/json`

### Content Schemas:
- multipart/form-data (file):
  - `file` field containing the document
- application/json (text):
  ```json
  {
    "text_content": "...",
    "original_filename": "optional.txt"
  }
  ```

## 3. Used Types
- **CreateDocumentCommand** (src/types.ts):
  ```ts
  type CreateDocumentCommand = Pick<DocumentInsert, 'text_content'> &
    Partial<Pick<DocumentInsert, 'original_filename'>>;
  ```
- **DocumentSummaryDTO** (src/types.ts):
  ```ts
  interface DocumentSummaryDTO {
    id: string;
    original_filename: string;
    mime_type: string;
    size_bytes: number;
    detected_language: string;
    created_at: string;
  }
  ```
- **DocumentInsert** (internal Supabase type)

## 4. Response Details
- **201 Created** – success
  ```json
  {
    "id": "uuid",
    "original_filename": "example.txt",
    "mime_type": "text/plain",
    "size_bytes": 1234,
    "detected_language": "en",
    "created_at": "2023-06-01T12:00:00Z"
  }
  ```
- Errors:
  - 400 Bad Request
  - 401 Unauthorized
  - 413 Payload Too Large
  - 415 Unsupported Media Type
  - 500 Internal Server Error

## 5. Data Flow
1. **Auth middleware** – fetch `user.id` from `context.locals.supabase.auth.getUser()`
2. **API Handler** (Astro Server Endpoint):
   - Content-type differentiation
   - Data parsing (multer/Astro body parser)
   - Validation and verification using Zod
3. **DocumentService** (`src/lib/services/document.service.ts`):
   - uploadFromFile(userId, file)
   - uploadFromText(userId, command)
   - Common: language detection (e.g., `franc` library), S3 key generation, upload to S3
   - Record insertion in the `documents` table
   - Mapping to DocumentSummaryDTO
4. **Return response** with 201 status code and DTO

## 6. Security Considerations
- **Authentication**: Supabase session check
- **Authorization**: document assigned to `user_id` – only the owner reads their own documents
- **Input validation**: Zod checks types and sizes
- **Size limitation**: 10MB
- **MIME filtering**: allowed types (text/plain, application/pdf, docx, etc.)
- **Filename sanitization**: S3 name generation, no path traversal
- **Optional antivirus scan** before upload (extension)

## 7. Error Handling
- **400** – invalid data (missing `file`/`text_content`, incorrect type)
- **401** – missing/invalid token
- **413** – file >10MB
- **415** – unsupported MIME
- **500** – unhandled exceptions (logging `context.log.error(err)`)

## 8. Performance
- **Asynchronous upload** to S3
- **Streaming** files instead of buffering in memory
- Request rate limiting

## 9. Deployment Stages
1. **Create Zod schema** for both content-types
2. **Authentication middleware** in `src/middleware/index.ts`
3. **Service**: `src/lib/services/document.service.ts` with uploadFromFile and uploadFromText methods
4. **Handler**: new file `src/pages/api/documents.ts` (Astro Server Endpoint)
