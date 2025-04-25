import type { APIRoute } from "astro";
import type { AnalysisDetailsDTO, IssueDTO, PaginationDTO } from "../../../types";

export const prerender = false;

// Mock data generator for a single detailed analysis with issues
const generateMockAnalysisDetails = (id: string, page = 1, limit = 10, category?: string): AnalysisDetailsDTO => {
  // Generate mock issues with different categories
  const allIssues: IssueDTO[] = [
    // Critical issues
    {
      id: crypto.randomUUID(),
      category: "critical",
      description: "Missing information about the data controller identity",
      suggestion:
        "Add explicit information about the company acting as data controller, including legal name, registration number, and address.",
      created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
    {
      id: crypto.randomUUID(),
      category: "critical",
      description: "No information about the purpose of data processing",
      suggestion:
        "Include clear description of why the personal data is being collected and how it will be used, e.g.: 'Your data will be processed for the purpose of providing our services, including account management and customer support.'",
      created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
    {
      id: crypto.randomUUID(),
      category: "critical",
      description: "Missing legal basis for processing personal data",
      suggestion:
        "Specify the legal basis for processing under GDPR Article 6, e.g.: 'We process your data based on your consent / necessary for the performance of a contract / our legitimate interests.'",
      created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
    // Important issues
    {
      id: crypto.randomUUID(),
      category: "important",
      description: "Unclear information about data retention period",
      suggestion:
        "Add specific information about how long the data will be stored, e.g.: 'Your personal data will be stored for the duration of our contractual relationship and for an additional period of 5 years for legal purposes.'",
      created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
    {
      id: crypto.randomUUID(),
      category: "important",
      description: "Incomplete information about data subject rights",
      suggestion:
        "List all data subject rights under GDPR, including the right to access, rectification, erasure, restriction of processing, data portability, and objection to processing.",
      created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
    {
      id: crypto.randomUUID(),
      category: "important",
      description: "No information about third-party recipients of data",
      suggestion:
        "Specify categories of recipients with whom the data may be shared, e.g.: 'Your data may be shared with our payment processors, cloud service providers, and marketing partners, all of whom are bound by data processing agreements.'",
      created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    },
    // Minor issues
    {
      id: crypto.randomUUID(),
      category: "minor",
      description: "Contact details for data protection officer not prominent enough",
      suggestion:
        "Make the DPO contact information more prominent by adding a dedicated section with email and phone number.",
      created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    },
    {
      id: crypto.randomUUID(),
      category: "minor",
      description: "Language about automated decision-making is technical and hard to understand",
      suggestion:
        "Simplify the language about automated decision-making to make it more accessible to the average user, e.g.: 'We may use automated systems to analyze your preferences and recommend products to you. You can always request human intervention in these decisions.'",
      created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    },
    {
      id: crypto.randomUUID(),
      category: "minor",
      description: "Unclear explanation of the right to withdraw consent",
      suggestion:
        "Clarify that users can withdraw consent at any time and explain the practical ways to do so, e.g.: 'You can withdraw your consent at any time by logging into your account and changing your preferences or by contacting our support team.'",
      created_at: new Date(Date.now() - 0.5 * 86400000).toISOString(),
    },
    {
      id: crypto.randomUUID(),
      category: "critical",
      description: "No information about international data transfers",
      suggestion:
        "If data is transferred outside the EEA, specify the countries, the safeguards used (e.g., Standard Contractual Clauses), and how users can obtain a copy of these safeguards.",
      created_at: new Date(Date.now() - 0.5 * 86400000).toISOString(),
    },
    {
      id: crypto.randomUUID(),
      category: "important",
      description: "Consent bundled with terms and conditions",
      suggestion:
        "Separate consent from terms and conditions to ensure it is freely given, specific, informed, and unambiguous. Create separate checkboxes for different processing purposes.",
      created_at: new Date(Date.now() - 0.3 * 86400000).toISOString(),
    },
    {
      id: crypto.randomUUID(),
      category: "minor",
      description: "Small font size used for privacy information",
      suggestion:
        "Increase the font size of privacy information to ensure it is as readable and accessible as the rest of the content on your site.",
      created_at: new Date(Date.now() - 0.2 * 86400000).toISOString(),
    },
  ];

  // Filter issues by category if specified
  let filteredIssues = allIssues;
  if (category) {
    filteredIssues = allIssues.filter((issue) => issue.category === category);
  }

  // Calculate total issues count after filtering
  const total = filteredIssues.length;

  // Apply pagination
  const startIndex = (page - 1) * limit;
  const endIndex = Math.min(startIndex + limit, total);
  const paginatedIssues = filteredIssues.slice(startIndex, endIndex);

  // Create pagination info
  const issuesPagination: PaginationDTO = {
    total,
    page,
    limit,
    pages: Math.ceil(total / limit),
  };

  // Create and return mock analysis details
  return {
    id,
    text_content: `This is a detailed mock analysis with ID ${id}. It contains a long piece of text that would represent a privacy policy or consent form that has been analyzed. The system has identified several issues with this document, categorized as critical, important, and minor concerns regarding GDPR compliance.
    
This mock text represents a typical privacy policy with various sections including: how data is collected, why it's processed, who it's shared with, how long it's kept, security measures, and user rights. In a real scenario, this would be the full text submitted by the user for analysis.
    
The analysis has identified many issues of varying severity, from missing key required information (critical) to presentation concerns that might make the policy less accessible to users (minor).`,
    text_preview: `This is a detailed mock analysis with ID ${id}. It contains a long piece of text that would represent a privacy policy...`,
    status: "completed",
    model_version: "openai/gpt-4o-mini",
    detected_language: Math.random() > 0.5 ? "en" : "pl",
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    issues: paginatedIssues,
    issues_pagination: issuesPagination,
  };
};

export const GET: APIRoute = async ({ params, url }) => {
  try {
    const id = params.id;

    if (!id) {
      return new Response(
        JSON.stringify({
          error: "Missing identifier",
          details: "Analysis ID is required",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Parse query parameters
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "5", 10);
    const category = url.searchParams.get("category") || undefined;

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 50) {
      return new Response(
        JSON.stringify({
          error: "Invalid pagination parameters",
          details: "Page must be >= 1 and limit must be between 1-50",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Generate mock data
    const mockAnalysis = generateMockAnalysisDetails(id, page, limit, category);

    return new Response(JSON.stringify(mockAnalysis), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error processing GET analysis details request:", error);

    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: "Failed to retrieve analysis details",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
