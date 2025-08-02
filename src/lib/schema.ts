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

// Teams table schema
export const teams = pgTable("teams", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  ownerId: uuid("owner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  privacyLevel: varchar("privacy_level", { length: 50 }).notNull().default("private"), // 'private', 'public'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Team members table schema
export const teamMembers = pgTable("team_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  teamId: uuid("team_id").notNull().references(() => teams.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: varchar("role", { length: 50 }).notNull().default("member"), // 'owner', 'admin', 'member', 'viewer'
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

// Team invitations table schema
export const teamInvitations = pgTable("team_invitations", {
  id: uuid("id").primaryKey().defaultRandom(),
  teamId: uuid("team_id").notNull().references(() => teams.id, { onDelete: "cascade" }),
  invitedEmail: varchar("invited_email", { length: 255 }).notNull(),
  invitedBy: uuid("invited_by").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: varchar("token", { length: 255 }).notNull().unique(),
  status: varchar("status", { length: 50 }).notNull().default("pending"), // 'pending', 'accepted', 'declined', 'expired'
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Team templates table schema
export const teamTemplates = pgTable("team_templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  teamId: uuid("team_id").notNull().references(() => teams.id, { onDelete: "cascade" }),
  templateId: uuid("template_id").notNull().references(() => checklistTemplates.id, { onDelete: "cascade" }),
  sharedBy: uuid("shared_by").notNull().references(() => users.id, { onDelete: "cascade" }),
  sharedAt: timestamp("shared_at").notNull(),
  isOfficial: boolean("is_official").notNull().default(false),
  status: varchar("status", { length: 50 }).notNull().default("active"), // 'active', 'removed'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Template feedback table schema
export const templateFeedback = pgTable("template_feedback", {
  id: uuid("id").primaryKey().defaultRandom(),
  templateId: uuid("template_id").notNull().references(() => checklistTemplates.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  teamId: uuid("team_id").notNull().references(() => teams.id, { onDelete: "cascade" }),
  comment: text("comment").notNull(),
  rating: integer("rating"), // 1-5 rating
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Template favorites table schema
export const templateFavorites = pgTable("template_favorites", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  templateId: uuid("template_id").notNull().references(() => checklistTemplates.id, { onDelete: "cascade" }),
  teamId: uuid("team_id").references(() => teams.id, { onDelete: "cascade" }), // nullable for personal favorites
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const templatesRelations = relations(checklistTemplates, ({ one, many }) => ({
  user: one(users, {
    fields: [checklistTemplates.userId],
    references: [users.id],
  }),
  steps: many(checklistSteps),
  instances: many(checklistInstances),
  teamTemplates: many(teamTemplates),
  feedback: many(templateFeedback),
  favorites: many(templateFavorites),
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

export const teamsRelations = relations(teams, ({ one, many }) => ({
  owner: one(users, {
    fields: [teams.ownerId],
    references: [users.id],
  }),
  members: many(teamMembers),
  invitations: many(teamInvitations),
  teamTemplates: many(teamTemplates),
  feedback: many(templateFeedback),
}));

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  team: one(teams, {
    fields: [teamMembers.teamId],
    references: [teams.id],
  }),
  user: one(users, {
    fields: [teamMembers.userId],
    references: [users.id],
  }),
}));

export const teamInvitationsRelations = relations(teamInvitations, ({ one }) => ({
  team: one(teams, {
    fields: [teamInvitations.teamId],
    references: [teams.id],
  }),
  invitedByUser: one(users, {
    fields: [teamInvitations.invitedBy],
    references: [users.id],
  }),
}));

export const teamTemplatesRelations = relations(teamTemplates, ({ one }) => ({
  team: one(teams, {
    fields: [teamTemplates.teamId],
    references: [teams.id],
  }),
  template: one(checklistTemplates, {
    fields: [teamTemplates.templateId],
    references: [checklistTemplates.id],
  }),
  sharedByUser: one(users, {
    fields: [teamTemplates.sharedBy],
    references: [users.id],
  }),
}));

export const templateFeedbackRelations = relations(templateFeedback, ({ one }) => ({
  template: one(checklistTemplates, {
    fields: [templateFeedback.templateId],
    references: [checklistTemplates.id],
  }),
  user: one(users, {
    fields: [templateFeedback.userId],
    references: [users.id],
  }),
  team: one(teams, {
    fields: [templateFeedback.teamId],
    references: [teams.id],
  }),
}));

export const templateFavoritesRelations = relations(templateFavorites, ({ one }) => ({
  user: one(users, {
    fields: [templateFavorites.userId],
    references: [users.id],
  }),
  template: one(checklistTemplates, {
    fields: [templateFavorites.templateId],
    references: [checklistTemplates.id],
  }),
  team: one(teams, {
    fields: [templateFavorites.teamId],
    references: [teams.id],
  }),
}));

// Update users relations to include teams
export const usersRelations = relations(users, ({ many }) => ({
  templates: many(checklistTemplates),
  instances: many(checklistInstances),
  ownedTeams: many(teams),
  teamMemberships: many(teamMembers),
  sharedTeamTemplates: many(teamTemplates, { relationName: "sharedByUser" }),
  templateFeedback: many(templateFeedback),
  templateFavorites: many(templateFavorites),
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

export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;

export type TeamMember = typeof teamMembers.$inferSelect;
export type NewTeamMember = typeof teamMembers.$inferInsert;

export type TeamInvitation = typeof teamInvitations.$inferSelect;
export type NewTeamInvitation = typeof teamInvitations.$inferInsert;

export type TeamTemplate = typeof teamTemplates.$inferSelect;
export type NewTeamTemplate = typeof teamTemplates.$inferInsert;

export type TemplateFeedback = typeof templateFeedback.$inferSelect;
export type NewTemplateFeedback = typeof templateFeedback.$inferInsert;

export type TemplateFavorite = typeof templateFavorites.$inferSelect;
export type NewTemplateFavorite = typeof templateFavorites.$inferInsert; 