"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { signIn } from "next-auth/react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

type Settings = {
  tz: string;
  contractYearStart: string;
  employmentStart: string;
  contractedWeeklyHours: number;
  contractedAnnualHours: number;
  hoursPerShift: number;
  daysPerWeek: number;
  basicHoursCap: number;
  overtimeMultiplier: number;
  holidayWeeksFirstYear: number;
  holidayWeeksSubsequent: number;
  bankHolidayHours: number;
  serviceLengthWeeks: number;
  useFirstYearRates: boolean;
};

export default function SettingsPage() {
  const { status } = useSession();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (status === "authenticated") {
      fetchSettings();
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [status]);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!settings) return;
    
    setSaving(true);
    setMessage(null);
    
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      
      if (res.ok) {
        setMessage({ type: 'success', text: 'Settings saved successfully!' });
      } else {
        const error = await res.text();
        setMessage({ type: 'error', text: `Failed to save: ${error}` });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error while saving' });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof Settings, value: string | number | boolean) => {
    if (!settings) return;
    setSettings({ ...settings, [field]: value });
  };

  const calculateTargetHours = () => {
    if (!settings) return { firstYear: 1920, subsequent: 1878 };
    
    const weeklyHours = settings.contractedWeeklyHours;
    const firstYearHoliday = weeklyHours * settings.holidayWeeksFirstYear;
    const subsequentHoliday = weeklyHours * settings.holidayWeeksSubsequent;
    
    const firstYear = Math.round((weeklyHours * 52) - firstYearHoliday - settings.bankHolidayHours);
    const subsequent = Math.round((weeklyHours * 52) - subsequentHoliday - settings.bankHolidayHours);
    
    return { firstYear, subsequent };
  };

  if (status === "unauthenticated") {
    return (
      <main className="container">
        <Card padding="lg" elevation="md">
          <div style={{ textAlign: 'center' }}>
            <h1>Settings</h1>
            <p style={{ marginBottom: 'var(--space-md)' }}>Please sign in to access your settings.</p>
            <Button variant="primary" onClick={() => signIn("google", { callbackUrl: window.location.href })}>
              Sign in with Google
            </Button>
          </div>
        </Card>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="container">
        <Card padding="lg" elevation="md">
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '3rem',
              height: '3rem',
              border: '2px solid transparent',
              borderTop: '2px solid var(--magna-orange)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 1rem auto'
            }}></div>
            <p>Loading settings...</p>
          </div>
        </Card>
      </main>
    );
  }

  if (!settings) {
    return (
      <main className="container">
        <Card padding="lg" elevation="md">
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ color: 'var(--color-error)' }}>Settings Error</h1>
            <p style={{ color: 'var(--color-text-secondary)' }}>Unable to load settings. Please try refreshing the page.</p>
          </div>
        </Card>
      </main>
    );
  }

  const targetHours = calculateTargetHours();

  return (
    <main className="container">
      <div style={{ marginBottom: 'var(--space-lg)' }}>
        <h1>Settings</h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>Configure your shift rota preferences and contract details</p>
      </div>

      {message && (
        <Card padding="md" elevation="sm" style={{ 
          marginBottom: 'var(--space-lg)',
          backgroundColor: message.type === 'success' ? 'var(--color-success)' : 'var(--color-error)',
          color: 'white'
        }}>
          {message.text}
        </Card>
      )}

      <div style={{ display: 'grid', gap: 'var(--space-lg)' }}>
        {/* Contract Settings */}
        <Card padding="lg" elevation="md">
          <h2 style={{ marginBottom: 'var(--space-lg)' }}>Contract Settings</h2>
          <div style={{ 
            display: 'grid', 
            gap: 'var(--space-md)',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))'
          }}>
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--space-xs)', fontWeight: 500 }}>Contract Year Start</label>
              <input
                type="date"
                value={settings.contractYearStart.split('T')[0]}
                onChange={(e) => handleInputChange('contractYearStart', e.target.value + 'T00:00:00.000Z')}
                style={{
                  width: '100%',
                  padding: 'var(--space-sm)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text)',
                  fontSize: 'var(--font-size-sm)'
                }}
              />
              <small style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-xs)' }}>When does your contract year begin?</small>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 'var(--space-xs)', fontWeight: 500 }}>Employment Start</label>
              <input
                type="date"
                value={settings.employmentStart.split('T')[0]}
                onChange={(e) => handleInputChange('employmentStart', e.target.value + 'T00:00:00.000Z')}
                style={{
                  width: '100%',
                  padding: 'var(--space-sm)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text)',
                  fontSize: 'var(--font-size-sm)'
                }}
              />
              <small style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-xs)' }}>When did you start employment?</small>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 'var(--space-xs)', fontWeight: 500 }}>Weekly Contracted Hours</label>
              <input
                type="number"
                min="1"
                max="168"
                value={settings.contractedWeeklyHours}
                onChange={(e) => handleInputChange('contractedWeeklyHours', Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: 'var(--space-sm)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text)',
                  fontSize: 'var(--font-size-sm)'
                }}
              />
              <small style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-xs)' }}>Your weekly contracted hours (default: 42)</small>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 'var(--space-xs)', fontWeight: 500 }}>Timezone</label>
              <select
                value={settings.tz}
                onChange={(e) => handleInputChange('tz', e.target.value)}
                style={{
                  width: '100%',
                  padding: 'var(--space-sm)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text)',
                  fontSize: 'var(--font-size-sm)'
                }}
              >
                <option value="Europe/London">Europe/London</option>
                <option value="Europe/Paris">Europe/Paris</option>
                <option value="America/New_York">America/New_York</option>
                <option value="America/Los_Angeles">America/Los_Angeles</option>
                <option value="Asia/Tokyo">Asia/Tokyo</option>
                <option value="Australia/Sydney">Australia/Sydney</option>
              </select>
              <small style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-xs)' }}>Your local timezone</small>
            </div>
          </div>
        </Card>

        {/* Shift Settings */}
        <Card padding="lg" elevation="md">
          <h2 style={{ marginBottom: 'var(--space-lg)' }}>Shift Settings</h2>
          <div style={{ 
            display: 'grid', 
            gap: 'var(--space-md)',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))'
          }}>
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--space-xs)', fontWeight: 500 }}>Hours Per Shift</label>
              <input
                type="number"
                min="1"
                max="24"
                step="0.5"
                value={settings.hoursPerShift}
                onChange={(e) => handleInputChange('hoursPerShift', Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: 'var(--space-sm)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text)',
                  fontSize: 'var(--font-size-sm)'
                }}
              />
              <small style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-xs)' }}>Standard duration of each shift</small>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 'var(--space-xs)', fontWeight: 500 }}>Days Per Week</label>
              <input
                type="number"
                min="1"
                max="7"
                value={settings.daysPerWeek}
                onChange={(e) => handleInputChange('daysPerWeek', Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: 'var(--space-sm)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text)',
                  fontSize: 'var(--font-size-sm)'
                }}
              />
              <small style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-xs)' }}>Number of working days per week</small>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 'var(--space-xs)', fontWeight: 500 }}>Basic Hours Cap</label>
              <input
                type="number"
                min="1"
                max="168"
                value={settings.basicHoursCap}
                onChange={(e) => handleInputChange('basicHoursCap', Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: 'var(--space-sm)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text)',
                  fontSize: 'var(--font-size-sm)'
                }}
              />
              <small style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-xs)' }}>Hours before overtime kicks in (per week)</small>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 'var(--space-xs)', fontWeight: 500 }}>Overtime Multiplier</label>
              <input
                type="number"
                min="1"
                max="3"
                step="0.1"
                value={settings.overtimeMultiplier}
                onChange={(e) => handleInputChange('overtimeMultiplier', Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: 'var(--space-sm)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text)',
                  fontSize: 'var(--font-size-sm)'
                }}
              />
              <small style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-xs)' }}>Overtime rate multiplier (e.g., 1.5 = time and a half)</small>
            </div>
          </div>
        </Card>

        {/* Holiday Settings */}
        <Card padding="lg" elevation="md">
          <h2 style={{ marginBottom: 'var(--space-lg)' }}>Holiday Settings</h2>
          <div style={{ 
            display: 'grid', 
            gap: 'var(--space-md)',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))'
          }}>
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--space-xs)', fontWeight: 500 }}>First Year Holiday Weeks</label>
              <input
                type="number"
                min="0"
                max="52"
                step="0.1"
                value={settings.holidayWeeksFirstYear}
                onChange={(e) => handleInputChange('holidayWeeksFirstYear', Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: 'var(--space-sm)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text)',
                  fontSize: 'var(--font-size-sm)'
                }}
              />
              <small style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-xs)' }}>Holiday entitlement in first year (default: 5.6 weeks)</small>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 'var(--space-xs)', fontWeight: 500 }}>Subsequent Years Holiday Weeks</label>
              <input
                type="number"
                min="0"
                max="52"
                step="0.1"
                value={settings.holidayWeeksSubsequent}
                onChange={(e) => handleInputChange('holidayWeeksSubsequent', Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: 'var(--space-sm)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text)',
                  fontSize: 'var(--font-size-sm)'
                }}
              />
              <small style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-xs)' }}>Holiday entitlement after 52 weeks (default: 7.29 weeks)</small>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 'var(--space-xs)', fontWeight: 500 }}>Bank Holiday Hours</label>
              <input
                type="number"
                min="0"
                max="8760"
                value={settings.bankHolidayHours}
                onChange={(e) => handleInputChange('bankHolidayHours', Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: 'var(--space-sm)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text)',
                  fontSize: 'var(--font-size-sm)'
                }}
              />
              <small style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-xs)' }}>Total bank holiday hours per year (default: 96)</small>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 'var(--space-xs)', fontWeight: 500 }}>Service Length (Weeks)</label>
              <input
                type="number"
                min="0"
                max="520"
                value={settings.serviceLengthWeeks}
                onChange={(e) => handleInputChange('serviceLengthWeeks', Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: 'var(--space-sm)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text)',
                  fontSize: 'var(--font-size-sm)'
                }}
              />
              <small style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-xs)' }}>Your current weeks of service</small>
            </div>
          </div>
        </Card>

        {/* Calculation Settings */}
        <Card padding="lg" elevation="md">
          <h2 style={{ marginBottom: 'var(--space-lg)' }}>Calculation Settings</h2>
          <div style={{ 
            display: 'grid', 
            gap: 'var(--space-md)',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))'
          }}>
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--space-xs)', fontWeight: 500 }}>Use First Year Rates</label>
              <select
                value={settings.useFirstYearRates ? 'true' : 'false'}
                onChange={(e) => handleInputChange('useFirstYearRates', e.target.value === 'true')}
                style={{
                  width: '100%',
                  padding: 'var(--space-sm)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text)',
                  fontSize: 'var(--font-size-sm)'
                }}
              >
                <option value="true">Yes - Use first year calculations</option>
                <option value="false">No - Use subsequent year calculations</option>
              </select>
              <small style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-xs)' }}>Choose which holiday rate to use for calculations</small>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 'var(--space-xs)', fontWeight: 500 }}>Manual Annual Hours Override</label>
              <input
                type="number"
                min="1"
                max="8760"
                value={settings.contractedAnnualHours}
                onChange={(e) => handleInputChange('contractedAnnualHours', Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: 'var(--space-sm)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text)',
                  fontSize: 'var(--font-size-sm)'
                }}
              />
              <small style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-xs)' }}>Override calculated annual hours (optional)</small>
            </div>
          </div>

          {/* Target Hours Display */}
          <div style={{ marginTop: 'var(--space-lg)' }}>
            <h3 style={{ marginBottom: 'var(--space-md)' }}>Calculated Target Hours</h3>
            <div style={{ 
              display: 'grid', 
              gap: 'var(--space-md)',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))'
            }}>
              <Card padding="md" elevation="sm">
                <h4 style={{ marginBottom: 'var(--space-sm)' }}>First Year</h4>
                <p style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--magna-orange)', margin: '0 0 var(--space-xs) 0' }}>
                  {targetHours.firstYear}h
                </p>
                <small style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-xs)' }}>
                  Based on {settings.holidayWeeksFirstYear} weeks holiday
                </small>
              </Card>
              <Card padding="md" elevation="sm">
                <h4 style={{ marginBottom: 'var(--space-sm)' }}>Subsequent Years</h4>
                <p style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--magna-orange)', margin: '0 0 var(--space-xs) 0' }}>
                  {targetHours.subsequent}h
                </p>
                <small style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-xs)' }}>
                  Based on {settings.holidayWeeksSubsequent} weeks holiday
                </small>
              </Card>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
          <Button variant="primary" onClick={saveSettings} disabled={saving}>
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
          
          <Button variant="secondary" onClick={fetchSettings} disabled={saving}>
            Reset to Saved
          </Button>
        </div>
      </div>
    </main>
  );
}
