# Requirements

## Functional

**FR1: User Accounts**: Users must be able to sign up for a new account, log in, and log out securely.

**FR2: Dashboard**: Upon login, a dashboard must display all of the user's created checklist templates and their active, in-progress checklist instances.

**FR3: Template Management**: Users must be able to create, view, edit, and delete their own checklist templates.

**FR4: Checklist Instantiation**: Users must be able to start or "play" a new checklist instance from an existing template.

**FR5: Interactive Player**: The system must provide an interactive view for a running checklist instance where users can mark steps as complete and have their progress saved.

## Non-Functional

**NFR1: Technology Stack**: The application must be built using Next.js 14+ (App Router), React, and TypeScript.

**NFR2: Styling**: The UI must be styled with Tailwind CSS and use Shadcn UI components.

**NFR3: Database**: The system must use a Vercel Postgres database, with interactions handled by Drizzle ORM.

**NFR4: Deployment**: The entire application must be deployable to the Vercel platform.

**NFR5: Responsiveness**: The user interface must be responsive and usable on modern desktop and mobile web browsers. 