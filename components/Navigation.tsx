"use client";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const { status } = useSession();
  const pathname = usePathname();

  if (status !== "authenticated") {
    return null;
  }

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/summary", label: "Summary" },
    { href: "/settings", label: "Settings" },
  ];

  return (
    <nav style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%'
    }}>
      <ul style={{
        display: 'flex',
        listStyle: 'none',
        margin: 0,
        padding: 0,
        gap: 'var(--space-sm)',
        flexWrap: 'wrap',
        justifyContent: 'center',
        width: '100%'
      }}>
        {navItems.map((item) => (
          <li key={item.href} style={{ margin: 0 }}>
            <Link
              href={item.href}
              style={{
                color: pathname === item.href ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                textDecoration: 'none',
                fontWeight: 500,
                padding: 'var(--space-xs) var(--space-sm)',
                borderRadius: 'var(--radius-md)',
                transition: 'all var(--transition-fast)',
                backgroundColor: pathname === item.href ? 'rgba(255, 107, 53, 0.1)' : 'transparent',
                display: 'block',
                textAlign: 'center',
                minWidth: 'fit-content'
              }}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
