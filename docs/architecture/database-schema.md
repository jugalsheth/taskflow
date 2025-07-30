# Database Schema

```sql
CREATE TABLE "users" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "email" varchar(255) UNIQUE NOT NULL,
  "name" varchar(255),
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "checklist_templates" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL REFERENCES "users"(id) ON DELETE CASCADE,
  "title" varchar(255) NOT NULL,
  "description" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX "idx_checklist_templates_user_id" ON "checklist_templates"("user_id");

CREATE TABLE "steps" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "template_id" uuid NOT NULL REFERENCES "checklist_templates"(id) ON DELETE CASCADE,
  "content" text NOT NULL,
  "display_order" integer NOT NULL
);
CREATE INDEX "idx_steps_template_id" ON "steps"("template_id");

CREATE TABLE "checklist_instances" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL REFERENCES "users"(id) ON DELETE CASCADE,
  "template_id" uuid NOT NULL REFERENCES "checklist_templates"(id) ON DELETE CASCADE,
  "status" varchar(50) DEFAULT 'in-progress' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX "idx_checklist_instances_user_id" ON "checklist_instances"("user_id");

CREATE TABLE "step_states" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "instance_id" uuid NOT NULL REFERENCES "checklist_instances"(id) ON DELETE CASCADE,
  "step_id" uuid NOT NULL REFERENCES "steps"(id) ON DELETE CASCADE,
  "is_completed" boolean DEFAULT false NOT NULL,
  UNIQUE("instance_id", "step_id")
);
CREATE INDEX "idx_step_states_instance_id" ON "step_states"("instance_id");
``` 