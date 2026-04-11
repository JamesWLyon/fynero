import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const unprotectedRoutes = ["/", "/login", "/sign-up", "/forgot-password", "/reset-password"];

export async function proxy(req: NextRequest) {
    const res = NextResponse.next();

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return req.cookies.getAll();
                },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value, options }) => {
                            res.cookies.set(name, value, options);
                        });
                    },
            },
        }
    );

    const {
        data: { user },
    } = await supabase.auth.getUser();

    const { pathname } = req.nextUrl;

    const isUnprotected = unprotectedRoutes.some((route) => {
    if (route === "/") return pathname === "/";
        return pathname === route || pathname.startsWith(`${route}/`);
    });

    if (!user && !isUnprotected) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    if (user && (pathname === "/login" || pathname === "/sign-up")) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return res;
}

export const config = {
  matcher: [
    /*
      Run on all routes EXCEPT:
      - api
      - _next/static
      - _next/image
      - favicon.ico
      - common static file extensions
    */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js|map|ico|txt|woff|woff2|ttf)$).*)",
  ],
};