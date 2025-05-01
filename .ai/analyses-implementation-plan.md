# API Endpoint Implementation Plan: POST /api/analyses

## 1. Overview of the Endpoint
The endpoint allows users to submit text content for immediate GDPR compliance analysis. For authenticated users, the text is stored in the `documents` table and linked to a new analysis record in the `analyses` table. For non-authenticated users, temporary analyses are processed without database storage and returned with additional information to be stored in session storage. The analysis is performed synchronously, and results are returned immediately.

## 2. Request Details
- HTTP Method: POST
- Path: `/api/analyses`
- Headers:
  - `Authorization: Bearer <token>` (optional for non-logged-in users)
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
- **201 Created** – success for logged-in users
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
- **201 Created** – success for non-logged-in users
  ```json
  {
    "id": "uuid",
    "text_preview": "First 100 characters of text...",
    "text_content": "Full text content...",
    "detected_language": "en",
    "created_at": "2023-06-01T12:00:00Z",
    "is_temporary": true,
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
1. **Auth middleware** – fetch `user.id` from `context.locals.supabase.auth.getUser()` if user is authenticated
2. **API Handler** (Astro Server Endpoint):
   - Data parsing (Astro body parser)
   - Validation and verification using Zod
   - Check if user is authenticated
3. **AnalysisService** (`src/lib/services/analysis.service.ts`):
   - For authenticated users:
     - `createAnalysis(userId, command)`
       1. Store text in documents table
       2. Create analysis record
       3. Detect language
       4. Generate text preview
       5. Call OpenRouter.ai API for GDPR analysis
       6. Process results and create issues
       7. Return complete analysis with issues
   - For non-authenticated users:
     - `createTemporaryAnalysis(command)`
       1. Generate temporary ID
       2. Generate text preview
       3. Call OpenRouter.ai API for GDPR analysis
       4. Process results
       5. Return temporary analysis with issues and full text content

## 6. Security Considerations
- **Authentication**: Optional - Supabase session check
- **Authorization**: 
  - Logged-in users: Analysis and document assigned to `user_id` – only the owner can access their data
  - Non-logged users: Analysis stored in session storage, accessible only in the current browser session
- **Input validation**: Zod checks types and sizes
- **Size limitation**: 
  - Logged-in users: 50,000 characters (as per US-004)
  - Non-logged users: 1,000 characters
- **Text sanitization**: Remove any potentially harmful characters or sequences
- **Rate limiting**: Prevent abuse of the analysis service
- **API Key Security**: Secure storage and rotation of OpenRouter.ai API keys

## 7. Error Handling
- **400** – invalid data (missing `text_content`, text too short)
- **401** – missing/invalid token (only if trying to access protected resources)
- **413** – text exceeds size limit (50,000 chars for logged-in, 1,000 chars for non-logged)
- **500** – unhandled exceptions (logging `context.log.error(err)`)

## 8. Performance
- **Request timeout**: Set appropriate timeout for OpenRouter.ai API calls
- **Text processing optimization**
- **Database indexing** for efficient queries
- **Storage optimization**: Non-logged users' analyses stored in session storage, not in database

## 9. Deployment Stages
1. **Create Zod schema** for text content validation
2. **Authentication middleware** in `src/middleware/index.ts`
3. **Services**:
   - `src/lib/services/analysis.service.ts` with createAnalysis and createTemporaryAnalysis methods
   - `src/lib/services/temporary-analysis.service.ts` for session storage operations
4. **Handler**: new file `src/pages/api/analyses.ts` (Astro Server Endpoint)
