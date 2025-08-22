"use client";
import { useEffect, useState } from "react";

type WeekRow = {
  weekStartISO: string;
  scheduledMinutes: number;
  basicMinutes: number;
  overtimeMinutes: number;
  bankedMinutes: number;
  confirmed?: boolean;
};

export default function SummaryPage() {
  const [data, setData] = useState<{ tz: string; weeks: WeekRow[] } | null>(
    null
  );
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/summary");
        const ct = res.headers.get("content-type") || "";
        const payload = ct.includes("application/json")
          ? await res.json()
          : await res.text();
        if (!res.ok)
          throw new Error(
            typeof payload === "string"
              ? payload
              : payload?.message || res.statusText
          );

        // const res = await fetch("/api/summary");
        // const json = await res.json();
        // if (!res.ok) throw new Error(json?.message || res.statusText);
        // setData(json);
      } catch (e: any) {
        setErr(e.message || String(e));
      }
    })();
  }, []);

  if (err)
    return (
      <main>
        <h1>Summary</h1>
        <p style={{ color: "#e5484d" }}>{err}</p>
      </main>
    );
  if (!data)
    return (
      <main>
        <h1>Summary</h1>
        <p>Loading…</p>
      </main>
    );

  return (
    <main>
      <h1>Summary ({data.tz})</h1>
      <table>
        <thead>
          <tr>
            <th>Week</th>
            <th>Scheduled</th>
            <th>Basic</th>
            <th>OT</th>
            <th>Banked</th>
            <th>Confirmed</th>
          </tr>
        </thead>
        <tbody>
          {data.weeks.map((w) => (
            <tr key={w.weekStartISO}>
              <td>{new Date(w.weekStartISO).toLocaleDateString()}</td>
              <td>{w.scheduledMinutes}</td>
              <td>{w.basicMinutes}</td>
              <td>{w.overtimeMinutes}</td>
              <td>{w.bankedMinutes}</td>
              <td>{w.confirmed ? "✓" : ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
