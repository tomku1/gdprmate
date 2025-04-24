# REST API Plan for GdprMate

## 1. Resources

- **Users** - Corresponds to `users` table in Supabase Auth
- **Analyses** - Corresponds to `analyses` table
- **Issues** - Corresponds to `analysis_issues` table
- **Interactions** - Corresponds to `suggestion_interactions` table

## 2. Endpoints

### Authentication
Note: Authentication will be handled by Supabase Auth, but the API will validate JWT tokens

### Analyses

#### POST /api/analyses
- **Description**: Create a new analysis for provided text and perform GDPR compliance check
- **Authentication**: Required
- **Content-Type**: `application/json`
- **Request Body**:
  ```json
  {
    "text_content": "Text content to analyze..."
  }
  ```
- **Response Body**:
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
- **Success Responses**:
  - `201 Created`: Analysis completed successfully
- **Error Responses**:
  - `400 Bad Request`: Invalid text (empty or too long)
  - `401 Unauthorized`: User not authenticated
  - `413 Payload Too Large`: Text exceeds size limit
  - `500 Internal Server Error`: Server error

#### GET /api/analyses
- **Description**: Get a list of analyses for the user
- **Authentication**: Required
- **Query Parameters**:
  - `page` (integer, optional): Page number for pagination
  - `limit` (integer, optional): Number of items per page
  - `sort` (string, optional): Field to sort by (e.g., `created_at`)
  - `order` (string, optional): Sort order (`asc` or `desc`)
- **Response Body**:
  ```json
  {
    "analyses": [
      {
        "id": "uuid",
        "text_preview": "First 100 characters...",
        "detected_language": "en",
        "created_at": "2023-06-01T12:00:00Z"
      }
    ],
    "pagination": {
      "total": 50,
      "page": 1,
      "limit": 10,
      "pages": 5
    }
  }
  ```
- **Success Responses**:
  - `200 OK`: Analyses retrieved successfully
- **Error Responses**:
  - `401 Unauthorized`: User not authenticated
  - `500 Internal Server Error`: Server error

#### GET /api/analyses/{id}
- **Description**: Get a specific analysis with its issues
- **Authentication**: Required
- **Parameters**:
  - `id` (path, required): Analysis UUID
- **Query Parameters**:
  - `category` (string, optional): Filter issues by category (`critical`, `important`, `minor`)
  - `page` (integer, optional): Page number for issues pagination
  - `limit` (integer, optional): Number of issues per page
  - `sort` (string, optional): Field to sort issues by (e.g., `category`)
  - `order` (string, optional): Sort order for issues (`asc` or `desc`)
- **Response Body**:
  ```json
  {
    "id": "uuid",
    "text_preview": "First 100 characters...",
    "text_content": "Full analyzed text content...",
    "detected_language": "en",
    "model_version": "v1.0",
    "created_at": "2023-06-01T12:00:00Z",
    "issues": [
      {
        "id": "uuid",
        "category": "critical",
        "description": "Missing information about data controller",
        "suggestion": "Add the following clause: ...",
        "created_at": "2023-06-01T12:01:00Z"
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
- **Success Responses**:
  - `200 OK`: Analysis retrieved successfully
- **Error Responses**:
  - `401 Unauthorized`: User not authenticated
  - `403 Forbidden`: User does not have access to this analysis
  - `404 Not Found`: Analysis not found
  - `500 Internal Server Error`: Server error

### Interactions

#### POST /api/issues/{issueId}/interactions
- **Description**: Record user interaction with a suggestion
- **Authentication**: Required
- **Parameters**:
  - `issueId` (path, required): Issue UUID
- **Request Body**:
  ```json
  {
    "interaction_type": "accepted"
  }
  ```
- **Response Body**:
  ```json
  {
    "id": "uuid",
    "issue_id": "uuid",
    "interaction_type": "accepted",
    "created_at": "2023-06-01T12:30:00Z"
  }
  ```
- **Success Responses**:
  - `201 Created`: Interaction recorded successfully
- **Error Responses**:
  - `400 Bad Request`: Invalid interaction type
  - `401 Unauthorized`: User not authenticated
  - `403 Forbidden`: User does not have access to this issue
  - `404 Not Found`: Issue not found
  - `500 Internal Server Error`: Server error

## 3. Authentication and Authorization

GdprMate will use Supabase Auth for authentication, which provides secure, JWT-based authentication. The API will validate these JWTs for authorization.

### Implementation Details

1. **Authentication**:
    - Users authenticate via /auth/login or /auth/register, receiving a bearer token.

2. **API Authorization**:
   - All API endpoints (except public ones) will require a valid JWT token in the Authorization header
   - Format: `Authorization: Bearer {jwt_token}`
   - The API will validate the token and extract the user ID

3. **Row-Level Security (RLS)**:
   - Supabase's RLS policies will ensure users can only access their own data
   - All database tables have RLS enabled with policies that check `auth.uid() = user_id`

## 4. Validation and Business Logic

### Text Content Validation

1. **Frontend Validation**:
   - Ensure text content is not empty
   - Maximum text size: 50,000 characters
   - Visual feedback for text length
   - Disable submit button if validation fails

2. **Backend Validation**:
   - Double-check text size limits
   - Reject texts exceeding limits with a 413 error
   - Sanitize input text

3. **Language Detection**:
   - Support for Polish and English
   - Allow user override of detected language

### Analysis Business Logic

1. **Analysis Creation**:
   - Analysis is performed synchronously
   - Text content is stored with the analysis record
   - Results are returned immediately with issues

2. **GDPR Compliance Analysis**:
   - Analyze texts against GDPR requirements (Articles 7, 13, 14) using Large Language Models (LLMs)
   - Leverage OpenRouter.ai API to access various AI models for analysis
   - Identify missing or incorrect elements
   - Categorize issues as `critical`, `important`, or `minor`
   - Generate appropriate suggestions for each issue

### Interaction Validation

1. **Interaction Type Validation**:
   - Valid interaction types: `accepted` or `rejected`
   - Reject requests with invalid types

2. **Data Integrity**:
   - Verify the user owns the issue before recording an interaction
   - Prevent duplicate interactions for the same issue

### Error Handling

1. **Clear Error Messages**:
   - All error responses include a clear error message
   - For validation errors, specify which field failed validation and why

2. **Appropriate Status Codes**:
   - Use appropriate HTTP status codes for different error types
   - 4xx for client errors, 5xx for server errors 