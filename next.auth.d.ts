// next-auth.d.ts
import type { DefaultSession } from "next-auth";
import type { JWT } from "next-auth/jwt";

// AUGMENTATIONS — this merges with the real next-auth types
declare module "next-auth" {
  interface Session extends DefaultSession {
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
    error?: "RefreshAccessTokenError";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
    error?: "RefreshAccessTokenError";
  }
}

// ensure this file is a module (prevents global augmentation pitfalls)
export {};
