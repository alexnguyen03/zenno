import { Hono } from "hono"
import { eq, and, isNull } from "drizzle-orm"
import { db } from "../lib/db.js"
import { requireSession } from "../lib/session.js"
import { notifications } from "@zenno/db"

export const notificationRoutes = new Hono()

notificationRoutes.use("*", requireSession)

notificationRoutes.get("/", async (c) => {
  const user = c.get("user")
  const rows = await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, user.id))
    .limit(50)
  return c.json(rows)
})

notificationRoutes.post("/:id/read", async (c) => {
  const user = c.get("user")
  await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(
      and(
        eq(notifications.id, c.req.param("id")),
        eq(notifications.userId, user.id)
      )
    )
  return c.json({ success: true })
})

notificationRoutes.post("/read-all", async (c) => {
  const user = c.get("user")
  await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(
      and(eq(notifications.userId, user.id), isNull(notifications.readAt))
    )
  return c.json({ success: true })
})
