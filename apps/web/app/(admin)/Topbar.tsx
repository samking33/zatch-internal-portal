'use client';

import { usePathname } from 'next/navigation';

import { BellIcon, MenuIcon } from '../../components/Icons';
import { useSession } from '../../lib/hooks/useSession';
import { navConfig } from '../../lib/nav-config';

const toLabel = (value: string) =>
  value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

export const Topbar = ({ onMenuToggle }: { onMenuToggle: () => void }) => {
  const pathname = usePathname();
  useSession();
  const currentItem = navConfig.find((item) => pathname === item.href || pathname.startsWith(item.href));
  const segments = pathname.split('/').filter(Boolean);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[var(--topbar-border)] bg-[var(--topbar-bg)] px-4 shadow-sm sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button type="button" className="btn-icon lg:hidden" onClick={onMenuToggle} aria-label="Open navigation">
          <MenuIcon className="h-5 w-5" />
        </button>
        <div className="min-w-0">
          <div className="truncate text-sm font-medium text-primary">
            {currentItem?.title ?? 'Admin Portal'}
          </div>
          <div className="truncate text-xs text-muted">
            {segments.length === 0
              ? 'Dashboard'
              : segments.map((segment) => toLabel(segment)).join(' / ')}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button type="button" className="btn-icon" aria-label="Notifications">
          <BellIcon className="h-4 w-4" />
        </button>
        <div className="text-sm font-medium text-primary">Admin</div>
      </div>
    </header>
  );
};
