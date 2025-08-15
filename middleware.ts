// middleware.ts
import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: { signIn: "/api/auth/signin" },
});

// Only protect future private pages, NOT "/".
// Also exclude /api, /auth, static files, etc.
export const config = {
  matcher: ["/dashboard/:path*"],
};
