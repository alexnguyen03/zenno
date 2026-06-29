import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const PROTECTED_ROUTES = ["/dashboard", "/chat", "/docs", "/tasks", "/whiteboard", "/files", "/search", "/notifications", "/settings"]
const AUTH_ROUTES = ["/login", "/signup"]

export function proxy(request: NextRequest) {
  const sessionCookie = request.cookies.get("better-auth.session_token")
  const isAuthed = !!sessionCookie
  const { pathname } = request.nextUrl

  if (!isAuthed && PROTECTED_ROUTES.some((p) => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (isAuthed && AUTH_ROUTES.some((p) => pathname === p)) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
