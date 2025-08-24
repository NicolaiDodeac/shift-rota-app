"use client";
import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import LoaderOverlay from "@/components/LoaderOverlay";
import LogoSpinner from "@/components/LogoSpinner";
import styles from "./page.module.css";
import { useSummary, useSettings, useConfirmWeek, useUpdateWeek } from "@/lib/hooks/useSummary";
import { useUIStore } from "@/lib/stores/uiStore";

type WeekRow = {
  weekStartISO: string;
  scheduledMinutes: number;
  basicMinutes: number;
  overtimeMinutes: number;
  bankedMinutes: number;
  confirmed?: boolean;
  actualBasicMinutes?: number;
  actualOvertimeMinutes?: number;
  actualBankedMinutes?: number;
  isManualOverride?: boolean;
};

export default function SummaryPage() {
  const [editingWeek, setEditingWeek] = useState<string | null>(null);
  const [manualOverrides, setManualOverrides] = useState<{
    [weekStartISO: string]: {
      basicMinutes: number;
      overtimeMinutes: number;
      bankedMinutes: number;
    };
  }>({});

  // Zustand UI store
  const { selectedWeek, setSelectedWeek } = useUIStore();

  // React Query hooks
  const { 
    data, 
    isLoading, 
    error, 
    refetch 
  } = useSummary();
  
  const { 
    data: settings 
  } = useSettings();
  
  const confirmWeekMutation = useConfirmWeek();
  const updateWeekMutation = useUpdateWeek();

  const updateManualOverride = (weekStartISO: string, field: 'basicMinutes' | 'overtimeMinutes' | 'bankedMinutes', value: number) => {
    setManualOverrides(prev => ({
      ...prev,
      [weekStartISO]: {
        ...prev[weekStartISO],
        [field]: value,
      }
    }));
  };

  const getEffectiveValues = (week: WeekRow) => {
    const manualOverride = manualOverrides[week.weekStartISO];
    if (manualOverride) {
      return {
        basicMinutes: manualOverride.basicMinutes,
        overtimeMinutes: manualOverride.overtimeMinutes,
        bankedMinutes: manualOverride.bankedMinutes,
      };
    }
    return {
      basicMinutes: week.basicMinutes,
      overtimeMinutes: week.overtimeMinutes,
      bankedMinutes: week.bankedMinutes,
    };
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

  const calculateOvertimeAndBanked = (basicMinutes: number, settings: any) => {
    const basicHoursCap = settings?.basicHoursCap || 48;
    const overtimeMultiplier = settings?.overtimeMultiplier || 1.5;
    
    const basic = basicMinutes;
    const over = Math.max(0, basicMinutes - (basicHoursCap * 60));
    const overtime = Math.round(over * overtimeMultiplier);
    const banked = basic + overtime;
    
    return { basic, overtime, banked };
  };

  const handleConfirmWeek = async (week: WeekRow) => {
    const weekStart = new Date(week.weekStartISO);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    
    const manualOverride = manualOverrides[week.weekStartISO];
    const basicMinutes = manualOverride ? manualOverride.basicMinutes : week.basicMinutes;
    const overtimeMinutes = manualOverride ? manualOverride.overtimeMinutes : week.overtimeMinutes;
    const bankedMinutes = manualOverride ? manualOverride.bankedMinutes : week.bankedMinutes;
    
    await confirmWeekMutation.mutateAsync({
      weekStartISO: week.weekStartISO,
      weekEndISO: weekEnd.toISOString(),
      scheduledMinutes: week.scheduledMinutes,
      basicMinutes: basicMinutes,
      overtimeMinutes: overtimeMinutes,
      bankedMinutes: bankedMinutes,
      isManualOverride: !!manualOverride,
    });
    
    // Clear manual override after successful confirmation
    if (manualOverride) {
      setManualOverrides(prev => {
        const newOverrides = { ...prev };
        delete newOverrides[week.weekStartISO];
        return newOverrides;
      });
    }
    
    setEditingWeek(null);
  };

  const handleUpdateWeek = async (week: WeekRow) => {
    const weekStart = new Date(week.weekStartISO);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    
    const manualOverride = manualOverrides[week.weekStartISO];
    const basicMinutes = manualOverride ? manualOverride.basicMinutes : week.basicMinutes;
    const overtimeMinutes = manualOverride ? manualOverride.overtimeMinutes : week.overtimeMinutes;
    const bankedMinutes = manualOverride ? manualOverride.bankedMinutes : week.bankedMinutes;
    
    await updateWeekMutation.mutateAsync({
      weekStartISO: week.weekStartISO,
      weekEndISO: weekEnd.toISOString(),
      scheduledMinutes: week.scheduledMinutes,
      basicMinutes: basicMinutes,
      overtimeMinutes: overtimeMinutes,
      bankedMinutes: bankedMinutes,
      isManualOverride: !!manualOverride,
    });
    
    // Clear manual override after successful update
    if (manualOverride) {
      setManualOverrides(prev => {
        const newOverrides = { ...prev };
        delete newOverrides[week.weekStartISO];
        return newOverrides;
      });
    }
    
    setEditingWeek(null);
  };

  // Loading state
  if (isLoading) {
    return (
      <main className={styles.container}>
        <LoaderOverlay 
          title="Loading Summary"
          subtitle="Please wait while we fetch your data..."
          size="lg"
          variant="inline"
        />
      </main>
    );
  }

  // Error state
  if (error) {
    return (
      <main className={styles.container}>
        <Card padding="lg" elevation="md">
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ color: 'var(--color-error)' }}>Summary Error</h1>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-md)' }}>
              {error.message}
            </p>
            <Button variant="primary" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        </Card>
      </main>
    );
  }

  // No data state
  if (!data) {
    return (
      <main className={styles.container}>
        <LoaderOverlay 
          title="Loading Summary"
          subtitle="Please wait while we fetch your data..."
          size="lg"
          variant="inline"
        />
      </main>
    );
  }

  return (
    <main className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerInfo}>
          <h1>Weekly Summary</h1>
          <p className={styles.timezone}>Timezone: {data.tz}</p>
        </div>
        <Button 
          variant="secondary" 
          onClick={() => refetch()}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <LogoSpinner size="sm" style={{ marginRight: 'var(--space-xs)' }} />
              Refreshing...
            </>
          ) : (
            <>
              <svg style={{ width: '1rem', height: '1rem', marginRight: 'var(--space-xs)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </>
          )}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className={styles.summaryCards}>
        <Card padding="md" elevation="sm">
          <div className={styles.summaryCard}>
            <div className={`${styles.summaryCardIcon} ${styles.info}`}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '1.25rem', height: '1.25rem' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className={styles.summaryCardContent}>
              <p className={styles.summaryCardLabel}>Total Scheduled</p>
              <p className={styles.summaryCardValue}>
                {formatMinutes(data.weeks.reduce((sum, w) => sum + w.scheduledMinutes, 0))}
              </p>
            </div>
          </div>
        </Card>

        <Card padding="md" elevation="sm">
          <div className={styles.summaryCard}>
            <div className={`${styles.summaryCardIcon} ${styles.success}`}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '1.25rem', height: '1.25rem' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className={styles.summaryCardContent}>
              <p className={styles.summaryCardLabel}>Confirmed Weeks</p>
              <p className={styles.summaryCardValue}>
                {data.weeks.filter(w => w.confirmed).length} / {data.weeks.length}
              </p>
            </div>
          </div>
        </Card>

        <Card padding="md" elevation="sm">
          <div className={styles.summaryCard}>
            <div className={`${styles.summaryCardIcon} ${styles.warning}`}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '1.25rem', height: '1.25rem' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className={styles.summaryCardContent}>
              <p className={styles.summaryCardLabel}>Total Overtime</p>
              <p className={styles.summaryCardValue}>
                {formatMinutes(data.weeks.reduce((sum, w) => sum + w.overtimeMinutes, 0))}
              </p>
            </div>
          </div>
        </Card>

        <Card padding="md" elevation="sm">
          <div className={styles.summaryCard}>
            <div className={`${styles.summaryCardIcon} ${styles.primary}`}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '1.25rem', height: '1.25rem' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <div className={styles.summaryCardContent}>
              <p className={styles.summaryCardLabel}>Total Banked</p>
              <p className={styles.summaryCardValue}>
                {formatMinutes(data.weeks.reduce((sum, w) => sum + w.bankedMinutes, 0))}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Weeks Cards */}
      <div style={{ marginBottom: 'var(--space-lg)' }}>
        <h2 style={{ marginBottom: 'var(--space-sm)' }}>Weekly Breakdown</h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Tap to confirm completed weeks. Tap "Edit" to adjust hours if needed.
        </p>
      </div>
      
      <div className={styles.weeksGrid}>
        {data.weeks.map((week, index) => {
          const effectiveValues = getEffectiveValues(week);
          const manualOverride = manualOverrides[week.weekStartISO];
          const isEditing = editingWeek === week.weekStartISO;
          const isConfirming = confirmWeekMutation.isPending && confirmWeekMutation.variables?.weekStartISO === week.weekStartISO;
          const isUpdating = updateWeekMutation.isPending && updateWeekMutation.variables?.weekStartISO === week.weekStartISO;
          
          return (
            <Card 
              key={week.weekStartISO} 
              padding="md" 
              elevation="sm"
              className={`${styles.weekCard} ${isEditing ? styles.editing : ''}`}
            >
              {/* Week Header */}
              <div className={styles.weekHeader}>
                <div className={styles.weekInfo}>
                  <h3 className={styles.weekTitle}>Week {index + 1}</h3>
                  <p className={styles.weekDate}>{formatDate(week.weekStartISO)}</p>
                  {manualOverride && (
                    <span className={styles.manualOverrideBadge}>Modified</span>
                  )}
                </div>
                <div className={styles.weekStatus}>
                  {week.confirmed ? (
                    <span className={`${styles.statusBadge} ${styles.confirmed}`}>
                      <svg fill="currentColor" viewBox="0 0 20 20" style={{ width: '0.875rem', height: '0.875rem' }}>
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Confirmed
                    </span>
                  ) : (
                    <span className={`${styles.statusBadge} ${styles.pending}`}>
                      <svg fill="currentColor" viewBox="0 0 20 20" style={{ width: '0.875rem', height: '0.875rem' }}>
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      Pending
                    </span>
                  )}
                </div>
              </div>

              {/* Hours Grid */}
              <div className={styles.hoursGrid}>
                <div className={styles.hourItem}>
                  <span className={styles.hourLabel}>Scheduled</span>
                  <span className={styles.hourValue}>{formatMinutes(week.scheduledMinutes)}</span>
                </div>
                <div className={styles.hourItem}>
                  <span className={styles.hourLabel}>Basic</span>
                  <span className={styles.hourValue}>{formatMinutes(effectiveValues.basicMinutes)}</span>
                </div>
                <div className={styles.hourItem}>
                  <span className={styles.hourLabel}>Overtime</span>
                  <span className={styles.hourValue}>{formatMinutes(effectiveValues.overtimeMinutes)}</span>
                </div>
                <div className={styles.hourItem}>
                  <span className={styles.hourLabel}>Banked</span>
                  <span className={styles.hourValue}>{formatMinutes(effectiveValues.bankedMinutes)}</span>
                </div>
              </div>

              {/* Edit Panel - Slides up when editing */}
              {isEditing && (
                <div className={styles.editPanel}>
                  <div className={styles.editHeader}>
                    <h4>Edit Hours</h4>
                    <p>Adjust your basic hours - overtime and banked hours are calculated automatically</p>
                  </div>
                  
                  <div className={styles.editControls}>
                    <div className={styles.hourSpinner}>
                      <label>Basic Hours</label>
                      <div className={styles.spinnerContainer}>
                        <button
                          className={styles.spinnerButton}
                          onClick={() => {
                            const currentMinutes = effectiveValues.basicMinutes;
                            const newMinutes = Math.max(0, currentMinutes + 15);
                            const { basic, overtime, banked } = calculateOvertimeAndBanked(newMinutes, settings);
                            updateManualOverride(week.weekStartISO, 'basicMinutes', basic);
                            updateManualOverride(week.weekStartISO, 'overtimeMinutes', overtime);
                            updateManualOverride(week.weekStartISO, 'bankedMinutes', banked);
                          }}
                        >
                          ▲
                        </button>
                        <span className={styles.spinnerValue}>
                          {Math.floor(effectiveValues.basicMinutes / 60)}h {effectiveValues.basicMinutes % 60}m
                        </span>
                        <button
                          className={styles.spinnerButton}
                          onClick={() => {
                            const currentMinutes = effectiveValues.basicMinutes;
                            const newMinutes = Math.max(0, currentMinutes - 15);
                            const { basic, overtime, banked } = calculateOvertimeAndBanked(newMinutes, settings);
                            updateManualOverride(week.weekStartISO, 'basicMinutes', basic);
                            updateManualOverride(week.weekStartISO, 'overtimeMinutes', overtime);
                            updateManualOverride(week.weekStartISO, 'bankedMinutes', banked);
                          }}
                        >
                          ▼
                        </button>
                      </div>
                    </div>
                    
                    <div className={styles.calculatedValues}>
                      <div className={styles.calculatedItem}>
                        <span>Overtime:</span>
                        <span>{formatMinutes(effectiveValues.overtimeMinutes)}</span>
                      </div>
                      <div className={styles.calculatedItem}>
                        <span>Banked:</span>
                        <span>{formatMinutes(effectiveValues.bankedMinutes)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className={styles.editActions}>
                    <Button 
                      variant="primary" 
                      onClick={() => week.confirmed ? handleUpdateWeek(week) : handleConfirmWeek(week)}
                      disabled={isConfirming || isUpdating}
                    >
                      {isConfirming || isUpdating ? (
                        <>
                          <LogoSpinner size="sm" style={{ marginRight: 'var(--space-xs)' }} />
                          Saving...
                        </>
                      ) : (
                        <>
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '1rem', height: '1rem', marginRight: 'var(--space-xs)' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Save
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="secondary" 
                      onClick={() => {
                        setEditingWeek(null);
                        setManualOverrides(prev => {
                          const newOverrides = { ...prev };
                          delete newOverrides[week.weekStartISO];
                          return newOverrides;
                        });
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {!isEditing && (
                <div className={styles.cardActions}>
                  {!week.confirmed && (
                    <Button 
                      variant="primary" 
                      onClick={() => handleConfirmWeek(week)}
                      disabled={isConfirming}
                      className={styles.confirmButton}
                    >
                      {isConfirming ? (
                        <>
                          <LogoSpinner size="sm" style={{ marginRight: 'var(--space-xs)' }} />
                          Confirming...
                        </>
                      ) : (
                        <>
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '1rem', height: '1rem', marginRight: 'var(--space-xs)' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Confirm Week
                        </>
                      )}
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    onClick={() => setEditingWeek(week.weekStartISO)}
                    className={styles.editButton}
                  >
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '1rem', height: '1rem' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </Button>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Instructions */}
      <Card padding="md" elevation="sm" style={{ marginTop: 'var(--space-lg)' }}>
        <div className={styles.instructions}>
          <div className={styles.instructionsIcon}>
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h3>How to use this summary</h3>
            <div className={styles.instructionsList}>
              <p>• Tap "Confirm Week" to confirm completed weeks with scheduled hours</p>
              <p>• Tap "Edit" to modify actual hours worked if they differ from scheduled</p>
              <p>• Use the up/down arrows to adjust basic hours in 15-minute increments</p>
              <p>• Overtime and banked hours are calculated automatically based on your settings</p>
              <p>• Confirmed weeks will be included in your dashboard totals</p>
            </div>
          </div>
        </div>
      </Card>
    </main>
  );
}
