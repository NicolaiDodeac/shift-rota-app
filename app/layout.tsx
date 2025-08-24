import "../styles/globals.css";
import { ReactNode } from "react";
import Providers from "./providers";
import BrandLogo from "@/components/BrandLogo";
import { Metadata } from "next";
import AuthButtons from "@/components/AuthButtons";
import Navigation from "@/components/Navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ErrorBoundary } from "@/components/ErrorBoundary";


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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('magna-theme');
                  if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('themeDark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body>
        <Providers>
          
          <div className="container">
            <header style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 'var(--space-md)',
              padding: 'var(--space-md) 0',
              borderBottom: '1px solid var(--color-border)',
              marginBottom: 'var(--space-lg)',
              textAlign: 'center'
            }}>
              <BrandLogo />
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 'var(--space-md)',
                width: '100%'
              }}>
                <Navigation />
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-md)',
                  justifyContent: 'center'
                }}>
                  <ThemeToggle />
                  <AuthButtons />
                </div>
              </div>
            </header>
            <main style={{
              maxWidth: '100%',
              padding: '0 var(--space-sm)'
            }}>
              <ErrorBoundary>
                {children}
              </ErrorBoundary>
            </main>
            <footer style={{
              marginTop: 'var(--space-2xl)',
              paddingTop: 'var(--space-lg)',
              borderTop: '1px solid var(--color-border)',
              textAlign: 'center',
              color: 'var(--color-text-secondary)',
              fontSize: 'var(--font-size-sm)',
              padding: '0 var(--space-sm)'
            }}>
              <a href="/privacy">Privacy</a> · <a href="/terms">Terms</a>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
