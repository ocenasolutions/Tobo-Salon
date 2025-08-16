import { type NextRequest, NextResponse } from "next/server"

export function middleware(request: NextRequest) {
  // Skip middleware during build time
  if (process.env.NODE_ENV === "production" && !process.env.MONGODB_URI) {
    return NextResponse.next()
  }

  // Protected routes that require authentication
  const protectedPaths = ["/packages", "/bills", "/dashboard", "/reports"]
  const isProtectedPath = protectedPaths.some((path) => request.nextUrl.pathname.startsWith(path))

  if (isProtectedPath) {
    const token =
      request.cookies.get("auth-token")?.value || request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.redirect(new URL("/auth", request.url))
    }

    // Full JWT verification will be done in API routes using Node.js runtime
    if (token.length < 10) {
      // Basic token format check
      return NextResponse.redirect(new URL("/auth", request.url))
    }

    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/packages/:path*", "/bills/:path*", "/dashboard/:path*", "/reports/:path*"],
}
