"use client";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import LoaderOverlay from "@/components/LoaderOverlay";
import LogoSpinner from "@/components/LogoSpinner";

type WeekRow = {
  weekStartISO: string;
  scheduledMinutes: number;
  basicMinutes: number;
  overtimeMinutes: number;
  bankedMinutes: number;
  confirmed?: boolean;
  // New fields for manual override
  actualBasicMinutes?: number;
  actualOvertimeMinutes?: number;
  actualBankedMinutes?: number;
  isManualOverride?: boolean;
};

type Settings = {
  basicHoursCap: number;
  overtimeMultiplier: number;
};

export default function SummaryPage() {
  const [data, setData] = useState<{ tz: string; weeks: WeekRow[] } | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editingWeek, setEditingWeek] = useState<string | null>(null);
  const [manualOverrides, setManualOverrides] = useState<{
    [weekStartISO: string]: {
      basicMinutes: number;
      overtimeMinutes: number;
      bankedMinutes: number;
    };
  }>({});

  const fetchData = async () => {
      try {
        setIsLoading(true);
        setErr(null);
        
        // Fetch summary data
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
        
        // Fetch settings for calculations
        const settingsRes = await fetch("/api/settings");
        if (settingsRes.ok) {
          const settingsData = await settingsRes.json();
          setSettings({
            basicHoursCap: settingsData.basicHoursCap,
            overtimeMultiplier: settingsData.overtimeMultiplier,
          });
        }
      } catch (e: any) {
        setErr(e.message || String(e));
      } finally {
        setIsLoading(false);
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
      
      // Use manual override values if they exist, otherwise use calculated values
      const manualOverride = manualOverrides[week.weekStartISO];
      const basicMinutes = manualOverride ? manualOverride.basicMinutes : week.basicMinutes;
      const overtimeMinutes = manualOverride ? manualOverride.overtimeMinutes : week.overtimeMinutes;
      const bankedMinutes = manualOverride ? manualOverride.bankedMinutes : week.bankedMinutes;
      
      const res = await fetch("/api/summary/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weekStartISO: week.weekStartISO,
          weekEndISO: weekEnd.toISOString(),
          scheduledMinutes: week.scheduledMinutes,
          basicMinutes: basicMinutes,
          overtimeMinutes: overtimeMinutes,
          bankedMinutes: bankedMinutes,
          isManualOverride: !!manualOverride,
        }),
      });
      
      if (!res.ok) {
        const error = await res.text();
        throw new Error(error);
      }
      
      // Clear manual override after successful confirmation
      if (manualOverride) {
        setManualOverrides(prev => {
          const newOverrides = { ...prev };
          delete newOverrides[week.weekStartISO];
          return newOverrides;
        });
      }
      
      // Exit edit mode
      setEditingWeek(null);
      
      // Refresh data after confirmation
      await fetchData();
    } catch (e: any) {
      setErr(e.message || String(e));
    } finally {
      setLoading(prev => ({ ...prev, [week.weekStartISO]: false }));
    }
  };

  const updateWeek = async (week: WeekRow) => {
    setLoading(prev => ({ ...prev, [week.weekStartISO]: true }));
    try {
      // Calculate week end date (7 days after start)
      const weekStart = new Date(week.weekStartISO);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);
      
      // Use manual override values if they exist, otherwise use calculated values
      const manualOverride = manualOverrides[week.weekStartISO];
      const basicMinutes = manualOverride ? manualOverride.basicMinutes : week.basicMinutes;
      const overtimeMinutes = manualOverride ? manualOverride.overtimeMinutes : week.overtimeMinutes;
      const bankedMinutes = manualOverride ? manualOverride.bankedMinutes : week.bankedMinutes;
      
      const res = await fetch("/api/summary/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weekStartISO: week.weekStartISO,
          weekEndISO: weekEnd.toISOString(),
          scheduledMinutes: week.scheduledMinutes,
          basicMinutes: basicMinutes,
          overtimeMinutes: overtimeMinutes,
          bankedMinutes: bankedMinutes,
          isManualOverride: !!manualOverride,
        }),
      });
      
      if (!res.ok) {
        const error = await res.text();
        throw new Error(error);
      }
      
      // Clear manual override after successful update
      if (manualOverride) {
        setManualOverrides(prev => {
          const newOverrides = { ...prev };
          delete newOverrides[week.weekStartISO];
          return newOverrides;
        });
      }
      
      // Exit edit mode
      setEditingWeek(null);
      
      // Refresh data after update
      await fetchData();
    } catch (e: any) {
      setErr(e.message || String(e));
    } finally {
      setLoading(prev => ({ ...prev, [week.weekStartISO]: false }));
    }
  };

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

  const formatMinutesForInput = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}:${mins.toString().padStart(2, '0')}`;
  };

  const parseMinutesFromInput = (input: string) => {
    if (!input || input === '') return 0;
    const parts = input.split(':');
    if (parts.length !== 2) return 0;
    
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    
    if (isNaN(hours) || isNaN(minutes)) return 0;
    if (minutes < 0 || minutes > 59) return 0;
    
    return (hours * 60) + minutes;
  };

  const calculateOvertimeAndBanked = (basicMinutes: number, settings: any) => {
    const basicHoursCap = settings?.basicHoursCap || 48;
    const overtimeMultiplier = settings?.overtimeMultiplier || 1.5;
    
    // Remove the 48-hour limit - allow any amount of basic hours
    const basic = basicMinutes; // No longer capped at 48 hours
    const over = Math.max(0, basicMinutes - (basicHoursCap * 60));
    const overtime = Math.round(over * overtimeMultiplier);
    const banked = basic + overtime;
    
    return { basic, overtime, banked };
  };

  if (isLoading) {
    return (
      <main className="container">
        <LoaderOverlay 
          title="Loading Summary"
          subtitle="Please wait while we fetch your data..."
          size="lg"
          variant="inline"
        />
      </main>
    );
  }

  if (err)
    return (
      <main className="container">
        <Card padding="lg" elevation="md">
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ color: 'var(--color-error)' }}>Summary Error</h1>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-md)' }}>{err}</p>
            <Button variant="primary" onClick={() => {
              setErr(null);
              fetchData();
            }}>
              Retry
            </Button>
          </div>
        </Card>
      </main>
    );

  if (!data)
    return (
      <main className="container">
        <LoaderOverlay 
          title="Loading Summary"
          subtitle="Please wait while we fetch your data..."
          size="lg"
          variant="inline"
        />
      </main>
    );

  return (
    <main className="container">
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        marginBottom: 'var(--space-lg)',
        flexWrap: 'wrap',
        gap: 'var(--space-md)'
      }}>
        <div>
          <h1>Weekly Summary</h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>Timezone: {data.tz}</p>
        </div>
        <Button 
          variant="secondary" 
          onClick={() => {
            setRefreshing(true);
            fetchData().finally(() => setRefreshing(false));
          }}
          disabled={refreshing}
        >
          {refreshing ? (
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
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', margin: 0 }}>Total Scheduled</p>
              <p style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, margin: 0 }}>
                {formatMinutes(data.weeks.reduce((sum, w) => sum + w.scheduledMinutes, 0))}
              </p>
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
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', margin: 0 }}>Confirmed Weeks</p>
              <p style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, margin: 0 }}>
                {data.weeks.filter(w => w.confirmed).length} / {data.weeks.length}
              </p>
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
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', margin: 0 }}>Total Overtime</p>
              <p style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, margin: 0 }}>
                {formatMinutes(data.weeks.reduce((sum, w) => sum + w.overtimeMinutes, 0))}
              </p>
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
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', margin: 0 }}>Total Banked</p>
              <p style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, margin: 0 }}>
                {formatMinutes(data.weeks.reduce((sum, w) => sum + w.bankedMinutes, 0))}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Weeks Table */}
      <Card padding="lg" elevation="md">
        <div style={{ marginBottom: 'var(--space-lg)' }}>
          <h2 style={{ marginBottom: 'var(--space-sm)' }}>Weekly Breakdown</h2>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            Click to confirm completed weeks. You can edit actual hours worked if they differ from scheduled.
          </p>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: 'var(--font-size-sm)'
          }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <th style={{ textAlign: 'left', padding: 'var(--space-sm)', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Week Starting</th>
                <th style={{ textAlign: 'left', padding: 'var(--space-sm)', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Scheduled</th>
                <th style={{ textAlign: 'left', padding: 'var(--space-sm)', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Basic (Actual)</th>
                <th style={{ textAlign: 'left', padding: 'var(--space-sm)', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Overtime (Actual)</th>
                <th style={{ textAlign: 'left', padding: 'var(--space-sm)', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Banked (Actual)</th>
                <th style={{ textAlign: 'left', padding: 'var(--space-sm)', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Status</th>
                <th style={{ textAlign: 'left', padding: 'var(--space-sm)', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.weeks.map((week, index) => {
                const effectiveValues = getEffectiveValues(week);
                const manualOverride = manualOverrides[week.weekStartISO];
                const isEditing = editingWeek === week.weekStartISO;
                
                return (
                  <tr key={week.weekStartISO} style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                    <td style={{ padding: 'var(--space-sm)' }}>
                      <div>
                        <div style={{ fontWeight: 500 }}>{formatDate(week.weekStartISO)}</div>
                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>Week {index + 1}</div>
                        {manualOverride && (
                          <div style={{ 
                            fontSize: 'var(--font-size-xs)', 
                            color: 'var(--magna-orange)', 
                            fontWeight: 500 
                          }}>
                            Manual Override
                          </div>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: 'var(--space-sm)' }}>
                      {formatMinutes(week.scheduledMinutes)}
                    </td>
                    <td style={{ padding: 'var(--space-sm)' }}>
                      {isEditing ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}>
                          <span style={{ fontWeight: 500 }}>
                            {Math.floor(effectiveValues.basicMinutes / 60)}h {effectiveValues.basicMinutes % 60}m
                          </span>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <button
                              onClick={() => {
                                const currentMinutes = effectiveValues.basicMinutes;
                                const newMinutes = Math.max(0, currentMinutes + 15);
                                const { basic, overtime, banked } = calculateOvertimeAndBanked(newMinutes, settings);
                                updateManualOverride(week.weekStartISO, 'basicMinutes', basic);
                                updateManualOverride(week.weekStartISO, 'overtimeMinutes', overtime);
                                updateManualOverride(week.weekStartISO, 'bankedMinutes', banked);
                              }}
                              style={{
                                width: '1.5rem',
                                height: '1.5rem',
                                border: '1px solid var(--color-border)',
                                borderRadius: 'var(--radius-sm)',
                                backgroundColor: 'var(--color-surface)',
                                color: 'var(--color-text)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 'var(--font-size-xs)'
                              }}
                              title="Add 15 minutes"
                            >
                              ▲
                            </button>
                            <button
                              onClick={() => {
                                const currentMinutes = effectiveValues.basicMinutes;
                                const newMinutes = Math.max(0, currentMinutes - 15);
                                const { basic, overtime, banked } = calculateOvertimeAndBanked(newMinutes, settings);
                                updateManualOverride(week.weekStartISO, 'basicMinutes', basic);
                                updateManualOverride(week.weekStartISO, 'overtimeMinutes', overtime);
                                updateManualOverride(week.weekStartISO, 'bankedMinutes', banked);
                              }}
                              style={{
                                width: '1.5rem',
                                height: '1.5rem',
                                border: '1px solid var(--color-border)',
                                borderRadius: 'var(--radius-sm)',
                                backgroundColor: 'var(--color-surface)',
                                color: 'var(--color-text)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 'var(--font-size-xs)'
                              }}
                              title="Subtract 15 minutes"
                            >
                              ▼
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div style={{ fontWeight: 500 }}>
                            {formatMinutes(effectiveValues.basicMinutes)}
                          </div>
                          {manualOverride && (
                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                              (was {formatMinutes(week.basicMinutes)})
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: 'var(--space-sm)' }}>
                      <div>
                        <div style={{ fontWeight: 500 }}>
                          {formatMinutes(effectiveValues.overtimeMinutes)}
                        </div>
                        {isEditing && (
                          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                            Auto-calculated
                          </div>
                        )}
                        {manualOverride && !isEditing && (
                          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                            (was {formatMinutes(week.overtimeMinutes)})
                          </div>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: 'var(--space-sm)' }}>
                      <div>
                        <div style={{ fontWeight: 500 }}>
                          {formatMinutes(effectiveValues.bankedMinutes)}
                        </div>
                        {isEditing && (
                          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                            Auto-calculated
                          </div>
                        )}
                        {manualOverride && !isEditing && (
                          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                            (was {formatMinutes(week.bankedMinutes)})
                          </div>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: 'var(--space-sm)' }}>
                      {week.confirmed ? (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 'var(--space-xs)',
                          padding: 'var(--space-xs) var(--space-sm)',
                          backgroundColor: 'var(--color-success)',
                          color: 'white',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: 'var(--font-size-xs)',
                          fontWeight: 500
                        }}>
                          <svg fill="currentColor" viewBox="0 0 20 20" style={{ width: '0.875rem', height: '0.875rem' }}>
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Confirmed
                        </span>
                      ) : (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 'var(--space-xs)',
                          padding: 'var(--space-xs) var(--space-sm)',
                          backgroundColor: 'var(--color-warning)',
                          color: 'white',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: 'var(--font-size-xs)',
                          fontWeight: 500
                        }}>
                          <svg fill="currentColor" viewBox="0 0 20 20" style={{ width: '0.875rem', height: '0.875rem' }}>
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                          Pending
                        </span>
                      )}
                    </td>
                    <td style={{ padding: 'var(--space-sm)' }}>
                      {isEditing ? (
                        <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
                          <Button 
                            variant="primary" 
                            size="sm"
                            onClick={() => week.confirmed ? updateWeek(week) : confirmWeek(week)}
                            disabled={loading[week.weekStartISO]}
                          >
                            {loading[week.weekStartISO] ? (
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
                            size="sm"
                            onClick={() => {
                              setEditingWeek(null);
                              // Clear manual overrides when canceling
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
                      ) : (
                        <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setEditingWeek(week.weekStartISO)}
                          >
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '1rem', height: '1rem' }}>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </Button>
                          {!week.confirmed && (
                            <Button 
                              variant="primary" 
                              size="sm"
                              onClick={() => confirmWeek(week)}
                              disabled={loading[week.weekStartISO]}
                            >
                              {loading[week.weekStartISO] ? (
                                <>
                                  <LogoSpinner size="sm" style={{ marginRight: 'var(--space-xs)' }} />
                                  Confirming...
                                </>
                              ) : (
                                <>
                                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '1rem', height: '1rem', marginRight: 'var(--space-xs)' }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  Confirm
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Instructions */}
      <Card padding="md" elevation="sm" style={{ marginTop: 'var(--space-lg)' }}>
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
              How to use this summary
            </h3>
            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
              <p style={{ margin: '0 0 var(--space-xs) 0' }}>• Click "Edit" to modify actual hours worked if they differ from scheduled</p>
              <p style={{ margin: '0 0 var(--space-xs) 0' }}>• Use the arrow buttons (+/- 15 min) to adjust your basic hours - overtime and banked hours are calculated automatically</p>
              <p style={{ margin: '0 0 var(--space-xs) 0' }}>• Click "Save" to confirm your changes</p>
              <p style={{ margin: '0 0 var(--space-xs) 0' }}>• Confirmed weeks will be included in your dashboard totals</p>
              <p style={{ margin: 0 }}>• You can refresh the data anytime using the refresh button</p>
            </div>
          </div>
        </div>
      </Card>
    </main>
  );
}
