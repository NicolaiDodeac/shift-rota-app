"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

const DEV_EMAIL = "mykola.dodiak@gmail.com"; // your address

export default function RequestAccessPage() {
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);

  const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const error =
    touched && !email
      ? "Email is required"
      : touched && email && !isValidEmail(email)
      ? "Enter a valid email address"
      : "";

  const subject = "Tester access request – Magna Shift Rota";
  const body = useMemo(() => {
    const lines = [
      "Hi,",
      "",
      "I’d like to be added as a tester for Magna Shift Rota.",
      `My Google email: ${email || "<type your email here>"}`,
      "",
      "Thanks!",
    ];
    return lines.join("\n");
  }, [email]);

  const mailtoHref = `mailto:${encodeURIComponent(
    DEV_EMAIL
  )}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  const gmailHref = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
    DEV_EMAIL
  )}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  function guardOr(fn: () => void) {
    setTouched(true);
    if (!email || !isValidEmail(email)) return;
    fn();
  }

  return (
    <main className="card" style={{ maxWidth: 720, margin: "48px auto" }}>
      <h1>Request tester access</h1>
      <p>
        The app is in <b>Testing</b>. Only approved testers can sign in. Send
        your Google account email and we’ll add you to the tester list. Please
        use email you would use for your Google Calendar.
      </p>

      <div style={{ marginTop: 16 }}>
        <label htmlFor="email">Your Google email</label>
        <input
          id="email"
          type="email"
          placeholder="you@gmail.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setTouched(true)}
          aria-invalid={!!error}
          aria-describedby="email-error"
          style={{
            width: "100%",
            borderColor: error ? "#e5484d" : undefined,
            outlineColor: error ? "#e5484d" : undefined,
          }}
          required
        />
        {error && (
          <div
            id="email-error"
            style={{ color: "#e5484d", marginTop: 6, fontSize: 13 }}
          >
            {error}
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
        <a
          className="btn"
          href={mailtoHref}
          onClick={(e) => {
            e.preventDefault();
            guardOr(() => (window.location.href = mailtoHref));
          }}
        >
          Send email
        </a>
        <a
          className="btn secondary"
          href={gmailHref}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => {
            e.preventDefault();
            guardOr(() => window.open(gmailHref, "_blank", "noopener"));
          }}
        >
          Open in Gmail
        </a>
        <button
          className="btn secondary"
          onClick={() =>
            guardOr(() =>
              navigator.clipboard.writeText(`${subject}\n\n${body}`)
            )
          }
        >
          Copy message
        </button>
        <Link className="btn secondary" href="/">
          Back home
        </Link>
      </div>

      <p style={{ fontSize: 12, color: "#999", marginTop: 24 }}>
        Tip: In Testing mode Google may require re-consent after ~7 days.
      </p>
    </main>
  );
}
