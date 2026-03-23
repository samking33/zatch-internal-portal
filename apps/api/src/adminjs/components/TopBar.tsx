import React, { useMemo } from 'react';

type TopBarProps = {
  toggleSidebar?: () => void;
};

type ReduxSession = {
  email?: string;
};

type ReduxState = {
  session?: ReduxSession | null;
};

type AdminWindow = Window & {
  REDUX_STATE?: ReduxState;
};

const getPageTitle = (pathname: string): string => {
  if (pathname === '/admin' || pathname === '/admin/') {
    return 'Dashboard';
  }

  if (pathname.includes('/pages/home')) {
    return 'Home';
  }

  if (pathname.includes('/pages/seller-map')) {
    return 'Seller Map';
  }

  if (pathname.includes('/pages/seller-analytics')) {
    return 'Analytics';
  }

  if (pathname.includes('/pages/audit-timeline')) {
    return 'Audit Timeline';
  }

  if (pathname.includes('/resources/AuditLog')) {
    return 'Audit Logs';
  }

  if (pathname.includes('/resources/AdminUser')) {
    return 'Admin Users';
  }

  return 'Admin';
};

const getPageSubtitle = (pathname: string): string => {
  if (pathname === '/admin' || pathname === '/admin/') {
    return 'Zatch Admin overview';
  }

  if (pathname.includes('/show')) {
    return 'Record detail';
  }

  if (pathname.includes('/edit')) {
    return 'Edit view';
  }

  if (pathname.includes('/new')) {
    return 'Create new record';
  }

  return pathname.replace('/admin', '') || 'Admin';
};

const TopBar = ({ toggleSidebar }: TopBarProps) => {
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '/admin';
  const session = typeof window !== 'undefined' ? (window as AdminWindow).REDUX_STATE?.session : null;

  const title = useMemo(() => getPageTitle(pathname), [pathname]);
  const subtitle = useMemo(() => getPageSubtitle(pathname), [pathname]);

  return (
    <header
      style={{
        height: 56,
        background: '#ffffff',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        position: 'sticky',
        top: 0,
        zIndex: 30,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
        <button
          type="button"
          onClick={() => toggleSidebar?.()}
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            border: '1px solid #e5e7eb',
            background: '#ffffff',
            color: '#6b7280',
            cursor: 'pointer',
          }}
          aria-label="Toggle navigation"
        >
          ☰
        </button>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#1f2937' }}>{title}</div>
          <div
            style={{
              fontSize: 12,
              color: '#9ca3af',
              marginTop: 2,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {subtitle}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#1f2937' }}>
            {session?.email ?? 'Admin'}
          </div>
          <div style={{ fontSize: 12, color: '#9ca3af' }}>super admin</div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
