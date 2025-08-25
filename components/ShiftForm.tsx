import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import s from "../app/page.module.css";
import type { ShiftConfig } from "@/lib/generator";

interface ShiftFormProps {
  cfg: ShiftConfig;
  setCfg: (cfg: ShiftConfig) => void;
  useDedicated: boolean;
  setUseDedicated: (use: boolean) => void;
  dedicatedName: string;
  setDedicatedName: (name: string) => void;
  dedicatedColorId: string;
  setDedicatedColorId: (id: string) => void;
  isPushing: boolean;
  onPush: () => void;
  onDelete: () => void;
  qs: string;
}

export function ShiftForm({
  cfg,
  setCfg,
  useDedicated,
  setUseDedicated,
  dedicatedName,
  setDedicatedName,
  dedicatedColorId,
  setDedicatedColorId,
  isPushing,
  onPush,
  onDelete,
  qs,
}: ShiftFormProps) {
  return (
    <Card padding="lg" elevation="md">
      <div className={s.formGrid}>
        <div className={s.formField}>
          <label className={s.label}>Timezone</label>
          <input
            type="text"
            value={cfg.timezone}
            onChange={(e) => setCfg({ ...cfg, timezone: e.target.value })}
            className={s.input}
          />
        </div>
        <div className={s.formField}>
          <label className={s.label}>Season Start</label>
          <input
            type="date"
            value={cfg.rangeStart}
            onChange={(e) => setCfg({ ...cfg, rangeStart: e.target.value })}
            className={s.input}
          />
        </div>
        <div className={s.formField}>
          <label className={s.label}>Season End</label>
          <input
            type="date"
            value={cfg.rangeEnd}
            onChange={(e) => setCfg({ ...cfg, rangeEnd: e.target.value })}
            className={s.input}
          />
        </div>
        <div className={s.formField}>
          <label className={s.label}>Anchor ON Day (first of a 4-on block)</label>
          <input
            type="date"
            value={cfg.anchorOnDate}
            onChange={(e) => setCfg({ ...cfg, anchorOnDate: e.target.value })}
            className={s.input}
          />
        </div>
        <div className={s.formField}>
          <label className={s.label}>Rotation starts as</label>
          <select
            value={cfg.startMode}
            onChange={(e) => setCfg({ ...cfg, startMode: e.target.value as any })}
            className={s.select}
          >
            <option value="day">Day</option>
            <option value="night">Night</option>
          </select>
        </div>
        <div className={s.formField}>
          <label className={s.label}>Rotation rule</label>
          <select
            value={cfg.rotationMode ?? "twoBlock"}
            onChange={(e) => setCfg({ ...cfg, rotationMode: e.target.value as any })}
            className={s.select}
          >
            <option value="twoBlock">2× 4-on → flip (recommended)</option>
            <option value="fortnight">Flip every N weeks</option>
          </select>
        </div>
        <div className={s.formField}>
          <label className={s.label}>Day shift starts</label>
          <input
            type="time"
            value={cfg.dayStart}
            onChange={(e) => setCfg({ ...cfg, dayStart: e.target.value })}
            className={s.input}
          />
        </div>
        <div className={s.formField}>
          <label className={s.label}>Night shift starts</label>
          <input
            type="time"
            value={cfg.nightStart}
            onChange={(e) => setCfg({ ...cfg, nightStart: e.target.value })}
            className={s.input}
          />
        </div>
        <div className={s.formField}>
          <label className={s.label}>Hours per shift</label>
          <input
            type="number"
            min={1}
            value={cfg.hoursPerShift}
            onChange={(e) => setCfg({ ...cfg, hoursPerShift: Number(e.target.value) })}
            className={s.numberInput}
          />
        </div>
        <div className={s.formField}>
          <label className={s.label}>Day title</label>
          <input
            type="text"
            value={cfg.dayTitle}
            onChange={(e) => setCfg({ ...cfg, dayTitle: e.target.value })}
            className={s.input}
          />
        </div>
        <div className={s.formField}>
          <label className={s.label}>Night title</label>
          <input
            type="text"
            value={cfg.nightTitle}
            onChange={(e) => setCfg({ ...cfg, nightTitle: e.target.value })}
            className={s.input}
          />
        </div>
        <div className={s.formField}>
          <label className={s.label}>Location</label>
          <input
            type="text"
            value={cfg.location}
            onChange={(e) => setCfg({ ...cfg, location: e.target.value })}
            className={s.input}
          />
        </div>
      </div>

      <div className={s.optionsSection}>
        <div className={s.optionsGrid}>
          <label className={s.checkboxLabel}>
            <input
              type="checkbox"
              checked={cfg.lockTypePerCluster ?? true}
              onChange={(e) => setCfg({ ...cfg, lockTypePerCluster: e.target.checked })}
              className={s.checkbox}
            />
            Lock Day/Night per 4-on (recommended)
          </label>

          <label className={s.checkboxLabel}>
            <input
              type="checkbox"
              checked={useDedicated}
              onChange={(e) => setUseDedicated(e.target.checked)}
              className={s.checkbox}
            />
            Use dedicated "Shift Rota" calendar
          </label>

          {useDedicated && (
            <>
              <div className={s.dedicatedField}>
                <span className={s.dedicatedLabel}>Calendar name</span>
                <input
                  type="text"
                  value={dedicatedName}
                  onChange={(e) => setDedicatedName(e.target.value)}
                  className={s.dedicatedInput}
                />
              </div>
              <div className={s.dedicatedField}>
                <span className={s.dedicatedLabel}>Color ID</span>
                <input
                  type="number"
                  value={dedicatedColorId}
                  onChange={(e) => setDedicatedColorId(e.target.value)}
                  className={s.dedicatedInput}
                />
              </div>
            </>
          )}
        </div>
      </div>

      <div className={s.actionButtons}>
        <Button variant="primary" onClick={onPush} disabled={isPushing}>
          {isPushing ? "Syncing…" : "Add to Google Calendar"}
        </Button>

        <Button variant="secondary" asChild disabled={isPushing}>
          <a href={`/api/ics?${qs}`} rel="noreferrer" target="_blank">
            Get ICS feed (subscribe)
          </a>
        </Button>

        <Button variant="secondary" onClick={onDelete} disabled={isPushing}>
          {isPushing ? "Working…" : "Delete season (Google)"}
        </Button>
      </div>
    </Card>
  );
}
