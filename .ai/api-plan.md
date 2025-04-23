# REST API Plan for GdprMate

## 1. Resources

- **Users** - Corresponds to `users` table in Supabase Auth
- **Documents** - Corresponds to `documents` table
- **Analyses** - Corresponds to `analyses` table
- **Issues** - Corresponds to `analysis_issues` table
- **Interactions** - Corresponds to `suggestion_interactions` table

## 2. Endpoints

### Authentication
Note: Authentication will be handled by Supabase Auth, but the API will validate JWT tokens

### Documents

#### GET /api/documents
- **Description**: Retrieve a list of user's documents
- **Authentication**: Required
- **Query Parameters**:
  - `page` (integer, optional): Page number for pagination
  - `limit` (integer, optional): Number of items per page
  - `sort` (string, optional): Field to sort by (e.g., `created_at`)
  - `order` (string, optional): Sort order (`asc` or `desc`)
- **Response Body**:
  ```json
  {
    "documents": [
      {
        "id": "uuid",
        "original_filename": "example.txt",
        "mime_type": "text/plain",
        "size_bytes": 1234,
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
  - `200 OK`: Documents retrieved successfully
- **Error Responses**:
  - `401 Unauthorized`: User not authenticated
  - `500 Internal Server Error`: Server error

#### GET /api/documents/{id}
- **Description**: Retrieve a specific document
- **Authentication**: Required
- **Parameters**:
  - `id` (path, required): Document UUID
- **Response Body**:
  ```json
  {
    "id": "uuid",
    "original_filename": "example.txt",
    "mime_type": "text/plain",
    "size_bytes": 1234,
    "text_content": "Document content...",
    "detected_language": "en",
    "created_at": "2023-06-01T12:00:00Z"
  }
  ```
- **Success Responses**:
  - `200 OK`: Document retrieved successfully
- **Error Responses**:
  - `401 Unauthorized`: User not authenticated
  - `403 Forbidden`: User does not have access to this document
  - `404 Not Found`: Document not found
  - `500 Internal Server Error`: Server error

#### POST /api/documents
- **Description**: Upload a document (file or text)
- **Authentication**: Required
- **Content-Type**:
  - `multipart/form-data` (for file upload)
  - `application/json` (for text upload)
- **Request Body**:
  - For file upload (multipart/form-data):
    - `file` (file, required): The document file to upload
  - For text upload (application/json):
    ```json
    {
      "text_content": "Document content to analyze...",
      "original_filename": "optional-custom-name.txt"
    }
    ```
- **Response Body**:
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
- **Success Responses**:
  - `201 Created`: Document uploaded successfully
- **Error Responses**:
  - `400 Bad Request`: Invalid file format or size, or invalid text
  - `401 Unauthorized`: User not authenticated
  - `413 Payload Too Large`: File exceeds size limit (10MB)
  - `415 Unsupported Media Type`: File type not supported
  - `500 Internal Server Error`: Server error

#### DELETE /api/documents/{id}
- **Description**: Delete a document
- **Authentication**: Required
- **Parameters**:
  - `id` (path, required): Document UUID
- **Response Body**: None
- **Success Responses**:
  - `204 No Content`: Document deleted successfully
- **Error Responses**:
  - `401 Unauthorized`: User not authenticated
  - `403 Forbidden`: User does not have access to this document
  - `404 Not Found`: Document not found
  - `500 Internal Server Error`: Server error

### Analyses

#### POST /api/analyses
- **Description**: Create a new analysis for a document
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "document_id": "uuid"
  }
  ```
- **Response Body**:
  ```json
  {
    "id": "uuid",
    "document_id": "uuid",
    "status": "pending",
    "started_at": "2023-06-01T12:00:00Z",
    "created_at": "2023-06-01T12:00:00Z"
  }
  ```
- **Success Responses**:
  - `201 Created`: Analysis created successfully
- **Error Responses**:
  - `400 Bad Request`: Invalid document ID
  - `401 Unauthorized`: User not authenticated
  - `403 Forbidden`: User does not have access to this document
  - `404 Not Found`: Document not found
  - `500 Internal Server Error`: Server error

#### GET /api/analyses
- **Description**: Get a list of analyses for the user
- **Authentication**: Required
- **Query Parameters**:
  - `page` (integer, optional): Page number for pagination
  - `limit` (integer, optional): Number of items per page
  - `sort` (string, optional): Field to sort by (e.g., `created_at`)
  - `order` (string, optional): Sort order (`asc` or `desc`)
  - `status` (string, optional): Filter by status (`pending`, `in_progress`, `completed`, `failed`)
  - `document_id` (string, optional): Filter by document ID
- **Response Body**:
  ```json
  {
    "analyses": [
      {
        "id": "uuid",
        "document_id": "uuid",
        "document_name": "example.txt",
        "status": "completed",
        "started_at": "2023-06-01T12:00:00Z",
        "completed_at": "2023-06-01T12:01:00Z",
        "duration_ms": 60000,
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
- **Description**: Get a specific analysis with optional issues
- **Authentication**: Required
- **Parameters**:
  - `id` (path, required): Analysis UUID
- **Query Parameters**:
  - `include` (string, optional): Related resources to include (e.g., `issues`)
  - When `include=issues` is specified:
    - `category` (string, optional): Filter issues by category (`critical`, `important`, `minor`)
    - `page` (integer, optional): Page number for issues pagination
    - `limit` (integer, optional): Number of issues per page
    - `sort` (string, optional): Field to sort issues by (e.g., `category`)
    - `order` (string, optional): Sort order for issues (`asc` or `desc`)
- **Response Body**:
  ```json
  {
    "id": "uuid",
    "document_id": "uuid",
    "document_name": "example.txt",
    "status": "completed",
    "model_version": "v1.0",
    "started_at": "2023-06-01T12:00:00Z",
    "completed_at": "2023-06-01T12:01:00Z",
    "duration_ms": 60000,
    "error_message": null,
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

### Document Validation

1. **File Type Validation**:
   - Only accept `.txt`, `.pdf`, and `.docx` file extensions
   - Validate MIME types: `text/plain`, `application/pdf`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`

2. **File Size Validation**:
   - Maximum file size: 10MB (10,000,000 bytes)
   - Reject files exceeding this limit with a 413 error

3. **Text Content Validation**:
   - Ensure text content is not empty
   - Limit text size to equivalent of 10MB

### Analysis Business Logic

1. **Analysis Creation**:
   - When a new analysis is created, it starts with `pending` status
   - The analysis process runs asynchronously
   - Status updates to `in_progress` when processing begins
   - Final status is either `completed` or `failed`

2. **Document Language Detection**:
   - API will detect the language of uploaded documents
   - Initially support for Polish and English
   - Language code is stored in `detected_language` field

3. **GDPR Compliance Analysis**:
   - Analyze documents against GDPR requirements (Articles 7, 13, 14)
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