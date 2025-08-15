export const metadata = {
  title: "Terms of Service – Magna Shift Rota by ND",
  description: "Terms governing use of the Magna Shift Rota by ND application.",
};

export default function TermsPage() {
  return (
    <main className="card" style={{ margin: 24, maxWidth: 900 }}>
      <h1>Terms of Service</h1>
      <p>
        Magna Shift Rota by ND is provided “as is”, without warranties or
        guarantees of any kind. You are responsible for verifying events before
        use and for complying with your employer’s policies.
      </p>

      <h3>Acceptable use</h3>
      <ul>
        <li>Don’t abuse the app or attempt to disrupt service.</li>
        <li>
          Don’t use it to add misleading or unauthorized content to calendars
          you don’t control.
        </li>
      </ul>

      <h3>Availability & changes</h3>
      <p>
        We may change or discontinue the service at any time. We’re not liable
        for any loss arising from downtime or errors.
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
