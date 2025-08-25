import { Card } from "@/components/ui/Card";
import s from "../app/page.module.css";
import type { ShiftEvent } from "@/lib/generator";

interface ShiftPreviewProps {
  events: ShiftEvent[];
}

export function ShiftPreview({ events }: ShiftPreviewProps) {
  return (
    <Card padding="lg" elevation="md">
      <h3 className={s.previewTitle}>
        Preview ({events.length} shifts)
      </h3>
      <div style={{ overflowX: 'auto' }}>
        <table className={s.previewTable}>
          <thead>
            <tr>
              <th className={s.tableHeader}>Start (local)</th>
              <th className={s.tableHeader}>End (local)</th>
              <th className={s.tableHeader}>Type</th>
              <th className={s.tableHeader}>Title</th>
            </tr>
          </thead>
          <tbody>
            {events.slice(0, 100).map((ev) => (
              <tr key={ev.id}>
                <td className={s.tableCell}>
                  {new Date(ev.localStart).toLocaleString()}
                </td>
                <td className={s.tableCell}>
                  {new Date(ev.localEnd).toLocaleString()}
                </td>
                <td className={s.tableCell}>
                  {ev.type}
                </td>
                <td className={s.tableCell}>
                  {ev.title}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {events.length > 100 && (
        <p className={s.previewNote}>
          Showing first 100…
        </p>
      )}
    </Card>
  );
}
