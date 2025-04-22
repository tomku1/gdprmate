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

| Command            | Description                              |
| ------------------ | ---------------------------------------- |
| `npm run dev`      | Start local dev server (`astro dev`)     |
| `npm run build`    | Build for production (`astro build`)     |
| `npm run preview`  | Preview production build (`astro preview`)|
| `npm run lint`     | Run ESLint checks                        |
| `npm run lint:fix` | Auto-fix lint issues                     |
| `npm run format`   | Format code with Prettier                |

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

