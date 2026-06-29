import type { Context, Next } from "hono"
import type { Session } from "./auth.js"
import { auth } from "./auth.js"

type Variables = {
  user: Session["user"]
  session: Session["session"]
}

export type { Variables }

export async function requireSession(
  c: Context<{ Variables: Variables }>,
  next: Next
) {
  const session = await auth.api.getSession({ headers: c.req.raw.headers })
  if (!session) {
    return c.json({ error: "Unauthorized" }, 401)
  }
  c.set("user", session.user)
  c.set("session", session.session)
  await next()
}
