import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((request) => {
  if (!request.auth) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set(
      "callbackUrl",
      `${request.nextUrl.pathname}${request.nextUrl.search}`,
    );
    return NextResponse.redirect(loginUrl);
  }
});

export const config = {
  matcher: ["/((?!login(?:/|$)|api/auth(?:/|$)|_next(?:/|$)|.*\\..*).*)"],
};
