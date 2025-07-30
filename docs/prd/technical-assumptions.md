# Technical Assumptions

## Repository Structure: Monorepo

A single repository will be used to house both the frontend and backend code. This approach simplifies dependency management and ensures consistency across the full-stack application.

## Service Architecture

The application will be built using a serverless architecture, with backend logic handled by Next.js API Routes deployed as serverless functions on Vercel. This aligns with the "Next.js only" approach for a lean, scalable system.

## Testing Requirements

The project will require Unit and Integration tests to ensure code quality and reliability. End-to-end tests will be considered for post-MVP development.

## Additional Technical Assumptions and Requests

- **Full-Stack Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript throughout the stack.
- **User Interface**: React with Tailwind CSS and Shadcn UI for pre-built components.
- **Database**: Vercel Postgres.
- **Database Interaction**: Drizzle ORM for type-safe queries.
- **Authentication**: NextAuth.js.
- **Deployment**: Vercel Platform.
- **Payments (Post-MVP)**: Stripe Checkout. 