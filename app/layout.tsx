import "./globals.css";
import { ReactNode } from "react";
import Providers from "./providers";

export const metadata = {
  title: "Magna Shift Rota by ND",
  description: "4-on-4-off shift rota generator with Google Calendar sync",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body
        style={{
          fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
          padding: 16,
          maxWidth: 960,
          margin: "0 auto",
        }}
      >
        <Providers>{children}</Providers>
        <footer style={{ margin: "24px 0", textAlign: "center", opacity: 0.8 }}>
          <a href="/privacy">Privacy</a> · <a href="/terms">Terms</a>
        </footer>
      </body>
    </html>
  );
}
