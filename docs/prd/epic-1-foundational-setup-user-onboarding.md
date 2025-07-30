# Epic 1: Foundational Setup & User Onboarding

**Goal**: The goal of this epic is to build the essential scaffolding for the TaskFlow application. This includes setting up the project, establishing secure user authentication, and creating the main dashboard. By the end of this epic, a user will be able to sign up, log in, and see an empty but functional dashboard, providing a solid, testable foundation for all future features.

## Story 1.1: Project Initialization

**As a Developer**, I want a new Next.js 14 project initialized with the chosen tech stack, so that I have a clean, consistent foundation to start building on.

### Acceptance Criteria

- A new Next.js 14 project using the App Router is created.
- TypeScript, Tailwind CSS, and Shadcn UI are installed and configured.
- Drizzle ORM and NextAuth.js are installed as dependencies.
- A successful connection to the Vercel Postgres database is established.
- The project can be run locally without errors.
- A Git repository is initialized with a main branch and a proper .gitignore file.

## Story 1.2: User Authentication

**As a new User**, I want to be able to sign up for an account and log in, so that I can access the application securely.

### Acceptance Criteria

- A user can create a new account using an email and password.
- A new user record is successfully created in the database upon sign-up.
- A user can log in with their correct credentials.
- A user is shown an error message if they try to log in with incorrect credentials.
- User sessions are managed securely, and a user can log out.

## Story 1.3: Basic Dashboard

**As a logged-in User**, I want to see a main dashboard page, so that I have a central place to manage my work.

### Acceptance Criteria

- After a successful login, the user is redirected to a /dashboard route.
- The dashboard page is a protected route, accessible only to authenticated users.
- The page displays a welcome message.
- The page includes a clear heading for "Checklist Templates" and "Active Checklists".
- A button or link for "Create New Template" is visible.
- A logout button is present and functional. 