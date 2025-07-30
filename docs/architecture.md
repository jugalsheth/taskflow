TaskFlow Fullstack Architecture Document
1. Introduction
This document outlines the complete fullstack architecture for TaskFlow, including backend systems, frontend implementation, and their integration. It serves as the single source of truth for AI-driven development, ensuring consistency across the entire technology stack.

Starter Template or Existing Project
Based on the PRD, specific technologies have been chosen (Next.js, Drizzle, etc.), but no particular starter template (like the T3 Stack or a specific Vercel template) was specified. The architecture will therefore be based on a standard create-next-app initialization, with the required libraries and configurations added manually according to the patterns defined in this document.

Change Log
Date	Version	Description	Author
2025-07-30	1.0	Initial architecture draft created.	Winston, Architect

Export to Sheets
2. High Level Architecture
Technical Summary
The architecture for TaskFlow is a modern, full-stack, serverless application deployed entirely on the Vercel platform. The frontend is a responsive React application built with Next.js and styled with Tailwind CSS. The backend consists of serverless functions, also handled by Next.js API Routes. Data is persisted in a Vercel Postgres database and accessed via the Drizzle ORM. This monorepo approach is designed for rapid development, type safety, scalability, and simplified operational overhead.

High Level Overview
Architectural Style: A serverless architecture where the frontend and backend API are served by the same Next.js application.

Repository Structure: A Monorepo will be used to contain all frontend, backend, and shared code in a single repository, simplifying dependency management.

Data Flow: The user interacts with the React frontend, which makes API calls to the Next.js API routes. These serverless functions contain the business logic, interact with the database via Drizzle ORM, and return data to the frontend.

High Level Project Diagram
Code snippet

graph TD
    A[User] --> B[Vercel Edge Network];
    B --> C{Next.js Application};
    
    subgraph C
        D[Frontend (React Components)]
        E[API Routes (Serverless Functions)]
    end

    D <--> E;
    E --> F[Drizzle ORM];
    F --> G[(Vercel Postgres DB)];
    E --> H[NextAuth.js];
    E --> I[Stripe API (Post-MVP)];

    style G fill:#d3eaff,stroke:#333,stroke-width:2px
    style I fill:#f2f2f2,stroke:#333,stroke-width:2px
Architectural and Design Patterns
Serverless Architecture: Using Next.js API Routes on Vercel for all backend logic eliminates the need to manage traditional servers, aligning with the goals of scalability and simplified deployment.

Component-Based UI: Utilizing React and Shadcn UI to build the frontend from modular, reusable components, promoting maintainability and development speed.

ORM Pattern: Using Drizzle ORM to abstract all database interactions. This provides critical type safety between the database and application code, reducing runtime errors.

Monorepo: Housing all code in a single repository. This is a best practice for full-stack TypeScript projects as it allows for easy sharing of types and utilities between the frontend and backend.

3. Tech Stack
Technology Stack Table
Category	Technology	Version	Purpose	Rationale
Frontend Language	TypeScript	5.9	Provides static typing for robust, error-resistant code.	
Frontend Framework	Next.js	15.4.1	The core React framework for the full-stack application.	
UI Library	React	19	Powers the component-based user interface.	
UI Components	Shadcn UI	(latest)	Provides a library of pre-built, accessible components.	
State Management	React Context/Hooks	19	Manages application state without external libraries.	
Backend Language	TypeScript	5.9	Ensures type safety on the server.	
Backend Framework	Next.js API Routes	15.4.1	Handles all backend logic via serverless functions.	
API Style	REST	(built-in)	Standard for client-server communication.	
Database	Vercel Postgres	(latest)	The primary data store for the application.	
Database ORM	Drizzle ORM	0.44.3	Provides a type-safe interface to the database.	
Authentication	NextAuth.js	5.0.0-beta	Manages user sign-up, login, and sessions.	
Frontend Testing	Jest & RTL	30.0.5	For unit and component testing of the UI.	
Backend Testing	Jest	30.0.5	For unit testing of API routes and business logic.	
E2E Testing	Playwright	1.54.1	For end-to-end testing of user flows.	
Styling	Tailwind CSS	4.1.11	A utility-first CSS framework for rapid styling.	
Deployment	Vercel	(latest)	The platform for hosting and deploying the application.	
CI/CD	GitHub Actions	(latest)	Automates testing and deployment workflows.	

Export to Sheets
4. Data Models
User
Purpose: Represents a registered user of the application.

Relationships: A User can have many ChecklistTemplates and many ChecklistInstances.

TypeScript Interface:

TypeScript

interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: Date;
}
ChecklistTemplate
Purpose: Represents a reusable checklist definition created by a user.

Relationships: Belongs to one User. Can have many Steps. Can be the source for many ChecklistInstances.

TypeScript Interface:

TypeScript

interface ChecklistTemplate {
  id: string;
  userId: string;
  title: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}
Step
Purpose: Represents a single, ordered step within a ChecklistTemplate.

Relationships: Belongs to one ChecklistTemplate.

TypeScript Interface:

TypeScript

interface Step {
  id: string;
  templateId: string;
  content: string;
  order: number; // To maintain the sequence of steps
}
ChecklistInstance
Purpose: Represents a single, "live" run of a checklist started from a ChecklistTemplate. It tracks the real-time progress.

Relationships: Belongs to one User and one ChecklistTemplate.

TypeScript Interface:

TypeScript

interface ChecklistInstance {
  id: string;
  userId: string;
  templateId: string;
  status: 'in-progress' | 'completed';
  stepStates: StepState[]; // Array to hold the state of each step
  createdAt: Date;
  updatedAt: Date;
}

interface StepState {
  stepId: string;
  isCompleted: boolean;
}
5. API Specification
REST API Specification
YAML

openapi: 3.0.0
info:
  title: TaskFlow API
  version: 1.0.0
  description: The API for the TaskFlow application, handling checklist templates, instances, and user data.
servers:
  - url: /api
    description: The base path for all API routes within the Next.js application.
paths:
  /templates:
    get:
      summary: Get all of the current user's checklist templates.
    post:
      summary: Create a new checklist template.
  /templates/{templateId}:
    get:
      summary: Get a single checklist template by its ID.
    put:
      summary: Update an existing checklist template.
    delete:
      summary: Delete a checklist template.
  /instances:
    post:
      summary: Create a new checklist instance from a template.
  /instances/{instanceId}:
    get:
      summary: Get a single checklist instance by its ID.
    put:
      summary: Update the state of a checklist instance (e.g., mark a step as complete).
6. Components
Frontend Application
Responsibility: Responsible for rendering the user interface, managing client-side state, and handling all user interactions.

Key Interfaces: Communicates with the API Layer via RESTful HTTP requests as defined in the API Specification.

Dependencies: Depends on the API Layer for all data and business logic.

Technology Stack: Next.js, React, TypeScript, Tailwind CSS, Shadcn UI.

API Layer / Backend
Responsibility: Handles all business logic, user authentication, and data persistence operations. Exposes data to the frontend application.

Key Interfaces: Exposes the REST API defined by the OpenAPI specification. Connects to the Database component via the Drizzle ORM.

Dependencies: Depends on the Database for data storage and NextAuth.js for authentication.

Technology Stack: Next.js API Routes, TypeScript, Drizzle ORM, NextAuth.js.

Database
Responsibility: Provides persistent, reliable storage for all application data, including users, templates, and checklist instances.

Key Interfaces: Accessed exclusively by the API Layer through the Drizzle ORM.

Dependencies: None. This is the foundational data store.

Technology Stack: Vercel Postgres.

7. External APIs
Stripe API (Post-MVP)
Purpose: To handle all payment processing for user subscriptions and premium features.

Documentation: https://stripe.com/docs/api

Authentication: API Key-based.

Integration Notes: The integration will likely use Stripe Checkout to simplify handling of payment information and reduce PCI compliance scope.

8. Core Workflows
Creating a New Checklist Template
Code snippet

sequenceDiagram
    participant User
    participant Frontend App
    participant API Layer
    participant Database

    User->>+Frontend App: Clicks "Save" in Template Builder
    Frontend App->>+API Layer: POST /api/templates with template data
    API Layer->>API Layer: Validate incoming data
    API Layer->>+Database: INSERT new template record
    Database-->>-API Layer: Return created template record
    API Layer-->>-Frontend App: 201 Created response with new template
    Frontend App-->>-User: Show success message & redirect to dashboard
9. Database Schema
SQL

CREATE TABLE "users" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "email" varchar(255) UNIQUE NOT NULL,
  "name" varchar(255),
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "checklist_templates" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL REFERENCES "users"(id) ON DELETE CASCADE,
  "title" varchar(255) NOT NULL,
  "description" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX "idx_checklist_templates_user_id" ON "checklist_templates"("user_id");

CREATE TABLE "steps" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "template_id" uuid NOT NULL REFERENCES "checklist_templates"(id) ON DELETE CASCADE,
  "content" text NOT NULL,
  "display_order" integer NOT NULL
);
CREATE INDEX "idx_steps_template_id" ON "steps"("template_id");

CREATE TABLE "checklist_instances" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL REFERENCES "users"(id) ON DELETE CASCADE,
  "template_id" uuid NOT NULL REFERENCES "checklist_templates"(id) ON DELETE CASCADE,
  "status" varchar(50) DEFAULT 'in-progress' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX "idx_checklist_instances_user_id" ON "checklist_instances"("user_id");

CREATE TABLE "step_states" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "instance_id" uuid NOT NULL REFERENCES "checklist_instances"(id) ON DELETE CASCADE,
  "step_id" uuid NOT NULL REFERENCES "steps"(id) ON DELETE CASCADE,
  "is_completed" boolean DEFAULT false NOT NULL,
  UNIQUE("instance_id", "step_id")
);
CREATE INDEX "idx_step_states_instance_id" ON "step_states"("instance_id");
10. Frontend Architecture
Component Architecture
Component Organization:

Plaintext

src/components/
├── auth/
├── dashboard/
├── layout/
└── templates/
Component Template:

TypeScript

import * as React from 'react';

interface MyComponentProps { /* ... */ }

const MyComponent = (props: MyComponentProps) => { /* ... */ };

export default MyComponent;
State Management Architecture
Approach: Primarily use React's built-in state (useState) and Context for minimal global state (e.g., user session).

Routing Architecture
Approach: Use the Next.js App Router's file-based routing. Protected routes will be managed using a layout that checks for an active session.

Frontend Services Layer
Approach: A centralized API client will handle all fetch requests. Functions for specific resources will be organized into service files.

TypeScript

// src/services/templateService.ts
export const getTemplates = async (): Promise<Template[]> => { /* ... */ };
11. Backend Architecture
Service Architecture
Function Organization: Use the Next.js App Router's convention for API endpoints in the src/app/api/ directory.

Function Template:

TypeScript

import { NextResponse } from 'next/server';
export async function GET(request: Request) { /* ... */ }
Database Architecture
Data Access Layer: Implement a repository pattern using service files. API route handlers will not contain raw database queries.

Authentication and Authorization
Approach: Managed by NextAuth.js. Authorization will be enforced in each API route by retrieving the server-side session.

12. Unified Project Structure
Plaintext

taskflow-app/
├── apps/
│   └── web/
│       ├── src/
│       │   ├── app/
│       │   │   ├── (dashboard)/
│       │   │   ├── api/
│       │   │   └── page.tsx
│       │   ├── components/
│       │   ├── lib/
│       │   └── services/
│       └── package.json
├── packages/
│   ├── db/
│   ├── ui/
│   └── config/
└── package.json
13. Development Workflow
Local Development Setup
Prerequisites: Node.js (v20.x+), pnpm

Commands: pnpm install to set up, pnpm dev to run.

Environment Configuration
An .env.local file is required with keys for POSTGRES_URL and AUTH_SECRET.

14. Coding Standards
Critical Fullstack Rules
Type Sharing: Define shared types in a shared package and import them; do not duplicate.

Environment Variables: Access environment variables only through a centralized configuration object.

Data Access: All database operations must be handled within the services layer.

API Responses: All API responses must follow a consistent JSON format.

Naming Conventions
Element	Convention	Example
React Components	PascalCase	TemplateCard.tsx
API Route Files	kebab-case / route.ts	/api/templates/[id]/route.ts
Database Tables	snake_case	checklist_templates
Service Files	camelCase	templateService.ts
