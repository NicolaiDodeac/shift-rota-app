// auth.ts
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import type { JWT } from "next-auth/jwt";
import type { Account, Session } from "next-auth";

async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    if (!token.refreshToken) throw new Error("No refresh token");
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
      refreshToken: token.refreshToken ?? data.refresh_token,
      error: undefined,
    };
  } catch (err) {
    console.error("Error refreshing access token", err);
    return { ...token, error: "RefreshAccessTokenError", expiresAt: 0 };
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope:
            "openid email profile https://www.googleapis.com/auth/calendar",
        },
      },
    }),
  ],
  session: { strategy: "jwt" },
  trustHost: true,
  pages: { error: "/auth/error" },
  callbacks: {
    async jwt({
      token,
      account,
    }: {
      token: JWT;
      account?: Account | null;
    }): Promise<JWT> {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token ?? token.refreshToken;
        const byExpiresAt = (account as any).expires_at
          ? (account as any).expires_at * 1000
          : undefined;
        const byExpiresIn = (account as any).expires_in
          ? Date.now() + (account as any).expires_in * 1000
          : undefined;
        token.expiresAt =
          byExpiresAt ?? byExpiresIn ?? Date.now() + 3600 * 1000;
      }
      if (
        token.expiresAt &&
        Date.now() < (token.expiresAt as number) - 60_000
      ) {
        return token;
      }
      return await refreshAccessToken(token);
    },
    async session({
      session,
      token,
    }: {
      session: Session;
      token: JWT;
    }): Promise<Session> {
      (session as any).accessToken = token.accessToken;
      (session as any).refreshToken = token.refreshToken;
      (session as any).expiresAt = token.expiresAt;
      (session as any).error = (token as any).error;
      return session;
    },
  },
});
