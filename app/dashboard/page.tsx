"use client";
import { useEffect, useState } from "react";
import styles from "./page.module.css";

type Dashboard = {
  tz: string;
  contractYearStartISO: string;
  targetHours: number;
  basicHours: number;
  overtimeHours: number;
  bankedHours: number;
  balanceHours: number;
  confirmedWeeks: number;
};

export default function DashboardPage() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        console.log("Fetching dashboard data...");
        const res = await fetch("/api/dashboard");
        console.log("Dashboard response status:", res.status);
        console.log("Dashboard response ok:", res.ok);
        
        if (!res.ok) {
          const errorText = await res.text();
          console.error("Dashboard error response:", errorText);
          throw new Error(`HTTP error! status: ${res.status} - ${errorText}`);
        }
        
        const dashboardData = await res.json();
        console.log("Dashboard data received:", dashboardData);
        setData(dashboardData);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  if (loading) {
    return (
      <main className={styles.container}>
        <div className={styles.wrapper}>
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <h1 className={styles.loadingTitle}>Loading Dashboard</h1>
            <p className={styles.loadingText}>Please wait while we fetch your data...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className={styles.container}>
        <div className={styles.wrapper}>
          <div className={styles.errorContainer}>
            <h1 className={styles.errorTitle}>Dashboard Error</h1>
            <p className={styles.errorMessage}>{error}</p>
          </div>
        </div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className={styles.container}>
        <div className={styles.wrapper}>
          <div className={styles.errorContainer}>
            <h1 className={styles.errorTitle}>No Data Available</h1>
            <p className={styles.errorMessage}>Unable to load dashboard data.</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.container}>
      <div className={styles.wrapper}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div>
              <h1 className={styles.title}>Dashboard</h1>
              <p className={styles.subtitle}>Timezone: {data.tz}</p>
              <p className={styles.contractYear}>
                Contract Year: {formatDate(data.contractYearStartISO)}
              </p>
            </div>
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
                <p className={styles.cardLabel}>Target Hours</p>
                <p className={styles.cardValue}>{data.targetHours}h</p>
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
                <p className={styles.cardLabel}>Basic Hours</p>
                <p className={styles.cardValue}>{data.basicHours}h</p>
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
                <p className={styles.cardLabel}>Overtime Hours</p>
                <p className={styles.cardValue}>{data.overtimeHours}h</p>
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
                <p className={styles.cardLabel}>Banked Hours</p>
                <p className={styles.cardValue}>{data.bankedHours}h</p>
              </div>
            </div>
          </div>
        </div>

        {/* Balance and Progress */}
        <div className={styles.balanceSection}>
          <div className={styles.balanceCard}>
            <h2 className={styles.balanceTitle}>Current Balance</h2>
            <div className={styles.balanceValue}>
              <span className={data.balanceHours >= 0 ? styles.positive : styles.negative}>
                {data.balanceHours >= 0 ? '+' : ''}{data.balanceHours}h
              </span>
            </div>
            <p className={styles.balanceDescription}>
              {data.balanceHours >= 0 
                ? `${data.balanceHours}h remaining to reach target`
                : `${Math.abs(data.balanceHours)}h over target`
              }
            </p>
          </div>

          <div className={styles.progressCard}>
            <h2 className={styles.progressTitle}>Progress</h2>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill} 
                style={{ 
                  width: `${Math.min(100, Math.max(0, (data.bankedHours / data.targetHours) * 100))}%` 
                }}
              ></div>
            </div>
            <p className={styles.progressText}>
              {data.confirmedWeeks} weeks confirmed • {((data.bankedHours / data.targetHours) * 100).toFixed(1)}% complete
            </p>
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
              <h3 className={styles.instructionsTitle}>Understanding your dashboard</h3>
              <div className={styles.instructionsText}>
                <p>• <strong>Target Hours:</strong> Your annual contracted hours</p>
                <p>• <strong>Basic Hours:</strong> Standard hours worked (confirmed weeks only)</p>
                <p>• <strong>Overtime Hours:</strong> Extra hours worked (confirmed weeks only)</p>
                <p>• <strong>Banked Hours:</strong> Total hours credited to your balance</p>
                <p>• <strong>Balance:</strong> Remaining hours to reach your target</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
