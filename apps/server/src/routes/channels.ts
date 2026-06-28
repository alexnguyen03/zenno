import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"
import { eq } from "drizzle-orm"
import { db } from "../lib/db.js"
import { requireSession } from "../lib/session.js"
import { channels, teamMembers } from "@zenno/db"

export const channelRoutes = new Hono()

channelRoutes.use("*", requireSession)

channelRoutes.get("/", async (c) => {
  const user = c.get("user")
  const rows = await db
    .select()
    .from(channels)
    .where(eq(channels.isPublic, true))
  return c.json(rows)
})

channelRoutes.post(
  "/",
  zValidator("json", z.object({
    name: z.string().min(1).max(80),
    teamId: z.string().uuid().optional(),
    isPublic: z.boolean().default(false),
  })),
  async (c) => {
    const user = c.get("user")
    const body = c.req.valid("json")
    const [channel] = await db
      .insert(channels)
      .values({ ...body, createdBy: user.id })
      .returning()
    return c.json(channel, 201)
  }
)

channelRoutes.delete("/:id", async (c) => {
  const user = c.get("user")
  if (user.role !== "admin") return c.json({ error: "Forbidden" }, 403)
  await db.delete(channels).where(eq(channels.id, c.req.param("id")))
  return c.json({ success: true })
})
