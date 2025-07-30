# Coding Standards

## Critical Fullstack Rules

**Type Sharing**: Define shared types in a shared package and import them; do not duplicate.

**Environment Variables**: Access environment variables only through a centralized configuration object.

**Data Access**: All database operations must be handled within the services layer.

**API Responses**: All API responses must follow a consistent JSON format.

## Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| React Components | PascalCase | TemplateCard.tsx |
| API Route Files | kebab-case / route.ts | /api/templates/[id]/route.ts |
| Database Tables | snake_case | checklist_templates |
| Service Files | camelCase | templateService.ts | 