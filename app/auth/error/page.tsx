"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import Link from "next/link";

const DEV_EMAIL = "mykola.dodiak@gmail.com"; // TODO: set where you want to receive requests

export default function AuthErrorPage() {
  const sp = useSearchParams(); // may be typed as nullable
  const err = sp?.get("error") ?? "AccessDenied"; // ✅ guard with optional chaining
  const hinted = sp?.get("login_hint") ?? ""; // ✅ prefill if present

  const [email, setEmail] = useState(hinted);

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

  return (
    <main className="card" style={{ maxWidth: 720, margin: "48px auto" }}>
      <h1>Request access</h1>

      {err === "AccessDenied" ? (
        <p>
          This app is currently in <b>Testing</b>. Only approved testers can
          sign in. Send us a quick email and we’ll add you to the tester list.
          Please provide email that you would use for your Google calendar.
        </p>
      ) : (
        <p>Something went wrong. You can request access below.</p>
      )}

      <div style={{ marginTop: 16 }}>
        <label>Your Google email</label>
        <input
          type="email"
          placeholder="you@gmail.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: "100%" }}
          required
        />
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
        <a
          className={`btn ${!email ? "disabled" : ""}`}
          href={mailtoHref}
          onClick={(e) => !email && e.preventDefault()}
        >
          Send email
        </a>
        <a
          className={`btn secondary ${!email ? "disabled" : ""}`}
          href={gmailHref}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => !email && e.preventDefault()}
        >
          Open in Gmail
        </a>
        <button
          className="btn secondary"
          onClick={() => navigator.clipboard.writeText(`${subject}\n\n${body}`)}
        >
          Copy message
        </button>
        <Link className="btn secondary" href="/">
          Back home
        </Link>
      </div>

      <p style={{ fontSize: 12, color: "#999", marginTop: 24 }}>
        Tip: In Testing mode Google may require re-consent after about 7 days.
      </p>
    </main>
  );
}
