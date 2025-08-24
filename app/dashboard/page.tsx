"use client";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import LoaderOverlay from "@/components/LoaderOverlay";
import { useDashboard } from "@/lib/hooks/useDashboard";

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
  const { data, isLoading, error } = useDashboard();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  if (isLoading) {
    return (
      <main className="container">
        <LoaderOverlay 
          title="Loading Dashboard"
          subtitle="Please wait while we fetch your data..."
          size="lg"
          variant="inline"
        />
      </main>
    );
  }

  if (error) {
    return (
      <main className="container">
        <Card padding="lg" elevation="md">
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ color: 'var(--color-error)' }}>Dashboard Error</h1>
            <p style={{ color: 'var(--color-text-secondary)' }}>{error.message}</p>
          </div>
        </Card>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="container">
        <Card padding="lg" elevation="md">
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ color: 'var(--color-error)' }}>No Data Available</h1>
            <p style={{ color: 'var(--color-text-secondary)' }}>Unable to load dashboard data.</p>
          </div>
        </Card>
      </main>
    );
  }

  return (
    <main className="container">
      {/* Header */}
      <div style={{ marginBottom: 'var(--space-lg)' }}>
        <h1>Dashboard</h1>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-xs)' }}>
          Timezone: {data.tz}
        </p>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
          Contract Year: {formatDate(data.contractYearStartISO)}
        </p>
      </div>

      {/* Summary Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: 'var(--space-md)', 
        marginBottom: 'var(--space-lg)' 
      }}>
        <Card padding="md" elevation="sm">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{
              padding: 'var(--space-sm)',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-info)',
              color: 'white',
              width: '2rem',
              height: '2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 'var(--space-sm)'
            }}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '1.25rem', height: '1.25rem' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', margin: 0 }}>Target Hours</p>
              <p style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, margin: 0 }}>{data.targetHours}h</p>
            </div>
          </div>
        </Card>

        <Card padding="md" elevation="sm">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{
              padding: 'var(--space-sm)',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-success)',
              color: 'white',
              width: '2rem',
              height: '2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 'var(--space-sm)'
            }}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '1.25rem', height: '1.25rem' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', margin: 0 }}>Basic Hours</p>
              <p style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, margin: 0 }}>{data.basicHours}h</p>
            </div>
          </div>
        </Card>

        <Card padding="md" elevation="sm">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{
              padding: 'var(--space-sm)',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-warning)',
              color: 'white',
              width: '2rem',
              height: '2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 'var(--space-sm)'
            }}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '1.25rem', height: '1.25rem' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', margin: 0 }}>Overtime Hours</p>
              <p style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, margin: 0 }}>{data.overtimeHours}h</p>
            </div>
          </div>
        </Card>

        <Card padding="md" elevation="sm">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{
              padding: 'var(--space-sm)',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--magna-orange)',
              color: 'white',
              width: '2rem',
              height: '2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 'var(--space-sm)'
            }}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '1.25rem', height: '1.25rem' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <div>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', margin: 0 }}>Banked Hours</p>
              <p style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, margin: 0 }}>{data.bankedHours}h</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Balance and Progress */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: 'var(--space-lg)', 
        marginBottom: 'var(--space-lg)' 
      }}>
        <Card padding="lg" elevation="md">
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ marginBottom: 'var(--space-md)' }}>Current Balance</h2>
            <div style={{ marginBottom: 'var(--space-sm)' }}>
              <span style={{ 
                fontSize: 'var(--font-size-4xl)', 
                fontWeight: 700,
                color: data.balanceHours >= 0 ? 'var(--color-success)' : 'var(--color-error)'
              }}>
                {data.balanceHours >= 0 ? '+' : ''}{data.balanceHours}h
              </span>
            </div>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', margin: 0 }}>
              {data.balanceHours >= 0 
                ? `${data.balanceHours}h remaining to reach target`
                : `${Math.abs(data.balanceHours)}h over target`
              }
            </p>
          </div>
        </Card>

        <Card padding="lg" elevation="md">
          <h2 style={{ marginBottom: 'var(--space-md)' }}>Progress</h2>
          <div style={{
            width: '100%',
            height: '0.75rem',
            backgroundColor: 'var(--color-border)',
            borderRadius: '9999px',
            overflow: 'hidden',
            marginBottom: 'var(--space-sm)'
          }}>
            <div style={{
              height: '100%',
              background: 'var(--gradient-brand)',
              borderRadius: '9999px',
              transition: 'width 0.3s ease',
              width: `${Math.min(100, Math.max(0, (data.bankedHours / data.targetHours) * 100))}%`
            }}></div>
          </div>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', margin: 0, textAlign: 'center' }}>
            {data.confirmedWeeks} weeks confirmed • {((data.bankedHours / data.targetHours) * 100).toFixed(1)}% complete
          </p>
        </Card>
      </div>

      {/* Instructions */}
      <Card padding="md" elevation="sm">
        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
          <div style={{
            width: '1.25rem',
            height: '1.25rem',
            color: 'var(--magna-orange)',
            marginRight: 'var(--space-sm)',
            flexShrink: 0,
            marginTop: '0.125rem'
          }}>
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h3 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500, margin: '0 0 var(--space-sm) 0' }}>
              Understanding your dashboard
            </h3>
            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
              <p style={{ margin: '0 0 var(--space-xs) 0' }}>• <strong>Target Hours:</strong> Your annual contracted hours</p>
              <p style={{ margin: '0 0 var(--space-xs) 0' }}>• <strong>Basic Hours:</strong> Standard hours worked (confirmed weeks only)</p>
              <p style={{ margin: '0 0 var(--space-xs) 0' }}>• <strong>Overtime Hours:</strong> Extra hours worked (confirmed weeks only)</p>
              <p style={{ margin: '0 0 var(--space-xs) 0' }}>• <strong>Banked Hours:</strong> Total hours credited to your balance</p>
              <p style={{ margin: 0 }}>• <strong>Balance:</strong> Remaining hours to reach your target</p>
            </div>
          </div>
        </div>
      </Card>
    </main>
  );
}
