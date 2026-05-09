import { NextRequest, NextResponse } from "next/server";

const sessionCookieName = process.env.SESSION_COOKIE_NAME || "__session";

async function getSessionRole(request: NextRequest) {
  const response = await fetch(new URL("/api/auth/me", request.url), {
    method: "GET",
    headers: {
      cookie: request.headers.get("cookie") || ""
    },
    cache: "no-store"
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as { role?: "ADMIN" | "USER" };
  return payload.role === "ADMIN" ? "ADMIN" : "USER";
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(sessionCookieName)?.value;
  const loginUrl = new URL("/login", request.url);
  const homeUrl = new URL("/", request.url);

  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin") || pathname.startsWith("/account") || pathname.startsWith("/checkout") || pathname.startsWith("/wishlist")) {
    if (!token) {
      if (pathname.startsWith("/api/admin")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      return NextResponse.redirect(loginUrl);
    }

    try {
      const role = await getSessionRole(request);

      if (!role) {
        throw new Error("Unauthorized");
      }

      if ((pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) && role !== "ADMIN") {
        if (pathname.startsWith("/api/admin")) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        return NextResponse.redirect(homeUrl);
      }
    } catch {
      if (pathname.startsWith("/api/admin")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/account/:path*", "/checkout/:path*", "/wishlist/:path*"]
};
