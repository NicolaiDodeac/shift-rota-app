// middleware.ts
import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: { signIn: "/api/auth/signin" },
});

export const config = {
  matcher: [
    // protect everything EXCEPT: /api, static files, privacy/terms, and auth pages
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|privacy|terms|auth).*)",
  ],
};
