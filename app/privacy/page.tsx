export const metadata = {
  title: "Privacy Policy – Magna Shift Rota by ND",
  description:
    "How Magna Shift Rota by ND uses your Google data and what permissions it requests.",
};

export default function PrivacyPage() {
  return (
    <main className="card" style={{ margin: 24, maxWidth: 900 }}>
      <h1>Privacy Policy</h1>
      <p>
        <strong>Magna Shift Rota by ND</strong> connects to your Google account
        only to create, update, and delete shift events in your Google Calendar
        when you ask it to. We do not sell your data.
      </p>

      <h3>What data we access</h3>
      <ul>
        <li>
          <strong>Google Calendar</strong> scope: create/update/delete events in
          the calendar you choose (primary or a dedicated “Shift Rota”
          calendar).
        </li>
        <li>
          We do <em>not</em> read the contents of your other calendar events
          beyond what Google requires to insert/update your rota events.
        </li>
      </ul>

      <h3>What we store</h3>
      <ul>
        <li>
          We do not run a database. Sign-in is handled by Google/NextAuth, and
          tokens are kept in session; we don’t persist your personal data.
        </li>
      </ul>

      <h3>How to revoke access</h3>
      <p>
        You can revoke access anytime via your Google Account → Security →
        Third-party access.
      </p>

      <h3>Contact</h3>
      <p>
        Questions? Email:{" "}
        <a href="mailto:mykola.dodiak@gmail.com">Mykola.Dodiak@gmail.com</a>
      </p>

      <p style={{ color: "#b8b8be", marginTop: 16 }}>
        Last updated: {new Date().toISOString().slice(0, 10)}
      </p>
    </main>
  );
}
