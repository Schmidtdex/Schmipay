import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === "/") {
    const hasSession =
      request.cookies.has("better-auth.session_token");

    if (hasSession) {
      return NextResponse.redirect(
        new URL("/dashboard", request.url),
        { status: 307 }
      );
    }

    return NextResponse.redirect(
      new URL("/login", request.url),
      { status: 307 }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/",
};
