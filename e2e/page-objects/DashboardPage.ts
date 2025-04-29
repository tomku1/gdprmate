import type { Page, Locator } from "@playwright/test";
import { expect } from "@playwright/test";

/**
 * Page Object Model for the Dashboard page
 * Handles interactions with the analysis form and related elements
 */
export class DashboardPage {
  readonly page: Page;
  readonly analysisForm: Locator;
  readonly textInput: Locator;
  readonly analyzeButton: Locator;
  readonly characterCounter: Locator;
  readonly loadingSpinner: Locator;

  constructor(page: Page) {
    this.page = page;
    this.analysisForm = page.locator('[data-test-id="analysis-form"]');
    this.textInput = page.locator('[data-test-id="analysis-text-input"]');
    this.analyzeButton = page.locator('[data-test-id="analyze-button"]');
    this.characterCounter = page.locator(".relative.space-y-2 .text-sm span:first-child");
    this.loadingSpinner = page.locator('[data-testid="spinner-overlay"]');
  }

  /**
   * Navigate to the dashboard page
   */
  async goto() {
    await this.page.goto("/dashboard");
    await expect(this.analysisForm).toBeVisible();
  }

  /**
   * Enter text into the analysis text area
   * @param text The text to enter for analysis
   */
  async enterAnalysisText(text: string) {
    await this.textInput.fill(text);
    // Wait for a moment to ensure the counter has updated
    await this.page.waitForTimeout(100);
    // Verify the text was entered by checking the textarea value directly
    const inputValue = await this.textInput.inputValue();
    expect(inputValue).toBe(text);
  }

  /**
   * Click the analyze button
   */
  async clickAnalyze() {
    await expect(this.analyzeButton).toBeEnabled();
    await this.analyzeButton.click();
  }

  /**
   * Complete the entire analysis workflow
   * @param text The text to analyze
   */
  async completeAnalysis(text: string) {
    await this.enterAnalysisText(text);
    await this.clickAnalyze();
  }
}
