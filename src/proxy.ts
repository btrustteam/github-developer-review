import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// Reachable without a session. Signed-in users are bounced off these to the
// dashboard, so returning to "/" with a live session cookie doesn't land back
// on the login page.
const publicPaths = ["/"];

export async function proxy(request: Request) {
  const url = new URL(request.url);
  const { pathname } = url;

  const session = await auth();
  const isSignedIn = Boolean(session?.accessToken);

  if (publicPaths.includes(pathname)) {
    if (isSignedIn) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  if (!isSignedIn) {
    const loginUrl = new URL("/", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
