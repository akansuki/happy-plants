import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isAuthed = !!req.auth?.user;
  const { pathname } = req.nextUrl;

  if (!isAuthed && pathname !== "/signin" && !pathname.startsWith("/api/auth")) {
    const url = req.nextUrl.clone();
    url.pathname = "/signin";
    return NextResponse.redirect(url);
  }
  if (isAuthed && pathname === "/signin") {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
});

export const config = {
  // Run on everything except static assets and the cron endpoint.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|icon-.*\\.png|api/cron).*)",
  ],
};
