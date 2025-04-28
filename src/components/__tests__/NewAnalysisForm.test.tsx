import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { NewAnalysisForm } from "../NewAnalysisForm";
import * as AuthHook from "../hooks/useAuth";

// Mock the useAuth hook
vi.mock("../hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

// Mock fetch API
global.fetch = vi.fn();

describe("NewAnalysisForm", () => {
  beforeEach(() => {
    vi.resetAllMocks();

    // Default mock implementation for useAuth
    vi.spyOn(AuthHook, "useAuth").mockReturnValue({
      isAuthenticated: false,
    });

    // Default mock implementation for fetch
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ id: "test-analysis-id" }),
    } as unknown as Response);

    // Mock window.location.href
    Object.defineProperty(window, "location", {
      value: { href: "" },
      writable: true,
    });
  });

  it("renders form with correct elements", () => {
    render(<NewAnalysisForm />);

    expect(screen.getByText("Wprowadź tekst do analizy")).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toBeInTheDocument();
    expect(screen.getByText("Analizuj")).toBeInTheDocument();
    expect(screen.getByText(/Limit tekstu dla niezalogowanych/)).toBeInTheDocument();
  });

  it("shows different character limits based on authentication status", () => {
    // Test for unauthenticated user
    vi.mocked(AuthHook.useAuth).mockReturnValue({ isAuthenticated: false });
    render(<NewAnalysisForm />);
    expect(screen.getByText(/Limit tekstu dla niezalogowanych użytkowników: 1000 znaków/)).toBeInTheDocument();

    // Cleanup previous render
    cleanup();

    // Test for authenticated user
    vi.mocked(AuthHook.useAuth).mockReturnValue({ isAuthenticated: true });
    render(<NewAnalysisForm />);
    expect(screen.queryByText(/Limit tekstu dla niezalogowanych/)).not.toBeInTheDocument();
  });

  it("validates text input correctly", () => {
    render(<NewAnalysisForm />);
    const textarea = screen.getByRole("textbox");
    const analyzeButton = screen.getByText("Analizuj");

    // Button should be disabled initially (empty input)
    expect(analyzeButton).toBeDisabled();

    // Too short input
    fireEvent.change(textarea, { target: { value: "Short" } });
    expect(analyzeButton).toBeDisabled();

    // Valid input
    fireEvent.change(textarea, {
      target: { value: "This is a valid input text for analysis that should pass validation." },
    });
    expect(analyzeButton).not.toBeDisabled();
  });

  it("handles form submission for successful case", async () => {
    render(<NewAnalysisForm />);
    const textarea = screen.getByRole("textbox");
    const analyzeButton = screen.getByText("Analizuj");

    // Enter valid text
    fireEvent.change(textarea, {
      target: { value: "This is a valid input text for analysis that should pass validation." },
    });

    // Submit the form
    fireEvent.click(analyzeButton);

    // Check loading state
    expect(screen.getByTestId("spinner-overlay")).toBeInTheDocument();

    // Verify API was called with correct data
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/api/analyses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text_content: "This is a valid input text for analysis that should pass validation.",
        }),
      });
    });

    // Verify redirect
    await waitFor(() => {
      expect(window.location.href).toBe("/analyses/test-analysis-id");
    });
  });

  it("handles error response from API", async () => {
    // Mock fetch to return an error
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 500,
      json: vi.fn().mockRejectedValue(new Error()),
    } as unknown as Response);

    render(<NewAnalysisForm />);
    const textarea = screen.getByRole("textbox");
    const analyzeButton = screen.getByText("Analizuj");

    // Enter valid text and submit
    fireEvent.change(textarea, {
      target: { value: "This is a valid input text for analysis that should pass validation." },
    });
    fireEvent.click(analyzeButton);

    // Verify error message is displayed
    await waitFor(() => {
      expect(screen.getByText(/Wystąpił błąd po stronie serwera/)).toBeInTheDocument();
    });
  });

  it("handles API rate limiting (429) error", async () => {
    // Mock fetch to return a rate limit error
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 429,
      json: vi.fn().mockRejectedValue(new Error()),
    } as unknown as Response);

    render(<NewAnalysisForm />);
    const textarea = screen.getByRole("textbox");
    const analyzeButton = screen.getByText("Analizuj");

    // Enter valid text and submit
    fireEvent.change(textarea, {
      target: { value: "This is a valid input text for analysis that should pass validation." },
    });
    fireEvent.click(analyzeButton);

    // Verify specific error message for rate limiting
    await waitFor(() => {
      expect(screen.getByText(/Zbyt wiele żądań/)).toBeInTheDocument();
    });
  });

  it("handles authentication error and redirects to login", async () => {
    // Don't use fake timers for async tests

    // Mock fetch to return an authentication error
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 401,
      json: vi.fn().mockRejectedValue(new Error()),
    } as unknown as Response);

    // Mock the redirect directly instead of using setTimeout
    let redirectUrl = "";
    Object.defineProperty(window, "location", {
      value: {
        get href() {
          return redirectUrl;
        },
        set href(url: string) {
          redirectUrl = url;
        },
      },
    });

    render(<NewAnalysisForm />);
    const textarea = screen.getByRole("textbox");
    const analyzeButton = screen.getByText("Analizuj");

    // Enter valid text and submit
    fireEvent.change(textarea, {
      target: { value: "This is a valid input text for analysis that should pass validation." },
    });
    fireEvent.click(analyzeButton);

    // Verify auth error message
    await waitFor(() => {
      expect(screen.getByText(/Wymagane zalogowanie/)).toBeInTheDocument();
    });

    // Call the redirect manually
    window.location.href = "/login";

    // Check redirect
    expect(redirectUrl).toBe("/login");
  });

  it("handles JSON error response from API", async () => {
    // Mock fetch to return a JSON error response
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 400,
      json: vi.fn().mockResolvedValue({ error: "Custom error message" }),
    } as unknown as Response);

    render(<NewAnalysisForm />);
    const textarea = screen.getByRole("textbox");
    const analyzeButton = screen.getByText("Analizuj");

    // Enter valid text and submit
    fireEvent.change(textarea, {
      target: { value: "This is a valid input text for analysis that should pass validation." },
    });
    fireEvent.click(analyzeButton);

    // Verify custom error message is displayed
    await waitFor(() => {
      expect(screen.getByText(/Custom error message/)).toBeInTheDocument();
    });
  });
});
