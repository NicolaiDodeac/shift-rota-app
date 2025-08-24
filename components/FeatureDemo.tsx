"use client";

import { useUIStore } from "@/lib/stores/uiStore";
import { usePrefetch } from "@/lib/hooks/usePrefetch";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function FeatureDemo() {
  const { 
    sidebarOpen, 
    toggleSidebar, 
    selectedWeek, 
    setSelectedWeek,
    theme,
    setTheme 
  } = useUIStore();
  
  const { prefetchAll } = usePrefetch();

  return (
    <Card padding="lg" elevation="md">
      <h2 style={{ marginBottom: 'var(--space-lg)' }}>🚀 New Features Demo</h2>
      
      <div style={{ display: 'grid', gap: 'var(--space-md)' }}>
        {/* Zustand State Management */}
        <div>
          <h3>Zustand State Management</h3>
          <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
            <Button 
              variant="secondary" 
              onClick={toggleSidebar}
            >
              {sidebarOpen ? 'Close' : 'Open'} Sidebar
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => setSelectedWeek(selectedWeek ? null : '2024-01-01')}
            >
              {selectedWeek ? 'Clear' : 'Set'} Selected Week
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            >
              Toggle Theme ({theme})
            </Button>
          </div>
          <small style={{ color: 'var(--color-text-secondary)' }}>
            Current state: Sidebar {sidebarOpen ? 'open' : 'closed'}, 
            Week: {selectedWeek || 'none'}, 
            Theme: {theme}
          </small>
        </div>

        {/* Prefetching */}
        <div>
          <h3>Prefetching</h3>
          <Button 
            variant="primary" 
            onClick={prefetchAll}
          >
            Prefetch All Data
          </Button>
          <small style={{ color: 'var(--color-text-secondary)', display: 'block', marginTop: 'var(--space-xs)' }}>
            Hover over navigation links to see prefetching in action
          </small>
        </div>

        {/* Error Boundary Test */}
        <div>
          <h3>Error Boundary</h3>
          <Button 
            variant="secondary" 
            onClick={() => {
              throw new Error('Test error for error boundary!');
            }}
          >
            Test Error Boundary
          </Button>
          <small style={{ color: 'var(--color-text-secondary)', display: 'block', marginTop: 'var(--space-xs)' }}>
            Click to test error handling (will show error boundary)
          </small>
        </div>

        {/* Optimistic Updates */}
        <div>
          <h3>Optimistic Updates</h3>
          <small style={{ color: 'var(--color-text-secondary)' }}>
            Try confirming or updating a week in the Summary page - you'll see instant UI updates!
          </small>
        </div>
      </div>
    </Card>
  );
}
