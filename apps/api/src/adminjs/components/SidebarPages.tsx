import React from 'react';

type AdminPage = {
  name: string;
};

type SidebarPagesProps = {
  pages?: AdminPage[];
};

const linkBaseStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  minHeight: 40,
  borderRadius: 6,
  margin: '2px 8px',
  padding: '0 12px',
  color: '#c2cfd8',
  textDecoration: 'none',
  cursor: 'pointer',
  borderLeft: '3px solid transparent',
  fontSize: 14,
  fontWeight: 500,
};

const getPageLabel = (pageName: string): string => {
  if (pageName === 'seller-map') {
    return 'Seller Map';
  }

  if (pageName === 'seller-analytics') {
    return 'Seller Analytics';
  }

  if (pageName === 'audit-timeline') {
    return 'Audit Timeline';
  }

  return pageName
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

const HomeGlyph = () => (
  <span aria-hidden="true" style={{ width: 14, display: 'inline-flex', justifyContent: 'center' }}>
    ⌂
  </span>
);

const DotGlyph = () => (
  <span aria-hidden="true" style={{ width: 14, display: 'inline-flex', justifyContent: 'center' }}>
    •
  </span>
);

const NavItem = ({
  label,
  href,
  active,
  glyph,
}: {
  label: string;
  href: string;
  active: boolean;
  glyph: React.ReactNode;
}) => (
  <a
    href={href}
    style={{
      ...linkBaseStyle,
      background: active ? '#3c4f63' : 'transparent',
      color: active ? '#ffffff' : '#c2cfd8',
      borderLeftColor: active ? '#3b82f6' : 'transparent',
    }}
  >
    {glyph}
    <span>{label}</span>
  </a>
);

const SidebarPages = ({ pages }: SidebarPagesProps) => {
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '/admin';

  const extraPages = (pages ?? []).filter((page) => page.name !== 'home');

  return (
    <div style={{ marginTop: 16 }}>
      <div
        style={{
          padding: '0 20px 8px',
          color: '#9ca3af',
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}
      >
        Pages
      </div>

      <NavItem
        label="Home"
        href="/admin"
        active={pathname === '/admin' || pathname === '/admin/'}
        glyph={<HomeGlyph />}
      />

      {extraPages.map((page) => (
        <NavItem
          key={page.name}
          label={getPageLabel(page.name)}
          href={`/admin/pages/${page.name}`}
          active={pathname.includes(`/pages/${page.name}`)}
          glyph={<DotGlyph />}
        />
      ))}
    </div>
  );
};

export default SidebarPages;
