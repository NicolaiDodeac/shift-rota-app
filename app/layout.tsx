import './globals.css';
import { ReactNode } from 'react';

export const metadata = {
  title: '4-on-4-off Shift Rota',
  description: 'Generate 4-on-4-off (2 weeks days / 2 weeks nights) rota and sync to Google Calendar.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif', padding: 16, maxWidth: 960, margin: '0 auto' }}>
        {children}
      </body>
    </html>
  );
}
