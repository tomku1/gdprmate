import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs/promises";

/**
 * Gets the absolute path to the GDPR text file
 */
function getGdprFilePath(): string {
  // Get the directory path of the current module
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  // Build path to the GDPR text file
  return join(__dirname, "gdpr.txt");
}

/**
 * Loads the GDPR reference text from a file in the lib directory
 * This ensures the text is bundled with the server code during build
 */
export async function loadGdprReferenceText(): Promise<string> {
  try {
    const filePath = getGdprFilePath();
    const text = await fs.readFile(filePath, "utf-8");
    return text;
  } catch (error) {
    console.error("Error loading GDPR reference text:", error);
    throw new Error(`Failed to load GDPR reference text: ${(error as Error).message}`);
  }
}

// Cache for the GDPR text to avoid repeated file reads
let cachedGdprText: string | null = null;

/**
 * Gets the GDPR reference text, using cache if available
 */
export async function getGdprReferenceText(): Promise<string> {
  if (cachedGdprText) {
    return cachedGdprText;
  }

  cachedGdprText = await loadGdprReferenceText();
  return cachedGdprText;
}
