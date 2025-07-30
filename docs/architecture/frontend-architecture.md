# Frontend Architecture

## Component Architecture

**Component Organization**:

```
src/components/
├── auth/
├── dashboard/
├── layout/
└── templates/
```

**Component Template**:

```typescript
import * as React from 'react';

interface MyComponentProps { /* ... */ }

const MyComponent = (props: MyComponentProps) => { /* ... */ };

export default MyComponent;
```

## State Management Architecture

**Approach**: Primarily use React's built-in state (useState) and Context for minimal global state (e.g., user session).

## Routing Architecture

**Approach**: Use the Next.js App Router's file-based routing. Protected routes will be managed using a layout that checks for an active session.

## Frontend Services Layer

**Approach**: A centralized API client will handle all fetch requests. Functions for specific resources will be organized into service files.

```typescript
// src/services/templateService.ts
export const getTemplates = async (): Promise<Template[]> => { /* ... */ };
``` 