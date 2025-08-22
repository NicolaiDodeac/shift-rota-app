"use client";
import { useEffect, useState } from "react";
import styles from "./page.module.css";

type WeekRow = {
  weekStartISO: string;
  scheduledMinutes: number;
  basicMinutes: number;
  overtimeMinutes: number;
  bankedMinutes: number;
  confirmed?: boolean;
};

export default function SummaryPage() {
  const [data, setData] = useState<{ tz: string; weeks: WeekRow[] } | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
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
      setData(payload);
    } catch (e: any) {
      setErr(e.message || String(e));
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const confirmWeek = async (week: WeekRow) => {
    setLoading(prev => ({ ...prev, [week.weekStartISO]: true }));
    try {
      // Calculate week end date (7 days after start)
      const weekStart = new Date(week.weekStartISO);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);
      
      const res = await fetch("/api/summary/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weekStartISO: week.weekStartISO,
          weekEndISO: weekEnd.toISOString(),
          scheduledMinutes: week.scheduledMinutes,
          basicMinutes: week.basicMinutes,
          overtimeMinutes: week.overtimeMinutes,
          bankedMinutes: week.bankedMinutes,
        }),
      });
      
      if (!res.ok) {
        const error = await res.text();
        throw new Error(error);
      }
      
      // Refresh data after confirmation
      await fetchData();
    } catch (e: any) {
      setErr(e.message || String(e));
    } finally {
      setLoading(prev => ({ ...prev, [week.weekStartISO]: false }));
    }
  };

  const formatMinutes = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  if (err)
    return (
      <main className={styles.container}>
        <div className={styles.wrapper}>
          <div className={styles.errorContainer}>
            <h1 className={styles.errorTitle}>Summary Error</h1>
            <p className={styles.errorMessage}>{err}</p>
          </div>
        </div>
      </main>
    );

  if (!data)
    return (
      <main className={styles.container}>
        <div className={styles.wrapper}>
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <h1 className={styles.loadingTitle}>Loading Summary</h1>
            <p className={styles.loadingText}>Please wait while we fetch your data...</p>
          </div>
        </div>
      </main>
    );

  return (
    <main className={styles.container}>
      <div className={styles.wrapper}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div>
              <h1 className={styles.title}>Weekly Summary</h1>
              <p className={styles.subtitle}>Timezone: {data.tz}</p>
            </div>
            <button
              onClick={() => {
                setRefreshing(true);
                fetchData().finally(() => setRefreshing(false));
              }}
              disabled={refreshing}
              className={styles.refreshButton}
            >
              {refreshing ? (
                <div className={styles.spinner}></div>
              ) : (
                <svg className={styles.refreshIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              )}
              Refresh
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className={styles.cardsGrid}>
          <div className={styles.card}>
            <div className={styles.cardContent}>
              <div className={`${styles.cardIcon} ${styles.blue}`}>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className={styles.cardText}>
                <p className={styles.cardLabel}>Total Scheduled</p>
                <p className={styles.cardValue}>
                  {formatMinutes(data.weeks.reduce((sum, w) => sum + w.scheduledMinutes, 0))}
                </p>
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardContent}>
              <div className={`${styles.cardIcon} ${styles.green}`}>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className={styles.cardText}>
                <p className={styles.cardLabel}>Confirmed Weeks</p>
                <p className={styles.cardValue}>
                  {data.weeks.filter(w => w.confirmed).length} / {data.weeks.length}
                </p>
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardContent}>
              <div className={`${styles.cardIcon} ${styles.yellow}`}>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className={styles.cardText}>
                <p className={styles.cardLabel}>Total Overtime</p>
                <p className={styles.cardValue}>
                  {formatMinutes(data.weeks.reduce((sum, w) => sum + w.overtimeMinutes, 0))}
                </p>
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardContent}>
              <div className={`${styles.cardIcon} ${styles.purple}`}>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <div className={styles.cardText}>
                <p className={styles.cardLabel}>Total Banked</p>
                <p className={styles.cardValue}>
                  {formatMinutes(data.weeks.reduce((sum, w) => sum + w.bankedMinutes, 0))}
                </p>
              </div>
            </div>
          </div>
        </div>

                {/* Weeks Table */}
        <div className={styles.tableContainer}>
          <div className={styles.tableHeader}>
            <h2 className={styles.tableTitle}>Weekly Breakdown</h2>
            <p className={styles.tableSubtitle}>Click to confirm completed weeks</p>
          </div>
          
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead className={styles.tableHead}>
                <tr>
                  <th className={styles.tableHeaderCell}>Week Starting</th>
                  <th className={styles.tableHeaderCell}>Scheduled</th>
                  <th className={styles.tableHeaderCell}>Basic</th>
                  <th className={styles.tableHeaderCell}>Overtime</th>
                  <th className={styles.tableHeaderCell}>Banked</th>
                  <th className={styles.tableHeaderCell}>Status</th>
                  <th className={styles.tableHeaderCell}>Actions</th>
                </tr>
              </thead>
              <tbody className={styles.tableBody}>
                {data.weeks.map((week, index) => (
                  <tr key={week.weekStartISO} className={styles.tableRow}>
                    <td className={`${styles.tableCell} ${styles.weekInfo}`}>
                      <div className={styles.weekDate}>
                        {formatDate(week.weekStartISO)}
                      </div>
                      <div className={styles.weekNumber}>
                        Week {index + 1}
                      </div>
                    </td>
                    <td className={styles.tableCell}>
                      {formatMinutes(week.scheduledMinutes)}
                    </td>
                    <td className={styles.tableCell}>
                      {formatMinutes(week.basicMinutes)}
                    </td>
                    <td className={styles.tableCell}>
                      {formatMinutes(week.overtimeMinutes)}
                    </td>
                    <td className={styles.tableCell}>
                      {formatMinutes(week.bankedMinutes)}
                    </td>
                    <td className={styles.tableCell}>
                      {week.confirmed ? (
                        <span className={`${styles.statusBadge} ${styles.confirmed}`}>
                          <svg fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Confirmed
                        </span>
                      ) : (
                        <span className={`${styles.statusBadge} ${styles.pending}`}>
                          <svg fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                          Pending
                        </span>
                      )}
                    </td>
                    <td className={styles.tableCell}>
                      {week.confirmed ? (
                        <span className={styles.confirmedText}>✓ Confirmed</span>
                      ) : (
                        <button
                          onClick={() => confirmWeek(week)}
                          disabled={loading[week.weekStartISO]}
                          className={styles.confirmButton}
                        >
                          {loading[week.weekStartISO] ? (
                            <>
                              <div className={styles.spinner}></div>
                              Confirming...
                            </>
                          ) : (
                            <>
                              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Confirm Week
                            </>
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Instructions */}
        <div className={styles.instructions}>
          <div className={styles.instructionsContent}>
            <div className={styles.instructionsIcon}>
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className={styles.instructionsTitle}>How to use this summary</h3>
              <div className={styles.instructionsText}>
                <p>• Click "Confirm Week" to mark a week as completed</p>
                <p>• Confirmed weeks will be included in your dashboard totals</p>
                <p>• You can refresh the data anytime using the refresh button</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
