import "./globals.css";
import { ReactNode } from "react";
import Providers from "./providers";
import BrandLogo from "@/components/BrandLogo";
import s from "./layout.module.css";
import { Metadata } from "next";
import AuthButtons from "@/components/AuthButtons";

export const metadata: Metadata = {
  title: "Magna Shift Rota",
  description: "4-on-4-off shift planner with Google Calendar sync",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: ["/favicon.ico"],
  },
  manifest: "/site.webmanifest",
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
        <Providers>
          {" "}
          <header className={s.header}>
            {" "}
            {/* ← NEW */}
            <div className={s.inner}>
              <BrandLogo /> {/* ← NEW */}
              <AuthButtons />
              {/* (Optional) add nav links here later */}
            </div>
          </header>
          {children}
        </Providers>
        <footer style={{ margin: "24px 0", textAlign: "center", opacity: 0.8 }}>
          <a href="/privacy">Privacy</a> · <a href="/terms">Terms</a>
        </footer>
      </body>
    </html>
  );
}
