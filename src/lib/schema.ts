import { pgTable, uuid, varchar, timestamp, text, integer } from "drizzle-orm/pg-core";
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

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  templates: many(checklistTemplates),
}));

export const templatesRelations = relations(checklistTemplates, ({ one, many }) => ({
  user: one(users, {
    fields: [checklistTemplates.userId],
    references: [users.id],
  }),
  steps: many(checklistSteps),
}));

export const stepsRelations = relations(checklistSteps, ({ one }) => ({
  template: one(checklistTemplates, {
    fields: [checklistSteps.templateId],
    references: [checklistTemplates.id],
  }),
}));

// TypeScript types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type ChecklistTemplate = typeof checklistTemplates.$inferSelect;
export type NewChecklistTemplate = typeof checklistTemplates.$inferInsert;

export type ChecklistStep = typeof checklistSteps.$inferSelect;
export type NewChecklistStep = typeof checklistSteps.$inferInsert; 