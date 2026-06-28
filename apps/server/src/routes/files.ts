import { Hono } from "hono"
import { eq } from "drizzle-orm"
import path from "node:path"
import fs from "node:fs/promises"
import { db } from "../lib/db.js"
import { requireSession } from "../lib/session.js"
import { files } from "@zenno/db"

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? "./uploads"

export const fileRoutes = new Hono()

fileRoutes.use("*", requireSession)

fileRoutes.get("/", async (c) => {
  const user = c.get("user")
  const rows = await db
    .select()
    .from(files)
    .where(eq(files.uploadedBy, user.id))
  return c.json(rows)
})

fileRoutes.post("/upload", async (c) => {
  const user = c.get("user")
  const formData = await c.req.formData()
  const file = formData.get("file") as File | null

  if (!file) return c.json({ error: "No file provided" }, 400)

  const ext = path.extname(file.name)
  const filename = `${crypto.randomUUID()}${ext}`
  const dest = path.join(UPLOAD_DIR, filename)

  await fs.mkdir(UPLOAD_DIR, { recursive: true })
  const buffer = Buffer.from(await file.arrayBuffer())
  await fs.writeFile(dest, buffer)

  const [record] = await db
    .insert(files)
    .values({
      filename,
      originalName: file.name,
      mimeType: file.type,
      size: String(file.size),
      path: dest,
      uploadedBy: user.id,
    })
    .returning()

  return c.json(record, 201)
})

fileRoutes.get("/:id/download", async (c) => {
  const [record] = await db
    .select()
    .from(files)
    .where(eq(files.id, c.req.param("id")))
    .limit(1)

  if (!record) return c.json({ error: "Not found" }, 404)

  const buffer = await fs.readFile(record.path)
  return new Response(buffer, {
    headers: {
      "Content-Type": record.mimeType,
      "Content-Disposition": `attachment; filename="${record.originalName}"`,
    },
  })
})

fileRoutes.delete("/:id", async (c) => {
  const user = c.get("user")
  const [record] = await db
    .delete(files)
    .where(eq(files.id, c.req.param("id")))
    .returning()
  if (!record || record.uploadedBy !== user.id) {
    return c.json({ error: "Not found or forbidden" }, 404)
  }
  await fs.unlink(record.path).catch(() => null)
  return c.json({ success: true })
})
