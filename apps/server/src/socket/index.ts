import type { Server as HttpServer } from "node:http"
import { Server } from "socket.io"
import type { Db } from "@zenno/db"
import { messages, notifications } from "@zenno/db"

export function initSocket(httpServer: HttpServer, db: Db) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.WEB_URL ?? "http://localhost:3000",
      credentials: true,
    },
  })

  io.on("connection", (socket) => {
    const userId = socket.handshake.auth.userId as string | undefined
    if (!userId) {
      socket.disconnect()
      return
    }

    // Join personal notification room
    socket.join(`user:${userId}`)

    // ── Channel chat ──────────────────────────────────────────────────────────
    socket.on("channel:join", (channelId: string) => {
      socket.join(`channel:${channelId}`)
    })

    socket.on("channel:leave", (channelId: string) => {
      socket.leave(`channel:${channelId}`)
    })

    socket.on("message:send", async (payload: {
      content: string
      channelId?: string
      dmUserId?: string
    }) => {
      const [message] = await db
        .insert(messages)
        .values({ ...payload, senderId: userId })
        .returning()

      if (payload.channelId) {
        io.to(`channel:${payload.channelId}`).emit("message:new", message)
      } else if (payload.dmUserId) {
        io.to(`user:${userId}`).emit("message:new", message)
        io.to(`user:${payload.dmUserId}`).emit("message:new", message)
      }
    })

    socket.on("message:delete", async (messageId: string) => {
      await db
        .update(messages)
        .set({ deletedAt: new Date() })
        .where(require("drizzle-orm").and(
          require("drizzle-orm").eq(messages.id, messageId),
          require("drizzle-orm").eq(messages.senderId, userId)
        ))
      socket.broadcast.emit("message:deleted", { messageId })
    })

    // ── Presence ──────────────────────────────────────────────────────────────
    socket.on("presence:ping", () => {
      socket.broadcast.emit("presence:online", { userId })
    })

    socket.on("disconnect", () => {
      socket.broadcast.emit("presence:offline", { userId })
    })
  })

  return io
}
