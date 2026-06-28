import "dotenv/config"
import { createServer } from "node:http"
import { serve } from "@hono/node-server"
import { Hono } from "hono"
import { cors } from "hono/cors"
import { logger } from "hono/logger"
import { authRoutes } from "./routes/auth.js"
import { channelRoutes } from "./routes/channels.js"
import { messageRoutes } from "./routes/messages.js"
import { documentRoutes } from "./routes/documents.js"
import { taskRoutes } from "./routes/tasks.js"
import { fileRoutes } from "./routes/files.js"
import { notificationRoutes } from "./routes/notifications.js"
import { initSocket } from "./socket/index.js"
import { initHocuspocus } from "./hocuspocus/index.js"
import { db } from "./lib/db.js"

const app = new Hono()

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use("*", logger())
app.use(
  "/api/*",
  cors({
    origin: process.env.WEB_URL ?? "http://localhost:3000",
    credentials: true,
  })
)

// ─── Routes ───────────────────────────────────────────────────────────────────
app.route("/api/auth", authRoutes)
app.route("/api/channels", channelRoutes)
app.route("/api/messages", messageRoutes)
app.route("/api/documents", documentRoutes)
app.route("/api/tasks", taskRoutes)
app.route("/api/files", fileRoutes)
app.route("/api/notifications", notificationRoutes)

app.get("/health", (c) => c.json({ status: "ok" }))

// ─── HTTP server (shared with Socket.io) ─────────────────────────────────────
const port = Number(process.env.PORT ?? 3001)

const server = serve({ fetch: app.fetch, port }, () => {
  console.log(`Server running on http://localhost:${port}`)
})

// ─── Socket.io ────────────────────────────────────────────────────────────────
initSocket(server, db)

// ─── Hocuspocus (Yjs collaboration) ──────────────────────────────────────────
initHocuspocus(db)

export type AppType = typeof app
