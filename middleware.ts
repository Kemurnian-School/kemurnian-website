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

  // --- 1. Quick exits for performance ---
  const isStaticAsset = url.pathname.match(
    /\.(webp|jpg|jpeg|png|gif|svg|ico|css|js|woff2?|ttf|eot)$/i,
  );
  if (isStaticAsset) return NextResponse.next();

  const isAdminSubdomain = hostname.startsWith("admin.");

  // --- 2. Prevent access to admin routes from public site ---
  if (
    !isAdminSubdomain &&
    (url.pathname.startsWith("/admin") || url.pathname === "/login")
  ) {
    return NextResponse.json({ message: "Not Found" }, { status: 404 });
  }

  // --- 3. If not admin subdomain → continue normally ---
  if (!isAdminSubdomain) return NextResponse.next();

  // --- 4. Rewrite all non-admin routes on admin subdomain ---
  // Example: admin.mysite.com/ → /admin
  if (!url.pathname.startsWith("/admin") && url.pathname !== "/login") {
    url.pathname = url.pathname === "/" ? "/admin" : `/admin${url.pathname}`;
  }

  // --- 5. Initialize Supabase Auth for session checks ---
  let response = NextResponse.rewrite(url);
  const supabase = createSupabaseClient(request, response);
  const { data } = await supabase.auth.getUser();
  const user = data?.user;

  // --- 6. Protect /admin routes (must be logged in) ---
  if (url.pathname.startsWith("/admin")) {
    if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.hostname = hostname;
      return NextResponse.redirect(loginUrl);
    }
    return response;
  }

  // --- 7. Redirect logged-in users away from login page ---
  if (url.pathname === "/login" && user) {
    const adminUrl = new URL("/admin", request.url);
    adminUrl.hostname = hostname;
    return NextResponse.redirect(adminUrl);
  }

  // --- 8. Default: rewrite and continue ---
  return response;
}

// --- Apply middleware to everything except static assets & API routes ---
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};
