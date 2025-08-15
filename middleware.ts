// middleware.ts
import { withAuth } from "next-auth/middleware";

// Redirects unauthenticated users to NextAuth's sign-in,
// preserving the original URL as ?callbackUrl=...
export default withAuth({
  pages: {
    signIn: "/api/auth/signin",
  },
});

export const config = {
  // Protect the app UI (homepage). Leave API + /api/ics public.
  matcher: ["/"],
};
