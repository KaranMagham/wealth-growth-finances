import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";

const publicPagePaths = new Set([
	"/",
	"/login",
	"/signup",
	"/signin",
	"/about",
	"/contact",
	"/faq",
	"/terms",
	"/privacy",
	"/forgot-password",
	"/forgot-password/faq",
	"/reset-password",
]);

function isPublicPage(pathname: string) {
	return publicPagePaths.has(pathname);
}

export default async function proxy(request: NextRequest) {
	const { pathname } = request.nextUrl;

	// API handlers, including Better Auth's own handler, perform their own checks.
	if (pathname.startsWith("/api/") || isPublicPage(pathname)) {
		return NextResponse.next();
	}

	const session = await auth.api.getSession({
		headers: request.headers,
	});

	if (session?.user) {
		return NextResponse.next();
	}

	const loginUrl = new URL("/login", request.url);
	loginUrl.searchParams.set("callbackUrl", `${pathname}${request.nextUrl.search}`);
	return NextResponse.redirect(loginUrl);
}