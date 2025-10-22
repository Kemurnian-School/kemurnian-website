import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

function createSupabaseClient(request: NextRequest, response: NextResponse) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );
}

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get("host") || "";

  // Extract subdomain
  const subdomain = hostname.split(".")[0];
  const isAdminSubdomain =
    subdomain === "master" || hostname.startsWith("admin.");
  const isStaticAsset = url.pathname.match(
    /\.(webp|jpg|jpeg|png|gif|svg|ico|css|js|woff2?|ttf|eot)$/i,
  );

  // Skip static assets early
  if (isStaticAsset) return NextResponse.next();

  // Block admin routes on main domain
  if (
    !isAdminSubdomain &&
    (url.pathname.startsWith("/admin") || url.pathname === "/login")
  ) {
    return NextResponse.json({ message: "Not Found" }, { status: 404 });
  }

  // If it's NOT the admin subdomain → continue as usual
  if (!isAdminSubdomain) return NextResponse.next();

  // For admin subdomain → rewrite non-/admin routes to /admin/*
  if (!url.pathname.startsWith("/admin") && url.pathname !== "/login") {
    url.pathname = url.pathname === "/" ? "/admin" : `/admin${url.pathname}`;
  }

  // Initialize a response for Supabase cookie sync
  let response = NextResponse.rewrite(url);
  const supabase = createSupabaseClient(request, response);

  // Handle /admin routes (require authentication)
  if (url.pathname.startsWith("/admin")) {
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.hostname = hostname;
      return NextResponse.redirect(loginUrl);
    }

    return response;
  }

  // Handle /login route
  if (url.pathname === "/login") {
    const { data } = await supabase.auth.getUser();

    if (data.user) {
      // User already logged in → redirect to /admin
      const adminUrl = new URL("/admin", request.url);
      adminUrl.hostname = hostname;
      return NextResponse.redirect(adminUrl);
    }

    return response;
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};
