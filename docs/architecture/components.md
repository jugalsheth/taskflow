# Components

## Frontend Application

**Responsibility**: Responsible for rendering the user interface, managing client-side state, and handling all user interactions.

**Key Interfaces**: Communicates with the API Layer via RESTful HTTP requests as defined in the API Specification.

**Dependencies**: Depends on the API Layer for all data and business logic.

**Technology Stack**: Next.js, React, TypeScript, Tailwind CSS, Shadcn UI.

## API Layer / Backend

**Responsibility**: Handles all business logic, user authentication, and data persistence operations. Exposes data to the frontend application.

**Key Interfaces**: Exposes the REST API defined by the OpenAPI specification. Connects to the Database component via the Drizzle ORM.

**Dependencies**: Depends on the Database for data storage and NextAuth.js for authentication.

**Technology Stack**: Next.js API Routes, TypeScript, Drizzle ORM, NextAuth.js.

## Database

**Responsibility**: Provides persistent, reliable storage for all application data, including users, templates, and checklist instances.

**Key Interfaces**: Accessed exclusively by the API Layer through the Drizzle ORM.

**Dependencies**: None. This is the foundational data store.

**Technology Stack**: Vercel Postgres. 