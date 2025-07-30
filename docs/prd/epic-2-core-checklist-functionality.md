# Epic 2: Core Checklist Functionality

**Goal**: The goal of this epic is to deliver the primary value of TaskFlow. Building on the foundation from Epic 1, these stories will allow a logged-in user to create their own checklist templates, manage them from the dashboard, and run them as interactive checklist instances. By the end of this epic, the core product loop will be complete and demonstrable.

## Story 2.1: Create & Edit a Checklist Template

**As a logged-in User**, I want to create and edit a checklist template with a title and ordered steps, so that I can define a reusable process.

### Acceptance Criteria

- From the dashboard, clicking the "Create New Template" button opens a template builder view.
- The user can enter a title for the template.
- The user can add, edit, and delete text-based steps for the checklist.
- The user can reorder the steps.
- Saving the template creates a new record in the database linked to the user.
- After saving, the user is returned to the dashboard where the new template is now visible.
- An existing template can be opened in the same builder view to be edited and saved.

## Story 2.2: Manage Templates on Dashboard

**As a logged-in User**, I want to see and manage all my created templates on the dashboard, so that I can easily access my processes.

### Acceptance Criteria

- The dashboard's "Checklist Templates" section correctly lists all templates created by the logged-in user.
- Each list item displays the template's title.
- Each list item has options (e.g., buttons or a menu) to "Start Checklist", "Edit", and "Delete" the template.
- The "Edit" option opens the template in the builder view (as per Story 2.1).
- The "Delete" option prompts for confirmation before permanently removing the template and its record from the database.

## Story 2.3: Run an Interactive Checklist

**As a logged-in User**, I want to start an interactive session from a template and mark steps as complete, so that I can accurately follow my defined process.

### Acceptance Criteria

- Clicking "Start Checklist" on a template creates a new "checklist instance" record in the database, linked to the template and user.
- The user is taken to an interactive "player" view for that instance.
- The player view displays the list of steps from the template, each with a checkbox or similar control.
- Checking a step marks it as complete, and the state is immediately saved to the database.
- A user's progress is preserved if they leave and return to an in-progress checklist.
- The dashboard's "Active Checklists" section now lists the newly started, in-progress checklist instance. 