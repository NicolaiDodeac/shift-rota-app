import React from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Hero } from '@/components/sections/Hero';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function StylePreviewPage() {
  return (
    <div className="container">
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 'var(--space-2xl)',
        padding: 'var(--space-lg) 0',
        borderBottom: '1px solid var(--color-border)'
      }}>
        <h1>Design System Preview</h1>
        <ThemeToggle />
      </div>

      {/* Hero Section */}
      <section style={{ marginBottom: 'var(--space-2xl)' }}>
        <h2 style={{ marginBottom: 'var(--space-lg)' }}>Hero Component</h2>
        <Hero 
          title="Welcome to Magna Design System" 
          subtitle="A mobile-first, modern design system with light and dark themes"
          highlightedWord="Magna"
        >
          <Button variant="primary" size="lg">Get Started</Button>
          <Button variant="secondary" size="lg">Learn More</Button>
        </Hero>
      </section>

      {/* Button Variants */}
      <section style={{ marginBottom: 'var(--space-2xl)' }}>
        <h2 style={{ marginBottom: 'var(--space-lg)' }}>Button Variants</h2>
        
        <div style={{ marginBottom: 'var(--space-lg)' }}>
          <h3 style={{ marginBottom: 'var(--space-md)' }}>Primary Buttons</h3>
          <div style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
            <Button variant="primary" size="sm">Small Primary</Button>
            <Button variant="primary" size="md">Medium Primary</Button>
            <Button variant="primary" size="lg">Large Primary</Button>
          </div>
        </div>

        <div style={{ marginBottom: 'var(--space-lg)' }}>
          <h3 style={{ marginBottom: 'var(--space-md)' }}>Secondary Buttons</h3>
          <div style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
            <Button variant="secondary" size="sm">Small Secondary</Button>
            <Button variant="secondary" size="md">Medium Secondary</Button>
            <Button variant="secondary" size="lg">Large Secondary</Button>
          </div>
        </div>

        <div style={{ marginBottom: 'var(--space-lg)' }}>
          <h3 style={{ marginBottom: 'var(--space-md)' }}>Ghost Buttons</h3>
          <div style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
            <Button variant="ghost" size="sm">Small Ghost</Button>
            <Button variant="ghost" size="md">Medium Ghost</Button>
            <Button variant="ghost" size="lg">Large Ghost</Button>
          </div>
        </div>

        <div style={{ marginBottom: 'var(--space-lg)' }}>
          <h3 style={{ marginBottom: 'var(--space-md)' }}>Disabled States</h3>
          <div style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
            <Button variant="primary" disabled>Disabled Primary</Button>
            <Button variant="secondary" disabled>Disabled Secondary</Button>
            <Button variant="ghost" disabled>Disabled Ghost</Button>
          </div>
        </div>
      </section>

      {/* Card Variants */}
      <section style={{ marginBottom: 'var(--space-2xl)' }}>
        <h2 style={{ marginBottom: 'var(--space-lg)' }}>Card Components</h2>
        
        <div style={{ display: 'grid', gap: 'var(--space-lg)', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
          <Card padding="sm" elevation="sm">
            <h3>Small Card</h3>
            <p>This is a small card with minimal padding and subtle elevation.</p>
            <Button variant="primary" size="sm">Action</Button>
          </Card>

          <Card padding="md" elevation="md">
            <h3>Medium Card</h3>
            <p>This is a medium card with standard padding and elevation. Perfect for most content.</p>
            <Button variant="secondary" size="sm">Action</Button>
          </Card>

          <Card padding="lg" elevation="lg">
            <h3>Large Card</h3>
            <p>This is a large card with generous padding and prominent elevation. Great for featured content.</p>
            <Button variant="ghost" size="sm">Action</Button>
          </Card>
        </div>
      </section>

      {/* Color Palette */}
      <section style={{ marginBottom: 'var(--space-2xl)' }}>
        <h2 style={{ marginBottom: 'var(--space-lg)' }}>Color Palette</h2>
        
        <div style={{ display: 'grid', gap: 'var(--space-md)', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <div style={{ 
            background: 'var(--magna-orange)', 
            color: 'white', 
            padding: 'var(--space-md)', 
            borderRadius: 'var(--radius-md)',
            textAlign: 'center'
          }}>
            <strong>Magna Orange</strong><br />
            #E8772E
          </div>
          
          <div style={{ 
            background: 'var(--amber-400)', 
            color: 'var(--ink-900)', 
            padding: 'var(--space-md)', 
            borderRadius: 'var(--radius-md)',
            textAlign: 'center'
          }}>
            <strong>Amber 400</strong><br />
            #FFB561
          </div>
          
          <div style={{ 
            background: 'var(--cocoa-600)', 
            color: 'white', 
            padding: 'var(--space-md)', 
            borderRadius: 'var(--radius-md)',
            textAlign: 'center'
          }}>
            <strong>Cocoa 600</strong><br />
            #6B3E24
          </div>
          
          <div style={{ 
            background: 'var(--gradient-brand)', 
            color: 'white', 
            padding: 'var(--space-md)', 
            borderRadius: 'var(--radius-md)',
            textAlign: 'center'
          }}>
            <strong>Brand Gradient</strong><br />
            Orange to Amber
          </div>
        </div>
      </section>

      {/* Typography */}
      <section style={{ marginBottom: 'var(--space-2xl)' }}>
        <h2 style={{ marginBottom: 'var(--space-lg)' }}>Typography</h2>
        
        <div style={{ marginBottom: 'var(--space-lg)' }}>
          <h1>Heading 1 - Montserrat 800</h1>
          <h2>Heading 2 - Montserrat 700</h2>
          <h3>Heading 3 - Montserrat 700</h3>
          <h4>Heading 4 - Montserrat 700</h4>
          <h5>Heading 5 - Montserrat 700</h5>
          <h6>Heading 6 - Montserrat 700</h6>
        </div>

        <div>
          <p style={{ fontSize: 'var(--font-size-lg)' }}>
            Large paragraph text - Inter 400. This demonstrates the body text styling with proper line height and spacing.
          </p>
          <p>
            Regular paragraph text - Inter 400. This is the standard body text size used throughout the application.
          </p>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
            Small secondary text - Inter 400. Used for captions, metadata, and less important information.
          </p>
        </div>
      </section>

      {/* Spacing & Layout */}
      <section style={{ marginBottom: 'var(--space-2xl)' }}>
        <h2 style={{ marginBottom: 'var(--space-lg)' }}>Spacing & Layout</h2>
        
        <div style={{ 
          display: 'grid', 
          gap: 'var(--space-md)', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' 
        }}>
          <div style={{ 
            background: 'var(--color-surface)', 
            border: '1px solid var(--color-border)', 
            padding: 'var(--space-xs)', 
            borderRadius: 'var(--radius-sm)',
            textAlign: 'center'
          }}>
            XS Space<br />
            0.25rem
          </div>
          
          <div style={{ 
            background: 'var(--color-surface)', 
            border: '1px solid var(--color-border)', 
            padding: 'var(--space-sm)', 
            borderRadius: 'var(--radius-sm)',
            textAlign: 'center'
          }}>
            SM Space<br />
            0.5rem
          </div>
          
          <div style={{ 
            background: 'var(--color-surface)', 
            border: '1px solid var(--color-border)', 
            padding: 'var(--space-md)', 
            borderRadius: 'var(--radius-sm)',
            textAlign: 'center'
          }}>
            MD Space<br />
            1rem
          </div>
          
          <div style={{ 
            background: 'var(--color-surface)', 
            border: '1px solid var(--color-border)', 
            padding: 'var(--space-lg)', 
            borderRadius: 'var(--radius-sm)',
            textAlign: 'center'
          }}>
            LG Space<br />
            1.5rem
          </div>
          
          <div style={{ 
            background: 'var(--color-surface)', 
            border: '1px solid var(--color-border)', 
            padding: 'var(--space-xl)', 
            borderRadius: 'var(--radius-sm)',
            textAlign: 'center'
          }}>
            XL Space<br />
            2rem
          </div>
          
          <div style={{ 
            background: 'var(--color-surface)', 
            border: '1px solid var(--color-border)', 
            padding: 'var(--space-2xl)', 
            borderRadius: 'var(--radius-sm)',
            textAlign: 'center'
          }}>
            2XL Space<br />
            3rem
          </div>
        </div>
      </section>
    </div>
  );
}
