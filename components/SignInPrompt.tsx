import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { signIn } from "next-auth/react";
import s from "../app/page.module.css";

interface SignInPromptProps {
  status: string;
}

export function SignInPrompt({ status }: SignInPromptProps) {
  if (status === "authenticated") {
    return null;
  }

  return (
    <Card padding="md" elevation="md" className={s.signInCard}>
      <p className={s.signInText}>
        <strong>Sign in to sync with Google Calendar.</strong>
      </p>
      <div className={s.signInButtons}>
        <Button 
          variant="primary" 
          onClick={() => signIn("google", { callbackUrl: window.location.href })}
        >
          Sign in with Google
        </Button>
        <Button variant="secondary" asChild>
          <a href="/auth/request">Not on the tester list? Request access</a>
        </Button>
      </div>
    </Card>
  );
}
