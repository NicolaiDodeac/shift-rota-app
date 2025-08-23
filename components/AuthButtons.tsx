"use client";

import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/Button";

export default function AuthButtons() {
  const { data: session, status } = useSession(); // "loading" | "authenticated" | "unauthenticated"

  // Don't flash anything during hydration
  if (status === "loading") return null;

  if (status === "authenticated") {
    const email = session.user?.email ?? "Account";
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-sm)'
      }}>
        <span style={{
          color: 'var(--color-text-secondary)',
          fontSize: 'var(--font-size-sm)',
          fontWeight: 500
        }} title={email}>
          {email}
        </span>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => signOut({ callbackUrl: "/" })}
          title="Sign out to switch Google accounts"
        >
          Sign out
        </Button>
      </div>
    );
  }

  // Not signed in
  //   return (
  //     <Button
  //       variant="primary"
  //       onClick={() =>
  //         signIn("google", {
  //           callbackUrl:
  //             typeof window !== "undefined" ? window.location.href : "/",
  //         })
  //       }
  //       title="Sign in with Google"
  //     >
  //       Sign in
  //     </Button>
  //   );
}
