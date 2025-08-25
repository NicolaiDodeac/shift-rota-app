"use client";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import LoaderOverlay from "@/components/LoaderOverlay";
import { useDashboard } from "@/lib/hooks/useDashboard";
import { usePredictions } from "@/lib/hooks/usePredictions";
import Link from "next/link";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

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
  const { data: predictions, isLoading: predictionsLoading, error: predictionsError } = usePredictions();
  const [isCleaning, setIsCleaning] = useState(false);
  const queryClient = useQueryClient();

  const handleCleanup = async () => {
    if (!confirm("This will remove duplicate shifts. Are you sure?")) return;
    
    setIsCleaning(true);
    try {
      const response = await fetch("/api/cleanup-shifts", { method: "POST" });
      const result = await response.json();
      
      if (response.ok) {
        alert(`Cleanup completed! Removed ${result.shiftsDeleted} duplicate shifts.`);
        
        // Invalidate React Query cache to force fresh data
        await queryClient.invalidateQueries({ queryKey: ["predictions"] });
        await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
        await queryClient.invalidateQueries({ queryKey: ["summary"] });
        
        // Refresh the page to show updated data
        window.location.reload();
      } else {
        alert("Error during cleanup: " + result.error);
      }
    } catch (error) {
      alert("Error during cleanup: " + error);
    } finally {
      setIsCleaning(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  if (isLoading || predictionsLoading) {
    return (
      <main className="container">
        <LoaderOverlay 
          title="Loading Dashboard"
          sub="Please wait while we fetch your data..."
        />
      </main>
    );
  }

  if (error || predictionsError) {
    return (
      <main className="container">
        <Card padding="lg" elevation="md">
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ color: 'var(--color-error)' }}>Dashboard Error</h1>
            <p style={{ color: 'var(--color-text-secondary)' }}>
              {error?.message || predictionsError?.message || 'An error occurred while loading dashboard data'}
            </p>
          </div>
        </Card>
      </main>
    );
  }

  if (!data || !predictions) {
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

      {/* Prediction and Planning Section */}
      <div style={{ marginBottom: 'var(--space-lg)' }}>
        <h2 style={{ marginBottom: 'var(--space-md)' }}>Predictions & Planning</h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: 'var(--space-lg)', 
          marginBottom: 'var(--space-lg)' 
        }}>
          {/* Prediction Status */}
          <Card padding="lg" elevation="md">
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ marginBottom: 'var(--space-md)' }}>Prediction Status</h3>
              <div style={{ marginBottom: 'var(--space-sm)' }}>
                <span style={{ 
                  fontSize: 'var(--font-size-3xl)', 
                  fontWeight: 700,
                  color: predictions.projections.onTrack ? 'var(--color-success)' : 'var(--color-warning)'
                }}>
                  {predictions.projections.onTrack ? 'On Track' : 'Behind Schedule'}
                </span>
              </div>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', margin: '0 0 var(--space-sm) 0' }}>
                Projected: {predictions.projections.projectedEndHours}h
              </p>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', margin: 0 }}>
                Target: {predictions.currentStatus.targetHours}h
              </p>
            </div>
          </Card>

          {/* Overtime Recommendations */}
          <Card padding="lg" elevation="md">
            <h3 style={{ marginBottom: 'var(--space-md)' }}>Overtime Recommendations</h3>
            {predictions.projections.overtimeRecommendations.totalOvertimeNeeded > 0 ? (
              <div>
                <div style={{ marginBottom: 'var(--space-sm)' }}>
                  <span style={{ 
                    fontSize: 'var(--font-size-2xl)', 
                    fontWeight: 700,
                    color: predictions.projections.overtimeRecommendations.isAchievable ? 'var(--color-warning)' : 'var(--color-error)'
                  }}>
                    {predictions.projections.overtimeRecommendations.weeklyOvertimeNeeded.toFixed(1)}h/week
                  </span>
                </div>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', margin: '0 0 var(--space-sm) 0' }}>
                  Total needed: {predictions.projections.overtimeRecommendations.totalOvertimeNeeded.toFixed(1)}h
                </p>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', margin: 0 }}>
                  {predictions.projections.overtimeRecommendations.isAchievable ? 'Achievable' : 'May need adjustment'}
                </p>
              </div>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <span style={{ 
                  fontSize: 'var(--font-size-2xl)', 
                  fontWeight: 700,
                  color: 'var(--color-success)'
                }}>
                  No overtime needed
                </span>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', margin: 'var(--space-sm) 0 0 0' }}>
                  You're projected to meet your target
                </p>
              </div>
            )}
          </Card>

          {/* Weekly Summary */}
          <Card padding="lg" elevation="md">
            <h3 style={{ marginBottom: 'var(--space-md)' }}>Weekly Summary</h3>
            <div style={{ display: 'grid', gap: 'var(--space-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Confirmed:</span>
                <span style={{ fontWeight: 600 }}>{predictions.currentStatus.confirmedHours}h</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Predicted:</span>
                <span style={{ fontWeight: 600 }}>{predictions.currentStatus.predictedHours}h</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Weeks remaining:</span>
                <span style={{ fontWeight: 600 }}>{predictions.currentStatus.weeksRemaining}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Gaps identified:</span>
                <span style={{ fontWeight: 600 }}>{predictions.weeklyBreakdown.gaps.length}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Specific Week Recommendations */}
      {predictions.projections.overtimeRecommendations.specificWeeks.length > 0 && (
        <div style={{ marginBottom: 'var(--space-lg)' }}>
          <h3 style={{ marginBottom: 'var(--space-md)' }}>Weeks Needing Overtime</h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: 'var(--space-md)' 
          }}>
            {predictions.projections.overtimeRecommendations.specificWeeks.map((week, index) => (
              <Card key={index} padding="md" elevation="sm">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-sm)' }}>
                  <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                    {formatDate(week.weekStart)} - {formatDate(week.weekEnd)}
                  </span>
                  <span style={{ 
                    fontSize: 'var(--font-size-lg)', 
                    fontWeight: 600,
                    color: 'var(--color-warning)'
                  }}>
                    +{week.overtimeNeeded.toFixed(1)}h
                  </span>
                </div>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                  <div>Current: {week.currentHours.toFixed(1)}h</div>
                  <div>Target: {week.targetHours.toFixed(1)}h</div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div style={{ marginBottom: 'var(--space-lg)' }}>
        <div style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
          <Link href="/planning">
            <Button 
              variant="primary" 
              style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '1rem', height: '1rem' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Detailed Planning & Analysis
            </Button>
          </Link>
          <Button 
            variant="secondary" 
            onClick={handleCleanup}
            disabled={isCleaning}
            style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '1rem', height: '1rem' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            {isCleaning ? 'Cleaning...' : 'Clean Duplicate Shifts'}
          </Button>
        </div>
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
              <p style={{ margin: '0 0 var(--space-xs) 0' }}>• <strong>Balance:</strong> Remaining hours to reach your target</p>
              <p style={{ margin: '0 0 var(--space-xs) 0' }}>• <strong>Predictions:</strong> Projected hours based on scheduled shifts</p>
              <p style={{ margin: 0, color: 'var(--color-warning)', fontWeight: 500 }}>
                ⚠️ If you see unusual hours (like 66h instead of 48h), you may have duplicate shifts from running schedule generation multiple times. Use the "Clean Duplicate Shifts" button above.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </main>
  );
}
