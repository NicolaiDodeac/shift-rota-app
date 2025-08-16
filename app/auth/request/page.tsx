"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import s from "./page.module.css";

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

  const canSubmit = !!email && isValidEmail(email);

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

  const mailtoHref =
    `mailto:${encodeURIComponent(DEV_EMAIL)}` +
    `?subject=${encodeURIComponent(subject)}` +
    `&body=${encodeURIComponent(body)}`;

  const gmailHref =
    `https://mail.google.com/mail/?view=cm&fs=1` +
    `&to=${encodeURIComponent(DEV_EMAIL)}` +
    `&su=${encodeURIComponent(subject)}` +
    `&body=${encodeURIComponent(body)}`;

  function guardOr(fn: () => void) {
    setTouched(true);
    if (!canSubmit) return;
    fn();
  }

  return (
    <div className={s.wrap}>
      <section className={s.card}>
        <h1 className={s.h1}>Request tester access</h1>
        <p className="lead">
          The app is in <b>Testing</b>. Only approved testers can sign in. Send
          your Google account email and we’ll add you to the tester list. Please
          use the email you use for Google Calendar.
        </p>

        <div style={{ marginTop: 12 }}>
          <label htmlFor="email">Your Google email</label>
          <input
            id="email"
            type="email"
            placeholder="you@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setTouched(true)}
            aria-invalid={!!error}
            aria-describedby={error ? "email-error" : undefined}
            required
          />
          {error && (
            <div id="email-error" className={s.error}>
              {error}
            </div>
          )}
        </div>

        <div className={s.actions}>
          <a
            className={`${s.btn} ${!canSubmit ? s.disabled : ""}`}
            href={mailtoHref}
            aria-disabled={!canSubmit}
            onClick={(e) => {
              e.preventDefault();
              guardOr(() => (window.location.href = mailtoHref));
            }}
          >
            Send email
          </a>

          <a
            className={`${s.btn} ${s.secondary} ${
              !canSubmit ? s.disabled : ""
            }`}
            href={gmailHref}
            target="_blank"
            rel="noreferrer"
            aria-disabled={!canSubmit}
            onClick={(e) => {
              e.preventDefault();
              guardOr(() => window.open(gmailHref, "_blank", "noopener"));
            }}
          >
            Open in Gmail
          </a>

          <button
            className={`${s.btn} ${s.secondary}`}
            onClick={() =>
              guardOr(() =>
                navigator.clipboard.writeText(`${subject}\n\n${body}`)
              )
            }
          >
            Copy message
          </button>

          <Link className={`${s.btn} ${s.secondary}`} href="/">
            Back home
          </Link>
        </div>

        <p className={s.hint}>
          Tip: In Testing mode Google may require re-consent after ~7 days.
        </p>
      </section>
    </div>
  );
}
