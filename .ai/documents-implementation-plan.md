# API Endpoint Implementation Plan: POST /api/analyses

## 1. Overview of the Endpoint
The endpoint allows authenticated users to submit text content for immediate GDPR compliance analysis. The text is stored in the `documents` table and linked to a new analysis record in the `analyses` table. The analysis is performed synchronously, and results are returned immediately.

## 2. Request Details
- HTTP Method: POST
- Path: `/api/analyses`
- Headers:
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- Parameters:
  - Required:
    - **text_content** (string) – The text to analyze for GDPR compliance

### Content Schema:
```json
{
  "text_content": "Text content to analyze..."
}
```

## 3. Used Types
- **CreateAnalysisCommand** (src/types.ts):
  ```ts
  interface CreateAnalysisCommand {
    text_content: string;
  };
  ```
- **AnalysisSummaryDTO** (src/types.ts):
  ```ts
  interface AnalysisSummaryDTO {
    id: string;
    text_preview: string;
    status: AnalysisStatus;
    detected_language: string;
    created_at: string;
  }
  ```
- **AnalysisStatus** (enum):
  ```ts
  type AnalysisStatus =  "completed" | "failed";
  ```

## 4. Response Details
- **201 Created** – success
  ```json
  {
    "id": "uuid",
    "text_preview": "First 100 characters of text...",
    "detected_language": "en",
    "created_at": "2023-06-01T12:00:00Z",
    "issues": [
      {
        "id": "uuid",
        "category": "critical",
        "description": "Missing information about data controller",
        "suggestion": "Add the following clause: ...",
        "created_at": "2023-06-01T12:00:00Z"
      }
    ],
    "issues_pagination": {
      "total": 15,
      "page": 1,
      "limit": 10,
      "pages": 2
    }
  }
  ```
- Errors:
  - 400 Bad Request
  - 401 Unauthorized
  - 413 Payload Too Large
  - 500 Internal Server Error

## 5. Data Flow
1. **Auth middleware** – fetch `user.id` from `context.locals.supabase.auth.getUser()`
2. **API Handler** (Astro Server Endpoint):
   - Data parsing (Astro body parser)
   - Validation and verification using Zod
3. **AnalysisService** (`src/lib/services/analysis.service.ts`):
   - createAnalysis(userId, command)
     1. Store text in documents table
     2. Create analysis record
     3. Detect language
     4. Generate text preview
     5. Call OpenRouter.ai API for GDPR analysis
     6. Process results and create issues
     7. Return complete analysis with issues

## 6. Security Considerations
- **Authentication**: Supabase session check
- **Authorization**: Analysis and document assigned to `user_id` – only the owner can access their data
- **Input validation**: Zod checks types and sizes
- **Size limitation**: 50,000 characters (as per US-004)
- **Text sanitization**: Remove any potentially harmful characters or sequences
- **Rate limiting**: Prevent abuse of the analysis service
- **API Key Security**: Secure storage and rotation of OpenRouter.ai API keys

## 7. Error Handling
- **400** – invalid data (missing `text_content`, text too short)
- **401** – missing/invalid token
- **413** – text exceeds 50,000 characters
- **500** – unhandled exceptions (logging `context.log.error(err)`)

## 8. Performance
- **Request timeout**: Set appropriate timeout for OpenRouter.ai API calls
- **Text processing optimization**
- **Database indexing** for efficient queries

## 9. Deployment Stages
1. **Create Zod schema** for text content validation
2. **Authentication middleware** in `src/middleware/index.ts`
3. **Services**:
   - `src/lib/services/analysis.service.ts` with createAnalysis method
4. **Handler**: new file `src/pages/api/analyses.ts` (Astro Server Endpoint)
