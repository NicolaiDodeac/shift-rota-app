import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

async function refreshAccessToken(token: any) {
  try {
    if (!token.refreshToken) throw new Error("No refresh token on token");
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        grant_type: "refresh_token",
        refresh_token: token.refreshToken,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw data;

    return {
      ...token,
      accessToken: data.access_token,
      expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000,
      // Google rarely returns a new refresh_token; keep the old one if missing
      refreshToken: token.refreshToken ?? data.refresh_token,
      error: undefined,
    };
  } catch (error) {
    console.error("Error refreshing access token", error);
    return { ...token, error: "RefreshAccessTokenError", expiresAt: 0 };
  }
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET, // ← explicit (also set NEXTAUTH_SECRET in env)
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent", // forces refresh_token on first consent
          access_type: "offline",
          response_type: "code",
          scope:
            "openid email profile https://www.googleapis.com/auth/calendar",
        },
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, account }) {
      // On initial sign-in
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token ?? token.refreshToken;
        // Google may send either expires_at (seconds since epoch) or expires_in (seconds from now)
        const byExpiresAt = (account as any).expires_at
          ? (account as any).expires_at * 1000
          : undefined;
        const byExpiresIn = (account as any).expires_in
          ? Date.now() + (account as any).expires_in * 1000
          : undefined;
        token.expiresAt =
          byExpiresAt ?? byExpiresIn ?? Date.now() + 3600 * 1000;
      }

      // If still valid (60s clock skew), keep it
      if (
        token.expiresAt &&
        Date.now() < (token.expiresAt as number) - 60_000
      ) {
        return token;
      }

      // Otherwise refresh
      return await refreshAccessToken(token);
    },
    async session({ session, token }) {
      (session as any).accessToken = token.accessToken;
      (session as any).refreshToken = token.refreshToken;
      (session as any).expiresAt = token.expiresAt;
      (session as any).error = (token as any).error; // handy to spot refresh errors
      return session;
    },
  },
  pages: {
    signIn: "/api/auth/signin", // keep Google’s default sign-in
    error: "/auth/error", // NEW: show our friendly page on access_denied
  },
};

export default NextAuth(authOptions);
