import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"
import { eq, and } from "drizzle-orm"
import { db } from "../lib/db.js"
import { requireSession } from "../lib/session.js"
import { documents } from "@zenno/db"

export const documentRoutes = new Hono()

documentRoutes.use("*", requireSession)

documentRoutes.get("/", async (c) => {
  const user = c.get("user")
  const rows = await db
    .select()
    .from(documents)
    .where(eq(documents.createdBy, user.id))
  return c.json(rows)
})

documentRoutes.get("/:id", async (c) => {
  const user = c.get("user")
  const [doc] = await db
    .select()
    .from(documents)
    .where(eq(documents.id, c.req.param("id")))
    .limit(1)
  if (!doc) return c.json({ error: "Not found" }, 404)
  if (doc.visibility === "private" && doc.createdBy !== user.id) {
    return c.json({ error: "Forbidden" }, 403)
  }
  return c.json(doc)
})

documentRoutes.post(
  "/",
  zValidator("json", z.object({
    title: z.string().default("Untitled"),
    parentId: z.string().uuid().optional(),
    teamId: z.string().uuid().optional(),
    visibility: z.enum(["private", "team", "public"]).default("private"),
  })),
  async (c) => {
    const user = c.get("user")
    const body = c.req.valid("json")
    const [doc] = await db
      .insert(documents)
      .values({ ...body, createdBy: user.id })
      .returning()
    return c.json(doc, 201)
  }
)

documentRoutes.patch(
  "/:id",
  zValidator("json", z.object({
    title: z.string().optional(),
    visibility: z.enum(["private", "team", "public"]).optional(),
  })),
  async (c) => {
    const user = c.get("user")
    const [updated] = await db
      .update(documents)
      .set({ ...c.req.valid("json"), updatedAt: new Date() })
      .where(and(eq(documents.id, c.req.param("id")), eq(documents.createdBy, user.id)))
      .returning()
    if (!updated) return c.json({ error: "Not found or forbidden" }, 404)
    return c.json(updated)
  }
)

documentRoutes.delete("/:id", async (c) => {
  const user = c.get("user")
  const [deleted] = await db
    .delete(documents)
    .where(and(eq(documents.id, c.req.param("id")), eq(documents.createdBy, user.id)))
    .returning()
  if (!deleted) return c.json({ error: "Not found or forbidden" }, 404)
  return c.json({ success: true })
})
