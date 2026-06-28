import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"
import { eq, and, or } from "drizzle-orm"
import { db } from "../lib/db.js"
import { requireSession } from "../lib/session.js"
import { tasks, taskComments } from "@zenno/db"

export const taskRoutes = new Hono()

taskRoutes.use("*", requireSession)

taskRoutes.get("/", async (c) => {
  const user = c.get("user")
  const rows = await db
    .select()
    .from(tasks)
    .where(or(eq(tasks.createdBy, user.id), eq(tasks.assigneeId, user.id)))
  return c.json(rows)
})

taskRoutes.post(
  "/",
  zValidator("json", z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    teamId: z.string().uuid().optional(),
    assigneeId: z.string().uuid().optional(),
    dueDate: z.string().datetime().optional(),
  })),
  async (c) => {
    const user = c.get("user")
    const body = c.req.valid("json")
    const [task] = await db
      .insert(tasks)
      .values({
        ...body,
        dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
        createdBy: user.id,
      })
      .returning()
    return c.json(task, 201)
  }
)

taskRoutes.patch(
  "/:id",
  zValidator("json", z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    status: z.enum(["todo", "in_progress", "done"]).optional(),
    assigneeId: z.string().uuid().nullable().optional(),
    dueDate: z.string().datetime().nullable().optional(),
  })),
  async (c) => {
    const user = c.get("user")
    const body = c.req.valid("json")
    const [updated] = await db
      .update(tasks)
      .set({
        ...body,
        dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
        updatedAt: new Date(),
      })
      .where(and(eq(tasks.id, c.req.param("id")), eq(tasks.createdBy, user.id)))
      .returning()
    if (!updated) return c.json({ error: "Not found or forbidden" }, 404)
    return c.json(updated)
  }
)

taskRoutes.delete("/:id", async (c) => {
  const user = c.get("user")
  const [deleted] = await db
    .delete(tasks)
    .where(and(eq(tasks.id, c.req.param("id")), eq(tasks.createdBy, user.id)))
    .returning()
  if (!deleted) return c.json({ error: "Not found or forbidden" }, 404)
  return c.json({ success: true })
})

// Comments
taskRoutes.get("/:id/comments", async (c) => {
  const rows = await db
    .select()
    .from(taskComments)
    .where(eq(taskComments.taskId, c.req.param("id")))
  return c.json(rows)
})

taskRoutes.post(
  "/:id/comments",
  zValidator("json", z.object({ content: z.string().min(1) })),
  async (c) => {
    const user = c.get("user")
    const [comment] = await db
      .insert(taskComments)
      .values({ taskId: c.req.param("id"), userId: user.id, content: c.req.valid("json").content })
      .returning()
    return c.json(comment, 201)
  }
)
