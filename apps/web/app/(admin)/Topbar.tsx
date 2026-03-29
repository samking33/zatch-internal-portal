'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { BellIcon, MenuIcon } from '../../components/Icons';
import { canManageAdmins } from '../../lib/admin-api';
import { useSession } from '../../lib/hooks/useSession';
import { getActiveNavItem, navConfig } from '../../lib/nav-config';

export const Topbar = ({ onMenuToggle }: { onMenuToggle: () => void }) => {
  const pathname = usePathname();
  const { user } = useSession();
  const visibleItems = navConfig.filter((item) => !item.requiresSuperAdmin || canManageAdmins(user));
  const currentItem = getActiveNavItem(pathname, visibleItems);

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--topbar-border)] bg-[var(--topbar-bg)]">
      <div className="flex min-h-[78px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button type="button" className="btn-icon lg:hidden" onClick={onMenuToggle} aria-label="Open navigation">
            <MenuIcon className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <div className="truncate text-lg font-semibold tracking-[-0.02em] text-primary">
              {currentItem?.title ?? 'Admin Portal'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {currentItem?.primaryAction ? (
            <Link href={currentItem.primaryAction.href} className="btn-ghost hidden px-4 md:inline-flex">
              {currentItem.primaryAction.label}
            </Link>
          ) : null}
          <button type="button" className="btn-icon" aria-label="Notifications">
            <BellIcon className="h-4 w-4" />
          </button>
          <div className="hidden text-right sm:block">
            <div className="text-sm font-semibold text-primary">{user.username}</div>
            <div className="mt-1 text-xs text-secondary">
              {user.phone ? `+${user.countryCode.replace('+', '')} ${user.phone}` : ''}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
