import { Hono } from "hono"
import { auth } from "../lib/auth.js"

export const authRoutes = new Hono()

// Better Auth handles all auth endpoints under this route
// e.g. POST /api/auth/sign-in/email, POST /api/auth/sign-up/email, etc.
authRoutes.on(["GET", "POST"], "/*", (c) => auth.handler(c.req.raw))
