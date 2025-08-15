// app/auth/error/page.tsx
import { Suspense } from "react";
import AuthErrorClient from "./AuthErrorClient";

export default function AuthErrorPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const err = (searchParams?.error as string) ?? "AccessDenied";
  const hinted = (searchParams?.login_hint as string) ?? "";

  // Suspense is harmless here and future-proofs the route
  return (
    <Suspense fallback={null}>
      <AuthErrorClient err={err} hinted={hinted} />
    </Suspense>
  );
}
