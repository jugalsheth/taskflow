import { pgTable, uuid, varchar, timestamp, text, integer, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Users table schema
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: text("password").notNull(),
  name: varchar("name", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Checklist templates table schema
export const checklistTemplates = pgTable("checklist_templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Checklist steps table schema
export const checklistSteps = pgTable("checklist_steps", {
  id: uuid("id").primaryKey().defaultRandom(),
  templateId: uuid("template_id").notNull().references(() => checklistTemplates.id, { onDelete: "cascade" }),
  stepText: text("step_text").notNull(),
  orderIndex: integer("order_index").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Checklist instances table schema
export const checklistInstances = pgTable("checklist_instances", {
  id: uuid("id").primaryKey().defaultRandom(),
  templateId: uuid("template_id").notNull().references(() => checklistTemplates.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  status: varchar("status", { length: 20 }).notNull().default("in_progress"), // 'in_progress', 'completed', 'paused'
  startedAt: timestamp("started_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Checklist instance steps table schema
export const checklistInstanceSteps = pgTable("checklist_instance_steps", {
  id: uuid("id").primaryKey().defaultRandom(),
  instanceId: uuid("instance_id").notNull().references(() => checklistInstances.id, { onDelete: "cascade" }),
  stepId: uuid("step_id").notNull().references(() => checklistSteps.id, { onDelete: "cascade" }),
  isCompleted: boolean("is_completed").notNull().default(false),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  templates: many(checklistTemplates),
  instances: many(checklistInstances),
}));

export const templatesRelations = relations(checklistTemplates, ({ one, many }) => ({
  user: one(users, {
    fields: [checklistTemplates.userId],
    references: [users.id],
  }),
  steps: many(checklistSteps),
  instances: many(checklistInstances),
}));

export const stepsRelations = relations(checklistSteps, ({ one, many }) => ({
  template: one(checklistTemplates, {
    fields: [checklistSteps.templateId],
    references: [checklistTemplates.id],
  }),
  instanceSteps: many(checklistInstanceSteps),
}));

export const instancesRelations = relations(checklistInstances, ({ one, many }) => ({
  template: one(checklistTemplates, {
    fields: [checklistInstances.templateId],
    references: [checklistTemplates.id],
  }),
  user: one(users, {
    fields: [checklistInstances.userId],
    references: [users.id],
  }),
  instanceSteps: many(checklistInstanceSteps),
}));

export const instanceStepsRelations = relations(checklistInstanceSteps, ({ one }) => ({
  instance: one(checklistInstances, {
    fields: [checklistInstanceSteps.instanceId],
    references: [checklistInstances.id],
  }),
  step: one(checklistSteps, {
    fields: [checklistInstanceSteps.stepId],
    references: [checklistSteps.id],
  }),
}));

// TypeScript types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type ChecklistTemplate = typeof checklistTemplates.$inferSelect;
export type NewChecklistTemplate = typeof checklistTemplates.$inferInsert;

export type ChecklistStep = typeof checklistSteps.$inferSelect;
export type NewChecklistStep = typeof checklistSteps.$inferInsert;

export type ChecklistInstance = typeof checklistInstances.$inferSelect;
export type NewChecklistInstance = typeof checklistInstances.$inferInsert;

export type ChecklistInstanceStep = typeof checklistInstanceSteps.$inferSelect;
export type NewChecklistInstanceStep = typeof checklistInstanceSteps.$inferInsert; 