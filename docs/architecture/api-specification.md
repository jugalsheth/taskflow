# API Specification

## REST API Specification

```yaml
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
``` 