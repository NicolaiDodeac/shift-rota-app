"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import LoaderOverlay from "@/components/LoaderOverlay";
import { usePredictions } from "@/lib/hooks/usePredictions";
import { useSettings } from "@/lib/hooks/useSettings";
import { useQueryClient } from "@tanstack/react-query";
import styles from "./page.module.css";

export default function PlanningPage() {
  const { data: predictions, isLoading, error, refetch } = usePredictions();
  const { data: settings } = useSettings();
  const queryClient = useQueryClient();
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().slice(0, 7)
  );
  const [monthsToShow, setMonthsToShow] = useState(1); // Start with 1 month

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ["predictions"] });
    await refetch();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  const formatMonth = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  if (isLoading) {
    return (
      <main className="container">
        <LoaderOverlay 
          title="Loading Planning Data"
          sub="Please wait while we analyze your schedule..."
        />
      </main>
    );
  }

  if (error) {
    return (
      <main className="container">
        <Card padding="lg" elevation="md">
          <div className={styles.errorContainer}>
            <h1 className={styles.errorTitle}>Planning Error</h1>
            <p className={styles.errorMessage}>{error.message}</p>
          </div>
        </Card>
      </main>
    );
  }

  if (!predictions) {
    return (
      <main className="container">
        <Card padding="lg" elevation="md">
          <div className={styles.errorContainer}>
            <h1 className={styles.errorTitle}>No Data Available</h1>
            <p className={styles.errorMessage}>Unable to load planning data.</p>
          </div>
        </Card>
      </main>
    );
  }

  // Filter weeks for selected month
  const selectedMonthWeeks = [
    ...predictions.weeklyBreakdown.confirmed,
    ...predictions.weeklyBreakdown.predicted
  ].filter(week => {
    const weekMonth = week.weekStart.slice(0, 7);
    return weekMonth === selectedMonth;
  });

  const monthlyConfirmed = selectedMonthWeeks
    .filter(week => week.confirmed)
    .reduce((acc, week) => acc + week.hours, 0);

  const monthlyPredicted = selectedMonthWeeks
    .filter(week => !week.confirmed)
    .reduce((acc, week) => acc + week.hours, 0);

  const monthlyTarget = predictions.currentStatus.targetHours / 12; // Annual target divided by 12 months

  return (
    <main className="container">
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div>
            <h1>Planning & Analysis</h1>
            <p className={styles.headerText}>
              Detailed analysis and planning for your annualized hours target
            </p>
            <p className={styles.warningText}>
              ⚠️ If you recently cleaned duplicate shifts, click "Refresh Data" to see updated hours
            </p>
          </div>
          <Button 
            variant="secondary" 
            onClick={handleRefresh}
            disabled={isLoading}
            className={styles.refreshButton}
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className={styles.refreshIcon}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {isLoading ? 'Refreshing...' : 'Refresh Data'}
          </Button>
        </div>
      </div>

      {/* Current Status Overview */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Current Status</h2>
        <div className={styles.statusGrid}>
          <Card padding="md" elevation="sm">
            <h4 style={{ marginBottom: 'var(--space-sm)' }}>Confirmed Hours</h4>
            <p className={styles.confirmedHours}>
              {predictions.currentStatus.confirmedHours}h
            </p>
          </Card>
          <Card padding="md" elevation="sm">
            <h4 style={{ marginBottom: 'var(--space-sm)' }}>Predicted Hours</h4>
            <p className={styles.predictedHours}>
              {predictions.currentStatus.predictedHours}h
            </p>
          </Card>
          <Card padding="md" elevation="sm">
            <h4 style={{ marginBottom: 'var(--space-sm)' }}>Target Hours</h4>
            <p className={styles.targetHours}>
              {predictions.currentStatus.targetHours}h
            </p>
          </Card>
          <Card padding="md" elevation="sm">
            <h4 style={{ marginBottom: 'var(--space-sm)' }}>Weeks Remaining</h4>
            <p className={styles.weeksRemaining}>
              {predictions.currentStatus.weeksRemaining}
            </p>
          </Card>
        </div>
      </div>

      {/* Projections */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Projections</h2>
        <div className={styles.projectionsGrid}>
          <Card padding="lg" elevation="md">
            <div className={styles.statusCard}>
              <h3 className={styles.statusTitle}>Status</h3>
              <div style={{ marginBottom: 'var(--space-sm)' }}>
                <span className={`${styles.statusText} ${predictions.projections.onTrack ? styles.statusTextOnTrack : styles.statusTextBehind}`}>
                  {predictions.projections.onTrack ? 'On Track' : 'Behind Schedule'}
                </span>
              </div>
              <p className={styles.statusSubtext}>
                Projected: {predictions.projections.projectedEndHours}h
              </p>
              <p className={styles.statusSubtextLast}>
                Target: {predictions.currentStatus.targetHours}h
              </p>
            </div>
          </Card>

          <Card padding="lg" elevation="md">
            <h3 className={styles.overtimeTitle}>Overtime Recommendations</h3>
            {predictions.projections.overtimeRecommendations.totalOvertimeNeeded > 0 ? (
              <div>
                <div style={{ marginBottom: 'var(--space-sm)' }}>
                  <span className={`${styles.overtimeAmount} ${predictions.projections.overtimeRecommendations.isAchievable ? styles.overtimeAmountAchievable : styles.overtimeAmountNotAchievable}`}>
                    {predictions.projections.overtimeRecommendations.weeklyOvertimeNeeded.toFixed(1)}h/week
                  </span>
                </div>
                <p className={styles.overtimeSubtext}>
                  Total needed: {predictions.projections.overtimeRecommendations.totalOvertimeNeeded.toFixed(1)}h
                </p>
                <p className={styles.overtimeSubtextLast}>
                  {predictions.projections.overtimeRecommendations.isAchievable ? 'Achievable' : 'May need adjustment'}
                </p>
              </div>
            ) : (
              <div className={styles.overtimeCenter}>
                <span className={styles.overtimeCenterText}>
                  No overtime needed
                </span>
                <p className={styles.overtimeCenterSubtext}>
                  You're projected to meet your target
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Monthly Breakdown */}
      <div className={styles.section}>
        <div className={styles.monthlyHeader}>
          <h2>Monthly Breakdown</h2>
        </div>

        {/* Multiple Monthly Breakdowns */}
        {Array.from({ length: monthsToShow }, (_, i) => {
          const date = new Date();
          date.setMonth(date.getMonth() + i);
          const monthKey = date.toISOString().slice(0, 7);
          
          // Filter weeks for this month
          const monthWeeks = [
            ...predictions.weeklyBreakdown.confirmed,
            ...predictions.weeklyBreakdown.predicted
          ].filter(week => {
            const weekMonth = week.weekStart.slice(0, 7);
            return weekMonth === monthKey;
          });

          const monthConfirmed = monthWeeks
            .filter(week => week.confirmed)
            .reduce((acc, week) => acc + week.hours, 0);

          const monthPredicted = monthWeeks
            .filter(week => !week.confirmed)
            .reduce((acc, week) => acc + week.hours, 0);

          const monthTarget = predictions.currentStatus.targetHours / 12;
          const monthGap = monthTarget - (monthConfirmed + monthPredicted);

          return (
            <Card key={monthKey} padding="lg" elevation="md" className={styles.monthlyCard}>
              <h3 className={styles.monthlyTitle}>{formatMonth(monthKey)}</h3>
              
              {/* Monthly Summary Cards */}
              <div className={styles.monthlySummaryGrid}>
                <div className={styles.summaryCard}>
                  <div className={styles.summaryLabel}>Target</div>
                  <div className={styles.summaryValue}>{monthTarget.toFixed(1)}h</div>
                </div>
                <div className={styles.summaryCard}>
                  <div className={styles.summaryLabel}>Confirmed</div>
                  <div className={`${styles.summaryValue} ${styles.summaryValueSuccess}`}>{monthConfirmed.toFixed(1)}h</div>
                </div>
                <div className={styles.summaryCard}>
                  <div className={styles.summaryLabel}>Predicted</div>
                  <div className={`${styles.summaryValue} ${styles.summaryValuePrimary}`}>{monthPredicted.toFixed(1)}h</div>
                </div>
                <div className={styles.summaryCard}>
                  <div className={styles.summaryLabel}>Gap</div>
                  <div className={`${styles.summaryValue} ${monthGap > 0 ? styles.summaryValueWarning : styles.summaryValueSuccess}`}>
                    {monthGap.toFixed(1)}h
                  </div>
                </div>
              </div>

              {/* Weekly Breakdown for this month */}
              <div className={styles.weeklyGrid}>
                {monthWeeks.length > 0 ? (
                  monthWeeks.map((week, index) => (
                    <div key={index} className={styles.weeklyItem}>
                      <div>
                        <span className={styles.weeklyDates}>
                          {formatDate(week.weekStart)} - {formatDate(week.weekEnd)}
                        </span>
                        <span className={styles.weeklyStatus}>
                          {week.confirmed ? '(Confirmed)' : '(Predicted)'}
                        </span>
                      </div>
                      <span className={`${styles.weeklyHours} ${week.confirmed ? styles.weeklyHoursConfirmed : styles.weeklyHoursPredicted}`}>
                        {week.hours.toFixed(1)}h
                      </span>
                    </div>
                  ))
                ) : (
                  <p className={styles.noWeeksMessage}>
                    No weeks found for {formatMonth(monthKey)}
                  </p>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Load More Button - Moved to bottom center */}
      <div className={styles.loadMoreContainer}>
        <Button 
          variant="secondary" 
          onClick={() => setMonthsToShow(prev => prev + 1)} // Load 1 more month
          disabled={isLoading}
          className={styles.loadMoreButton}
        >
          {isLoading ? (
            <>
              <svg className={`animate-spin ${styles.spinnerIcon}`} fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeDasharray="31.416" strokeDashoffset="31.416">
                  <animateTransform attributeName="transform" type="rotate" values="0 12 12;360 12 12" dur="1s" repeatCount="indefinite"/>
                </circle>
              </svg>
              Loading...
            </>
          ) : (
            <>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className={styles.loadMoreIcon}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
              Load More Months
            </>
          )}
        </Button>
      </div>

      {/* Specific Week Recommendations */}
      {predictions.projections.overtimeRecommendations.specificWeeks.length > 0 && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Weeks Needing Overtime</h2>
          <div className={styles.recommendationsGrid}>
            {predictions.projections.overtimeRecommendations.specificWeeks.map((week, index) => (
              <Card key={index} padding="md" elevation="sm">
                <div className={styles.recommendationCard}>
                  <span className={styles.recommendationDate}>
                    {formatDate(week.weekStart)} - {formatDate(week.weekEnd)}
                  </span>
                  <span className={styles.recommendationOvertime}>
                    +{week.overtimeNeeded.toFixed(1)}h
                  </span>
                </div>
                <div className={styles.recommendationDetails}>
                  <div>Current: {week.currentHours.toFixed(1)}h</div>
                  <div>Target: {week.targetHours.toFixed(1)}h</div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
