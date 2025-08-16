"use client";

import { useSession, signOut } from "next-auth/react";
import s from "./AuthButtons.module.css";

export default function AuthButtons() {
  const { data: session, status } = useSession(); // "loading" | "authenticated" | "unauthenticated"

  // Don’t flash anything during hydration
  if (status === "loading") return null;

  if (status === "authenticated") {
    const email = session.user?.email ?? "Account";
    return (
      <div className={s.wrap}>
        <span className={s.user} title={email}>
          {email}
        </span>
        <button
          className={`btn secondary ${s.btn}`}
          onClick={() => signOut({ callbackUrl: "/" })}
          title="Sign out to switch Google accounts"
        >
          Sign out
        </button>
      </div>
    );
  }

  // Not signed in
  //   return (
  //     <button
  //       className={`btn ${s.btn}`}
  //       onClick={() =>
  //         signIn("google", {
  //           callbackUrl:
  //             typeof window !== "undefined" ? window.location.href : "/",
  //         })
  //       }
  //       title="Sign in with Google"
  //     >
  //       Sign in
  //     </button>
  //   );
}
