"use client";
import { useEffect, useState } from "react";

type Dashboard = {
  basicHours: number;
  overtimeHours: number;
  bankedHours: number;
  balanceHours: number;
  confirmedWeeks: number;
};

export default function DashboardPage() {
  // ✅ correct generic + initial state
  const [data, setData] = useState<Dashboard | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/dashboard");
      if (res.ok) setData(await res.json());
    })();
  }, []);

  if (!data) {
    return (
      <main>
        <h1>Dashboard</h1>
        <p>Loading…</p>
      </main>
    );
  }

  // ...render with `data`
}
