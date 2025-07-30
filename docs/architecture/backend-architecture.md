# Backend Architecture

## Service Architecture

**Function Organization**: Use the Next.js App Router's convention for API endpoints in the src/app/api/ directory.

**Function Template**:

```typescript
import { NextResponse } from 'next/server';
export async function GET(request: Request) { /* ... */ }
```

## Database Architecture

**Data Access Layer**: Implement a repository pattern using service files. API route handlers will not contain raw database queries.

## Authentication and Authorization

**Approach**: Managed by NextAuth.js. Authorization will be enforced in each API route by retrieving the server-side session. 