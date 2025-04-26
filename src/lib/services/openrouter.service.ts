import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import type {
  OpenRouterMessage,
  OpenRouterResponseFormat,
  OpenRouterServiceConfig,
  OpenRouterChatCompletionOptions,
  OpenRouterApiResponse,
} from "../../types";
import { OpenRouterError, AuthenticationError, RateLimitError, InvalidRequestError, ValidationError } from "../errors";

/**
 * Service for interacting with OpenRouter API to access various LLM models
 */
export class OpenRouterService {
  private readonly apiKey: string;
  private readonly defaultModel: string;
  private readonly baseUrl: string;

  constructor(config: OpenRouterServiceConfig) {
    if (!config.apiKey) {
      throw new Error("OpenRouter API key is required.");
    }
    this.apiKey = config.apiKey;
    this.defaultModel = config.defaultModel || "google/gemini-2.0-flash-001";
    this.baseUrl = config.baseUrl || "https://openrouter.ai/api/v1";
  }

  /**
   * Sends a chat completion request to the OpenRouter API
   * @param userPrompt Text message from the user
   * @param options Optional configuration including system prompt, response schema, and model parameters
   * @returns Promise resolving to either text response or structured object (if schema provided)
   */
  async completeChat(userPrompt: string, options?: OpenRouterChatCompletionOptions): Promise<string | object> {
    try {
      // Build messages array from user prompt and optional system prompt
      const messages = this.buildMessages(userPrompt, options?.systemPrompt);

      // Prepare API call payload
      const payload: Record<string, unknown> = {
        messages,
        ...options?.params,
        model: options?.params?.model || this.defaultModel,
      };

      // If response schema is provided, configure JSON response format
      if (options?.responseSchema) {
        payload.response_format = this.buildResponseFormat(options.responseSchema);
      }

      // Make API call
      const response = await this.makeApiCall(payload);

      // Parse and validate response
      return this.parseApiResponse(response, options?.responseSchema);
    } catch (error) {
      // Log error and rethrow
      console.error("Error completing chat:", error);
      throw error;
    }
  }

  /**
   * Builds the messages array for the API request
   * @private
   */
  private buildMessages(userPrompt: string, systemPrompt?: string): OpenRouterMessage[] {
    const messages: OpenRouterMessage[] = [];

    // Add system message if provided
    if (systemPrompt) {
      messages.push({
        role: "system",
        content: systemPrompt,
      });
    }

    // Add user message
    messages.push({
      role: "user",
      content: userPrompt,
    });

    return messages;
  }

  /**
   * Builds the response_format object for structured JSON responses
   * @private
   */
  private buildResponseFormat(schema: z.ZodTypeAny): OpenRouterResponseFormat {
    const jsonSchema = zodToJsonSchema(schema);

    return {
      type: "json_schema",
      json_schema: {
        name: "response",
        strict: true,
        schema: jsonSchema,
      },
    };
  }

  /**
   * Makes the actual API call to OpenRouter
   * @private
   */
  private async makeApiCall(payload: Record<string, unknown>): Promise<OpenRouterApiResponse> {
    const url = `${this.baseUrl}/chat/completions`;
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.apiKey.substring(0, 4)}...${this.apiKey.substring(this.apiKey.length - 4)}`,
      "HTTP-Referer": "https://gdprmate.io",
      "X-Title": "GDPR Mate",
    };

    // Log request URL and headers (with redacted API key)
    console.log("[OpenRouter] Request URL:", url);
    console.log("[OpenRouter] Request headers:", JSON.stringify(headers, null, 2));

    const startTime = performance.now();
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
        "HTTP-Referer": "https://gdprmate.io",
        "X-Title": "GDPR Mate",
      },
      body: JSON.stringify(payload),
    });
    const endTime = performance.now();

    // Log response metadata
    console.log(`[OpenRouter] Response status: ${response.status} ${response.statusText}`);
    console.log(`[OpenRouter] Response time: ${Math.round(endTime - startTime)}ms`);

    // Clone the response to read the body twice (once for logging, once for processing)
    const responseClone = response.clone();

    // Handle HTTP errors
    if (!response.ok) {
      let errorMessage = `OpenRouter API error: ${response.status} ${response.statusText}`;

      try {
        const errorData = (await response.json()) as { error?: { message?: string } };
        errorMessage = errorData.error?.message || errorMessage;
        console.error("[OpenRouter] Error response:", errorData);
      } catch {
        // Ignore parsing errors for error responses
      }

      // Map HTTP status to specific error types
      switch (response.status) {
        case 401:
        case 403:
          throw new AuthenticationError(errorMessage);
        case 429:
          throw new RateLimitError(errorMessage);
        case 400:
          throw new InvalidRequestError(errorMessage);
        default:
          throw new OpenRouterError(errorMessage);
      }
    }

    // Log the full response body for successful responses
    try {
      const responseBodyForLogging = await responseClone.json();
      console.log("[OpenRouter] Response body:", JSON.stringify(responseBodyForLogging, null, 2));
    } catch (error) {
      console.error("[OpenRouter] Failed to parse response body for logging:", error);
    }

    return response.json() as Promise<OpenRouterApiResponse>;
  }

  /**
   * Parses and validates the API response
   * @private
   */
  private parseApiResponse(response: OpenRouterApiResponse, schema?: z.ZodTypeAny): string | object {
    // Extract content from response
    const content = response.choices?.[0]?.message?.content;

    if (content === undefined) {
      throw new OpenRouterError("Invalid response format from OpenRouter API");
    }

    // If no schema is provided, return the text content directly
    if (!schema) {
      return content;
    }

    try {
      // Parse JSON content
      const jsonContent = JSON.parse(content);

      // Validate against schema
      const validationResult = schema.safeParse(jsonContent);

      if (!validationResult.success) {
        throw new ValidationError(`Response validation failed: ${validationResult.error.message}`);
      }

      return validationResult.data;
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }

      // Handle JSON parsing errors
      throw new OpenRouterError(`Failed to parse JSON response: ${(error as Error).message}`);
    }
  }
}
