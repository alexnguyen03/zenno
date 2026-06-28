import { pgTable, uuid, text, timestamp, boolean, pgEnum } from "drizzle-orm/pg-core"

// ─── Enums ────────────────────────────────────────────────────────────────────

export const workspaceRoleEnum = pgEnum("workspace_role", ["admin", "member"])
export const teamRoleEnum = pgEnum("team_role", ["team_admin", "member"])
export const visibilityEnum = pgEnum("visibility", ["private", "team", "public"])
export const taskStatusEnum = pgEnum("task_status", ["todo", "in_progress", "done"])

// ─── Users ────────────────────────────────────────────────────────────────────

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  avatarUrl: text("avatar_url"),
  role: workspaceRoleEnum("role").default("member").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// Better Auth sessions table
export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const accounts = pgTable("accounts", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  providerId: text("provider_id").notNull(),
  accountId: text("account_id").notNull(),
  password: text("password"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const verifications = pgTable("verifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

// ─── Teams ────────────────────────────────────────────────────────────────────

export const teams = pgTable("teams", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  createdBy: uuid("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const teamMembers = pgTable("team_members", {
  id: uuid("id").defaultRandom().primaryKey(),
  teamId: uuid("team_id").references(() => teams.id, { onDelete: "cascade" }).notNull(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  role: teamRoleEnum("role").default("member").notNull(),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
})

// ─── Chat ─────────────────────────────────────────────────────────────────────

export const channels = pgTable("channels", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  teamId: uuid("team_id").references(() => teams.id, { onDelete: "cascade" }),
  isPublic: boolean("is_public").default(false).notNull(),
  createdBy: uuid("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const messages = pgTable("messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  content: text("content").notNull(),
  channelId: uuid("channel_id").references(() => channels.id, { onDelete: "cascade" }),
  // null channelId = direct message
  dmUserId: uuid("dm_user_id").references(() => users.id),
  senderId: uuid("sender_id").references(() => users.id).notNull(),
  editedAt: timestamp("edited_at"),
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const reactions = pgTable("reactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  messageId: uuid("message_id").references(() => messages.id, { onDelete: "cascade" }).notNull(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  emoji: text("emoji").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

// ─── Documents ────────────────────────────────────────────────────────────────

export const documents = pgTable("documents", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").default("Untitled").notNull(),
  content: text("content").default("").notNull(), // Yjs persisted state (base64)
  parentId: uuid("parent_id"), // self-reference for nested pages
  teamId: uuid("team_id").references(() => teams.id, { onDelete: "set null" }),
  createdBy: uuid("created_by").references(() => users.id).notNull(),
  visibility: visibilityEnum("visibility").default("private").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// ─── Tasks ────────────────────────────────────────────────────────────────────

export const tasks = pgTable("tasks", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  status: taskStatusEnum("status").default("todo").notNull(),
  teamId: uuid("team_id").references(() => teams.id, { onDelete: "set null" }),
  assigneeId: uuid("assignee_id").references(() => users.id, { onDelete: "set null" }),
  createdBy: uuid("created_by").references(() => users.id).notNull(),
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const taskComments = pgTable("task_comments", {
  id: uuid("id").defaultRandom().primaryKey(),
  taskId: uuid("task_id").references(() => tasks.id, { onDelete: "cascade" }).notNull(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

// ─── Files ────────────────────────────────────────────────────────────────────

export const files = pgTable("files", {
  id: uuid("id").defaultRandom().primaryKey(),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  mimeType: text("mime_type").notNull(),
  size: text("size").notNull(), // bytes as string (bigint-safe)
  path: text("path").notNull(), // local filesystem path
  teamId: uuid("team_id").references(() => teams.id, { onDelete: "set null" }),
  uploadedBy: uuid("uploaded_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

// ─── Notifications ────────────────────────────────────────────────────────────

export const notifications = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  type: text("type").notNull(), // "mention" | "task_assigned" | "task_due"
  title: text("title").notNull(),
  body: text("body"),
  referenceId: uuid("reference_id"), // id of the message/task/doc
  referenceType: text("reference_type"), // "message" | "task" | "document"
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})
