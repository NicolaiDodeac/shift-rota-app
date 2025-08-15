"use client";

import { SessionProvider } from "next-auth/react";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider
      refetchOnWindowFocus={false} // fewer background fetches
      // refetchInterval={0}         // (default) no polling
      // refetchWhenOffline={false}  // (default) don’t refetch when offline
    >
      {children}
    </SessionProvider>
  );
}
