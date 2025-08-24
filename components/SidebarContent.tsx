"use client";

import { Button } from "@/components/ui/Button";

export default function SidebarContent() {
  return (
    <div style={{ padding: 'var(--space-md)' }}>
      <h3 style={{ marginBottom: 'var(--space-md)' }}>Quick Actions</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
        <Button variant="primary" onClick={() => window.location.href = '/summary'}>
          View Summary
        </Button>
        <Button variant="secondary" onClick={() => window.location.href = '/dashboard'}>
          Dashboard
        </Button>
        <Button variant="secondary" onClick={() => window.location.href = '/settings'}>
          Settings
        </Button>
      </div>
    </div>
  );
}
