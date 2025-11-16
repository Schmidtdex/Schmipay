import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === "/") {
    try {
      const session = await auth.api.getSession({
        headers: request.headers,
      });

      if (session?.user) {
        return NextResponse.redirect(new URL("/dashboard", request.url), {
          status: 307,
        });
      }

      return NextResponse.redirect(new URL("/login", request.url), {
        status: 307,
      });
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error checking session in proxy:", error);
      }
      return NextResponse.redirect(new URL("/login", request.url), {
        status: 307,
      });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/",
};
