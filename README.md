# GdprMate

[![Node.js Version](https://img.shields.io/badge/node-22.14.0-brightgreen)]()
[![Status: MVP](https://img.shields.io/badge/status-MVP-yellow)]()

## Table of Contents

1. [Project Description](#project-description)
2. [Tech Stack](#tech-stack)
3. [Getting Started](#getting-started)
4. [Available Scripts](#available-scripts)
5. [Project Scope](#project-scope)
6. [Project Status](#project-status)
7. [License](#license)
8. [Hosting](#hosting)

## User for testing 

user: 10xdev@test.pl
pass: Test123 


## Project Description

GdprMate is a web-based assistant for GDPR compliance. It helps users quickly analyze legal documents—such as privacy notices and consent clauses—against key requirements (Articles 7, 13, 14). The app automatically identifies missing or incorrect elements, categorizes issues by severity (critical, major, minor), and offers suggested corrective language. Registered users can store documents, review past analyses, filter and sort results, and work on multiple devices thanks to a responsive interface.

## Tech Stack

- **Frontend**
  - Astro 5  
  - React 19  
  - TypeScript 5  
  - Tailwind 4  
  - Shadcn/ui  

- **Backend**
  - Supabase (PostgreSQL + Auth)  

- **AI/LLM Integration**
  - Openrouter.ai (connects to OpenAI, Anthropic, Google, etc.; cost limits)

- **Testing**
  - Vitest (unit and integration tests)
  - React Testing Library (component testing)
  - Playwright (E2E testing)
  - MSW (API mocking)

- **CI/CD & Hosting**
  - GitHub Actions  
  - DigitalOcean (Docker)

## Getting Started

### Prerequisites

- [nvm](https://github.com/nvm-sh/nvm)  
- Node.js v22.14.0 (see `.nvmrc`)  
- npm

### Installation

```bash
git clone https://github.com/<your-username>/gdprmate.git
cd gdprmate
nvm install
nvm use
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
OPENROUTER_API_KEY=your_openrouter_api_key
```

### Running Locally

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

## Available Scripts

| Command                 | Description                              |
| ----------------------- | ---------------------------------------- |
| `npm run dev`           | Start local dev server (`astro dev`)     |
| `npm run build`         | Build for production (`astro build`)     |
| `npm run preview`       | Preview production build (`astro preview`)|
| `npm run lint`          | Run ESLint checks                        |
| `npm run lint:fix`      | Auto-fix lint issues                     |
| `npm run format`        | Format code with Prettier                |
| `npm run test`          | Run unit tests (Vitest)                  |
| `npm run test:watch`    | Run unit tests in watch mode             |
| `npm run test:ui`       | Run unit tests with UI                   |
| `npm run test:coverage` | Run unit tests with coverage report      |
| `npm run test:e2e`      | Run E2E tests (Playwright)               |
| `npm run test:e2e:ui`   | Run E2E tests with UI                    |
| `npm run test:e2e:codegen` | Generate E2E tests with Playwright    |

## Testing

### Unit Testing with Vitest

We use Vitest for unit and component testing:

```bash
# Run all unit tests
npm run test

# Run tests in watch mode during development
npm run test:watch

# Run tests with UI for debugging
npm run test:ui

# Generate coverage report
npm run test:coverage
```

Unit tests follow these conventions:
- Test files are located next to the implementation files with a `.test.tsx` or `.spec.tsx` suffix
- Components are tested with React Testing Library
- MSW is used for mocking API requests

### E2E Testing with Playwright

We use Playwright for end-to-end testing:

```bash
# Run all E2E tests
npm run test:e2e

# Run E2E tests with UI for debugging
npm run test:e2e:ui

# Generate E2E tests with Playwright's codegen tool
npm run test:e2e:codegen
```

E2E tests follow these conventions:
- Tests are located in the `e2e` directory
- Page Object Model pattern is used for better maintainability
- Tests run against a preview build of the application
- Visual comparison is used for detecting UI regressions

## Project Scope

### In-Scope Features

- Automated analysis of privacy notices (Art. 13 & 14) and consent clauses (Art. 7)  
- Support for text input (copy-paste), `.txt`, `.pdf`, and `.docx` files  
- Severity categorization and visual highlighting  
- Suggestion generation for corrective language  
- User registration, login, and secure sessions  
- Document & analysis history with filtering and sorting  
- Responsive UI (desktop, tablet, mobile)  
- Multi-language support (Polish & English)  
- Basic security (input validation, auth/authorization, row-level security)

### Out-of-Scope (MVP)

- Legal advice or detailed interpretations  
- External system integrations (CRMs, ERPs)  
- Advanced analytics, dashboards, or notifications  
- Dedicated mobile app  
- Export features (PDF/CSV), document versioning, interactive tutorials

## Project Status

This project is currently in **MVP** development. Core features are implemented; focus is on improving analysis accuracy, UX, and stability.

## Hosting

This application is hosted on **Cloudflare Pages**.

### Why Cloudflare Pages?

Cloudflare Pages was chosen due to several key advantages relevant to this project's current stage and future potential:

1.  **Cost-Effectiveness:** Offers an extremely generous free tier that supports commercial use, including unlimited sites, requests, and bandwidth (subject to fair use). This significantly minimizes initial operational costs while allowing the project to scale. The paid plan is also very competitively priced with a flat monthly fee.
2.  **Performance:** Leverages Cloudflare's extensive global edge network, ensuring fast load times for users worldwide by serving content from locations close to them.
3.  **Astro Integration:** Provides first-class support for Astro, including seamless deployment for static sites, SSR (Server-Side Rendering), and Edge Functions via Cloudflare Workers.
4.  **Scalability:** The underlying infrastructure (Workers, Edge Network) is built for high scalability, accommodating potential growth into a commercial product without requiring platform migrations.
5.  **Developer Experience:** Offers simple Git-based deployments (connects directly to GitHub/GitLab) and provides features like automatic preview deployments for branches.

While platforms like Vercel or Netlify also offer excellent Astro support, Cloudflare Pages provides the best balance of features, performance, and cost-effectiveness, especially considering the possibility of future commercialization on a budget.

