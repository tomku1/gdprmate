import { describe, it, expect, vi, beforeEach, afterAll, beforeAll } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { AnalysisService } from "../analysis.service";
import { OpenRouterService } from "../openrouter.service";
import { getGdprReferenceText } from "../../gdpr/gdprLoader";
import type {
  CreateAnalysisCommand,
  DocumentInsert,
  AnalysisInsert,
  AnalysisIssueInsert,
  IssueCategory,
} from "../../../types";
import { AnalysisError } from "../../errors";
import { z } from "zod";

// --- Replicate internal definitions from AnalysisService ---
// Define the schema for GDPR analysis issues (copied from analysis.service.ts)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const gdprIssueSchema = z.object({
  issues: z.array(
    z.object({
      category: z.enum(["critical", "important", "minor"]),
      description: z.string(),
      suggestion: z.string(),
    })
  ),
  summary: z.string().optional(),
});

// Type for the response from the LLM (copied from analysis.service.ts)
interface GdprAnalysisResult {
  issues: {
    category: IssueCategory; // Assuming IssueCategory is imported from ../../types
    description: string;
    suggestion: string;
  }[];
  summary?: string;
}
// --- End Replicated definitions ---

// --- Mocks ---

// Mock SupabaseClient
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockEq = vi.fn();
const mockFrom = vi.fn(() => ({
  insert: mockInsert,
  update: mockUpdate.mockReturnThis(),
  eq: mockEq,
}));

const mockSupabase = {
  from: mockFrom,
} as unknown as SupabaseClient;

// Mock OpenRouterService
const mockCompleteChat = vi.fn();

const mockOpenRouterService = {
  completeChat: mockCompleteChat,
} as unknown as OpenRouterService;

// Mock getGdprReferenceText
vi.mock("../../gdpr/gdprLoader", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../gdpr/gdprLoader")>();
  return {
    ...actual,
    getGdprReferenceText: vi.fn().mockResolvedValue("Mock GDPR Reference Text"),
  };
});

// Mock crypto.randomUUID
const mockUuid = "mock-uuid-";
let uuidCounter = 0;
vi.stubGlobal("crypto", {
  ...global.crypto,
  randomUUID: vi.fn(() => `${mockUuid}${++uuidCounter}`),
});

// Mock Date
const mockDateNow = 1678886400000; // March 15, 2023 12:00:00 PM UTC

// --- Test Suite ---

describe("AnalysisService", () => {
  let analysisService: AnalysisService;
  let analysisServiceWithoutOpenRouter: AnalysisService;
  const userId = "user-123";
  const command: CreateAnalysisCommand = {
    text_content: "This is the text content to analyze for GDPR compliance. It needs to be long enough.",
  };

  beforeAll(() => {
    // Zamrażamy czas dla testów
    vi.useFakeTimers();
    vi.setSystemTime(new Date(mockDateNow));
  });

  afterAll(() => {
    // Przywracamy prawdziwy czas po testach
    vi.useRealTimers();
    vi.unstubAllGlobals(); // Clean up global mocks
  });

  beforeEach(() => {
    // Reset mocks and counters before each test
    vi.clearAllMocks();
    uuidCounter = 0;
    vi.setSystemTime(new Date(mockDateNow)); // Reset time for each test

    // Reset Supabase mock functions
    mockFrom.mockClear();
    mockInsert.mockClear();
    mockUpdate.mockClear();
    mockEq.mockClear();

    // Reset mock return values (important for successive tests)
    mockInsert.mockResolvedValue({ error: null, data: [{}] }); // Default success
    mockUpdate.mockResolvedValue({ error: null, data: [{}] }); // Default success for update itself
    mockEq.mockResolvedValue({ error: null, data: [{}] }); // Default success for eq filtering
    // Restore default implementation for mockFrom
    mockFrom.mockImplementation(() => ({
      insert: mockInsert,
      update: mockUpdate.mockReturnThis(),
      eq: mockEq,
    }));

    // Reset OpenRouter mock
    mockCompleteChat.mockClear();
    // Reset specific mock behaviors if needed for OpenRouter
    mockCompleteChat.mockReset(); // Resets implementations/return values too

    // Reset GDPR loader mock
    vi.mocked(getGdprReferenceText).mockClear();
    vi.mocked(getGdprReferenceText).mockResolvedValue("Mock GDPR Reference Text"); // Upewnij się, że jest zresetowane

    // Create new service instances for each test
    analysisService = new AnalysisService(mockSupabase, mockOpenRouterService);
    analysisServiceWithoutOpenRouter = new AnalysisService(mockSupabase); // No OpenRouterService
  });

  // --- Test Cases ---

  it("should throw error if OpenRouterService is not provided", async () => {
    await expect(analysisServiceWithoutOpenRouter.createAnalysis(userId, command)).rejects.toThrow(AnalysisError);
    await expect(analysisServiceWithoutOpenRouter.createAnalysis(userId, command)).rejects.toThrow(
      "OpenRouter service is required for analysis but not initialized"
    );
  });

  it("should successfully create an analysis with issues", async () => {
    const mockApiResponse: GdprAnalysisResult = {
      issues: [
        { category: "critical", description: "Missing controller info", suggestion: "Add controller details" },
        { category: "important", description: "Unclear retention", suggestion: "Specify retention period" },
      ],
    };
    mockCompleteChat.mockResolvedValue(mockApiResponse);

    const startTime = mockDateNow;
    const expectedAnalysisId = `${mockUuid}2`;
    const endTime = startTime + 500;
    vi.setSystemTime(new Date(endTime));

    const result = await analysisService.createAnalysis(userId, command);

    expect(getGdprReferenceText).toHaveBeenCalledTimes(1);

    expect(mockCompleteChat).toHaveBeenCalledTimes(1);
    expect(mockCompleteChat).toHaveBeenCalledWith(
      command.text_content,
      expect.objectContaining({
        systemPrompt: expect.stringContaining("Mock GDPR Reference Text"),
        responseSchema: expect.any(z.ZodObject),
        params: { temperature: 0.1, max_tokens: 3000 },
      })
    );

    expect(mockFrom).toHaveBeenCalledWith("documents");

    expect(mockFrom).toHaveBeenCalledWith("analyses");

    expect(mockFrom).toHaveBeenCalledWith("analysis_issues");

    expect(mockInsert).toHaveBeenCalledTimes(3);

    expect(mockFrom).toHaveBeenCalledWith("analyses");
    expect(mockUpdate).toHaveBeenCalledWith({
      status: "completed",
      completed_at: new Date(endTime).toISOString(),
      duration_ms: expect.any(Number),
    });
    expect(mockEq).toHaveBeenCalledWith("id", expectedAnalysisId);

    expect(result).toEqual({
      id: expectedAnalysisId,
      text_preview: expect.any(String),
      detected_language: "en",
      created_at: expect.any(String),
      issues: expect.any(Array),
      issues_pagination: {
        total: 2,
        page: 1,
        limit: 10,
        pages: 1,
      },
    });
    expect(result.issues).toHaveLength(2);
    expect(result.issues[0]).toEqual({
      id: `${mockUuid}3`,
      user_id: userId,
      analysis_id: expectedAnalysisId,
      category: "critical",
      description: "Missing controller info",
      suggestion: "Add controller details",
      created_at: expect.any(String),
    });
    expect(result.issues[1]).toEqual({
      id: `${mockUuid}4`,
      user_id: userId,
      analysis_id: expectedAnalysisId,
      category: "important",
      description: "Unclear retention",
      suggestion: "Specify retention period",
      created_at: expect.any(String),
    });
  });

  it("should successfully create an analysis with minimal issues", async () => {
    const mockApiResponse: GdprAnalysisResult = {
      issues: [{ category: "minor", description: "Single minor issue", suggestion: "Just a suggestion" }],
    };
    mockCompleteChat.mockResolvedValue(mockApiResponse);

    const result = await analysisService.createAnalysis(userId, command);
    const expectedAnalysisId = `${mockUuid}2`;

    const insertCalls = mockInsert.mock.calls;
    expect(insertCalls).toHaveLength(3); // Document, analysis, and issue
    expect(mockFrom).toHaveBeenCalledWith("documents");
    expect(mockFrom).toHaveBeenCalledWith("analyses");
    expect(mockFrom).toHaveBeenCalledWith("analysis_issues");

    expect(mockFrom).toHaveBeenCalledWith("analyses");
    expect(mockUpdate).toHaveBeenCalledWith({
      status: "completed",
      completed_at: expect.any(String),
      duration_ms: expect.any(Number),
    });
    expect(mockEq).toHaveBeenCalledWith("id", expectedAnalysisId);

    expect(result.id).toBe(expectedAnalysisId);
    expect(result.issues).toHaveLength(1);
    expect(result.issues_pagination.total).toBe(1);
  });

  it("should throw AnalysisError if OpenRouter returns invalid data (not an object)", async () => {
    mockCompleteChat.mockResolvedValue("invalid response");

    await expect(analysisService.createAnalysis(userId, command)).rejects.toThrow(AnalysisError);
    await expect(analysisService.createAnalysis(userId, command)).rejects.toThrow(
      "Analysis failed: Invalid response structure from OpenRouter"
    );
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it("should throw AnalysisError if OpenRouter returns object without issues array", async () => {
    mockCompleteChat.mockResolvedValue({ someOtherProp: "value" });

    await expect(analysisService.createAnalysis(userId, command)).rejects.toThrow(AnalysisError);
    await expect(analysisService.createAnalysis(userId, command)).rejects.toThrow(
      "Analysis failed: Invalid response structure from OpenRouter"
    );
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it("should throw AnalysisError if OpenRouter returns empty issues array", async () => {
    mockCompleteChat.mockResolvedValue({ issues: [] });

    await expect(analysisService.createAnalysis(userId, command)).rejects.toThrow(AnalysisError);
    await expect(analysisService.createAnalysis(userId, command)).rejects.toThrow(
      "Analysis failed: Invalid response structure from OpenRouter"
    );
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it("should throw AnalysisError if OpenRouter.completeChat fails", async () => {
    const errorMessage = "API Key Invalid";
    mockCompleteChat.mockRejectedValue(new Error(errorMessage));

    await expect(analysisService.createAnalysis(userId, command)).rejects.toThrow(AnalysisError);
    await expect(analysisService.createAnalysis(userId, command)).rejects.toThrow(`Analysis failed: ${errorMessage}`);
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it("should throw error if document insert fails", async () => {
    const mockApiResponse: GdprAnalysisResult = { issues: [{ category: "minor", description: "d", suggestion: "s" }] };
    mockCompleteChat.mockResolvedValue(mockApiResponse);
    const dbError = { message: "Insert document failed", details: "", hint: "", code: "123" };

    mockInsert.mockImplementation(async (data: DocumentInsert | DocumentInsert[]) => {
      const isDocument = Array.isArray(data) ? data[0]?.text_content : data?.text_content;
      if (isDocument) {
        return { error: dbError, data: null };
      }
      return { error: null, data: [{}] };
    });

    await expect(analysisService.createAnalysis(userId, command)).rejects.toThrow(
      `Failed to create document: ${dbError.message}`
    );

    expect(mockCompleteChat).toHaveBeenCalledTimes(1);
    expect(mockFrom).toHaveBeenCalledWith("documents");
    expect(mockInsert).toHaveBeenCalledTimes(1);
    expect(mockFrom).not.toHaveBeenCalledWith("analyses");
  });

  it("should throw error if analysis insert fails", async () => {
    const mockApiResponse: GdprAnalysisResult = { issues: [{ category: "minor", description: "d", suggestion: "s" }] };
    mockCompleteChat.mockResolvedValue(mockApiResponse);
    const dbError = { message: "Insert analysis failed", details: "", hint: "", code: "456" };

    mockInsert.mockImplementation(async (data: DocumentInsert | AnalysisInsert | AnalysisInsert[]) => {
      let isAnalysis = false;
      if (Array.isArray(data)) {
        isAnalysis = data.length > 0 && "document_id" in data[0] && !("analysis_id" in data[0]);
      } else {
        isAnalysis = "document_id" in data && !("text_content" in data) && !("analysis_id" in data);
      }

      if (isAnalysis) {
        return { error: dbError, data: null };
      }
      return { error: null, data: [{}] };
    });

    await expect(analysisService.createAnalysis(userId, command)).rejects.toThrow(
      `Failed to create analysis: ${dbError.message}`
    );

    expect(mockCompleteChat).toHaveBeenCalledTimes(1);
    expect(mockFrom).toHaveBeenCalledWith("documents");
    expect(mockFrom).toHaveBeenCalledWith("analyses");
    expect(mockInsert).toHaveBeenCalledTimes(2);
    expect(mockFrom).not.toHaveBeenCalledWith("analysis_issues");
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("should throw error if analysis_issues insert fails", async () => {
    const mockApiResponse: GdprAnalysisResult = { issues: [{ category: "minor", description: "d", suggestion: "s" }] };
    mockCompleteChat.mockResolvedValue(mockApiResponse);
    const dbError = { message: "Insert issues failed", details: "", hint: "", code: "789" };

    mockInsert.mockImplementation(async (data: DocumentInsert | AnalysisInsert | AnalysisIssueInsert[]) => {
      const isIssuesArray = Array.isArray(data) && data.length > 0 && data[0]?.analysis_id;
      if (isIssuesArray) {
        return { error: dbError, data: null };
      }
      return { error: null, data: [{}] };
    });

    await expect(analysisService.createAnalysis(userId, command)).rejects.toThrow(
      `Failed to create issues: ${dbError.message}`
    );

    expect(mockCompleteChat).toHaveBeenCalledTimes(1);
    expect(mockFrom).toHaveBeenCalledWith("documents");
    expect(mockFrom).toHaveBeenCalledWith("analyses");
    expect(mockFrom).toHaveBeenCalledWith("analysis_issues");
    expect(mockInsert).toHaveBeenCalledTimes(3);
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("should generate correct text preview (short text)", async () => {
    const shortCommand: CreateAnalysisCommand = { text_content: "Short text." };
    const mockApiResponse: GdprAnalysisResult = {
      issues: [{ category: "minor", description: "Test issue", suggestion: "Test suggestion" }],
    };
    mockCompleteChat.mockResolvedValue(mockApiResponse);

    const result = await analysisService.createAnalysis(userId, shortCommand);
    expect(result.text_preview).toBe("Short text.");
  });

  it("should generate correct text preview (long text)", async () => {
    const longCommand: CreateAnalysisCommand = { text_content: "a".repeat(150) };
    const mockApiResponse: GdprAnalysisResult = {
      issues: [{ category: "minor", description: "Test issue", suggestion: "Test suggestion" }],
    };
    mockCompleteChat.mockResolvedValue(mockApiResponse);

    const result = await analysisService.createAnalysis(userId, longCommand);
    expect(result.text_preview).toBe("a".repeat(100) + "...");
  });

  it("should log error before rethrowing in createAnalysis", async () => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {}); // Keep disabled empty function for spy
    const errorMessage = "Internal Server Error during analysis";
    mockCompleteChat.mockRejectedValue(new Error(errorMessage));

    await expect(analysisService.createAnalysis(userId, command)).rejects.toThrow(AnalysisError);

    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith("Error in createAnalysis:", expect.any(AnalysisError));
    expect(consoleErrorSpy.mock.calls[0][1].message).toContain(errorMessage);

    consoleErrorSpy.mockRestore();
  });
});
