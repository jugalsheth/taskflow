# Data Models

## User

**Purpose**: Represents a registered user of the application.

**Relationships**: A User can have many ChecklistTemplates and many ChecklistInstances.

**TypeScript Interface**:

```typescript
interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: Date;
}
```

## ChecklistTemplate

**Purpose**: Represents a reusable checklist definition created by a user.

**Relationships**: Belongs to one User. Can have many Steps. Can be the source for many ChecklistInstances.

**TypeScript Interface**:

```typescript
interface ChecklistTemplate {
  id: string;
  userId: string;
  title: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## Step

**Purpose**: Represents a single, ordered step within a ChecklistTemplate.

**Relationships**: Belongs to one ChecklistTemplate.

**TypeScript Interface**:

```typescript
interface Step {
  id: string;
  templateId: string;
  content: string;
  order: number; // To maintain the sequence of steps
}
```

## ChecklistInstance

**Purpose**: Represents a single, "live" run of a checklist started from a ChecklistTemplate. It tracks the real-time progress.

**Relationships**: Belongs to one User and one ChecklistTemplate.

**TypeScript Interface**:

```typescript
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
``` 