// app/auth/error/page.tsx
import AuthErrorClient from "./AuthErrorClient";

type SP = Record<string, string | string[] | undefined>;

export default async function AuthErrorPage({
  // In Next 15 (React 19), searchParams is a Promise in Server Components
  searchParams,
}: {
  searchParams?: Promise<SP>;
}) {
  const sp = (await searchParams) ?? {};
  const err = (sp.error as string) ?? "AccessDenied";
  const hinted = (sp.login_hint as string) ?? "";

  return <AuthErrorClient err={err} hinted={hinted} />;
}
