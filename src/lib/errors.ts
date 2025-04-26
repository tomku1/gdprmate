/**
 * Base error class for OpenRouter API errors
 */
export class OpenRouterError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OpenRouterError";
  }
}

/**
 * Error thrown when authentication with OpenRouter fails
 */
export class AuthenticationError extends OpenRouterError {
  constructor(message = "Authentication failed. Please check your API key.") {
    super(message);
    this.name = "AuthenticationError";
  }
}

/**
 * Error thrown when rate limits are exceeded
 */
export class RateLimitError extends OpenRouterError {
  constructor(message = "Rate limit exceeded. Please try again later.") {
    super(message);
    this.name = "RateLimitError";
  }
}

/**
 * Error thrown when request parameters are invalid
 */
export class InvalidRequestError extends OpenRouterError {
  constructor(message = "Invalid request parameters.") {
    super(message);
    this.name = "InvalidRequestError";
  }
}

/**
 * Error thrown when response validation against schema fails
 */
export class ValidationError extends OpenRouterError {
  constructor(message = "Failed to validate response against schema.") {
    super(message);
    this.name = "ValidationError";
  }
}

/**
 * Error thrown when analysis fails
 */
export class AnalysisError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AnalysisError";
  }
}
