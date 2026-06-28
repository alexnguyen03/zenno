import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"
import { eq, desc, and, isNull } from "drizzle-orm"
import { db } from "../lib/db.js"
import { requireSession } from "../lib/session.js"
import { messages } from "@zenno/db"

export const messageRoutes = new Hono()

messageRoutes.use("*", requireSession)

// Get messages for a channel
messageRoutes.get("/channel/:channelId", async (c) => {
  const rows = await db
    .select()
    .from(messages)
    .where(
      and(
        eq(messages.channelId, c.req.param("channelId")),
        isNull(messages.deletedAt)
      )
    )
    .orderBy(desc(messages.createdAt))
    .limit(50)
  return c.json(rows.reverse())
})

// Get DMs between two users
messageRoutes.get("/dm/:userId", async (c) => {
  const user = c.get("user")
  const rows = await db
    .select()
    .from(messages)
    .where(
      and(
        eq(messages.dmUserId, c.req.param("userId")),
        eq(messages.senderId, user.id),
        isNull(messages.deletedAt)
      )
    )
    .orderBy(desc(messages.createdAt))
    .limit(50)
  return c.json(rows.reverse())
})

messageRoutes.post(
  "/",
  zValidator("json", z.object({
    content: z.string().min(1),
    channelId: z.string().uuid().optional(),
    dmUserId: z.string().uuid().optional(),
  })),
  async (c) => {
    const user = c.get("user")
    const body = c.req.valid("json")
    const [message] = await db
      .insert(messages)
      .values({ ...body, senderId: user.id })
      .returning()
    return c.json(message, 201)
  }
)

messageRoutes.patch(
  "/:id",
  zValidator("json", z.object({ content: z.string().min(1) })),
  async (c) => {
    const user = c.get("user")
    const [updated] = await db
      .update(messages)
      .set({ content: c.req.valid("json").content, editedAt: new Date() })
      .where(and(eq(messages.id, c.req.param("id")), eq(messages.senderId, user.id)))
      .returning()
    if (!updated) return c.json({ error: "Not found or forbidden" }, 404)
    return c.json(updated)
  }
)

messageRoutes.delete("/:id", async (c) => {
  const user = c.get("user")
  const [updated] = await db
    .update(messages)
    .set({ deletedAt: new Date() })
    .where(and(eq(messages.id, c.req.param("id")), eq(messages.senderId, user.id)))
    .returning()
  if (!updated) return c.json({ error: "Not found or forbidden" }, 404)
  return c.json({ success: true })
})
