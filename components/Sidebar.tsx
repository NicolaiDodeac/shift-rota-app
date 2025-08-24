"use client";

import { useUIStore } from "@/lib/stores/uiStore";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import styles from "./Sidebar.module.css";

interface SidebarProps {
  children: React.ReactNode;
}

export default function Sidebar({ children }: SidebarProps) {
  const { sidebarOpen, setSidebarOpen } = useUIStore();

  if (!sidebarOpen) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className={styles.backdrop}
        onClick={() => setSidebarOpen(false)}
      />
      
      {/* Sidebar */}
      <div className={styles.sidebar}>
        <Card padding="lg" elevation="md" style={{ height: '100%' }}>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            height: '100%',
            gap: 'var(--space-md)'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center' 
            }}>
              <h2 style={{ margin: 0 }}>Quick Actions</h2>
              <Button 
                variant="secondary" 
                onClick={() => setSidebarOpen(false)}
                style={{ padding: 'var(--space-xs)' }}
              >
                ✕
              </Button>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {children}
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}

// Sidebar Toggle Button
export function SidebarToggle() {
  const { sidebarOpen, toggleSidebar } = useUIStore();

  return (
    <Button
      variant="secondary"
      onClick={toggleSidebar}
      style={{ 
        position: 'fixed',
        top: 'var(--space-md)',
        left: 'var(--space-md)',
        zIndex: 1000,
        padding: 'var(--space-sm)',
        borderRadius: '50%',
        width: '3rem',
        height: '3rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
    >
      {sidebarOpen ? '✕' : '☰'}
    </Button>
  );
}
