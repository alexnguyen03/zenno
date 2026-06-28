import { Server } from "@hocuspocus/server"
import { eq } from "drizzle-orm"
import type { Db } from "@zenno/db"
import { documents } from "@zenno/db"

const HOCUSPOCUS_PORT = Number(process.env.HOCUSPOCUS_PORT ?? 1234)

export function initHocuspocus(db: Db) {
  const server = Server.configure({
    port: HOCUSPOCUS_PORT,

    async onAuthenticate({ token, documentName }) {
      // token = userId passed from client
      // documentName = document UUID
      if (!token) throw new Error("Unauthorized")

      const [doc] = await db
        .select()
        .from(documents)
        .where(eq(documents.id, documentName))
        .limit(1)

      if (!doc) throw new Error("Document not found")
      if (doc.visibility === "private" && doc.createdBy !== token) {
        throw new Error("Forbidden")
      }

      return { userId: token }
    },

    async onLoadDocument({ documentName }) {
      const [doc] = await db
        .select()
        .from(documents)
        .where(eq(documents.id, documentName))
        .limit(1)

      return doc?.content ? Buffer.from(doc.content, "base64") : null
    },

    async onStoreDocument({ documentName, state }) {
      await db
        .update(documents)
        .set({ content: state.toString("base64"), updatedAt: new Date() })
        .where(eq(documents.id, documentName))
    },
  })

  server.listen()
  console.log(`Hocuspocus running on ws://localhost:${HOCUSPOCUS_PORT}`)

  return server
}
