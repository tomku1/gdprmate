import { test, expect } from "@playwright/test";
import { DashboardPage } from "../page-objects/DashboardPage";

test.describe("Dashboard Analysis Flow", () => {
  test("User can view and interact with analysis form", async ({ page }) => {
    // Initialize the Dashboard page object
    const dashboardPage = new DashboardPage(page);

    // Navigate to the dashboard
    await dashboardPage.goto();

    // Verify form components are visible
    await expect(dashboardPage.analysisForm).toBeVisible();
    await expect(dashboardPage.textInput).toBeVisible();
    await expect(dashboardPage.analyzeButton).toBeDisabled(); // Initially disabled with empty input

    // Enter sample text
    const sampleText = "This is a test analysis text that is long enough to pass validation.";
    await dashboardPage.enterAnalysisText(sampleText);

    // Verify button is enabled after entering valid text
    await expect(dashboardPage.analyzeButton).toBeEnabled();
  });

  test("Shows validation error for too short text", async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.goto();

    // Enter text that's too short (less than 10 characters)
    await dashboardPage.enterAnalysisText("Test");

    // Check that the analyze button is disabled
    await expect(dashboardPage.analyzeButton).toBeDisabled();

    // Wait a moment for validation to process
    await page.waitForTimeout(300);

    // Check if we can find any alert with appropriate text
    const alertWithText = page.getByText("Tekst powinien zawierać co najmniej 10 znaków");
    await expect(alertWithText).toBeVisible();
  });
});
