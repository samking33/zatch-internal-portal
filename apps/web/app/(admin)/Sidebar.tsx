'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  DashboardIcon,
  LogoutIcon,
  OrdersIcon,
  ProductsIcon,
  SellersIcon,
  UsersIcon,
  WalletIcon,
} from '../../components/Icons';
import { canManageAdmins, formatAdminRole } from '../../lib/admin-api';
import { getInitials } from '../../lib/format';
import { getActiveNavItem, navConfig } from '../../lib/nav-config';
import { useSession } from '../../lib/hooks/useSession';

const iconMap = {
  dashboard: DashboardIcon,
  sellers: SellersIcon,
  products: ProductsIcon,
  orders: OrdersIcon,
  settlements: WalletIcon,
  users: UsersIcon,
};

type SidebarProps = {
  open: boolean;
  onClose: () => void;
};

export const Sidebar = ({ open, onClose }: SidebarProps) => {
  const pathname = usePathname();
  const { user, logout } = useSession();
  const visibleItems = navConfig.filter((item) => !item.requiresSuperAdmin || canManageAdmins(user));
  const currentItem = getActiveNavItem(pathname, visibleItems);
  const accessLabel = formatAdminRole(user.role);

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-slate-900/40 transition-opacity lg:hidden ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col bg-sidebar text-[var(--sidebar-text)] shadow-xl transition-transform lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="border-b border-white/10 px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-card border border-white/10 bg-white/10">
              <Image
                src="/zatch-logo.png"
                alt="Zatch logo"
                width={40}
                height={40}
                className="h-10 w-10 object-cover"
                priority
              />
            </div>
            <div>
              <div className="mt-1 text-base font-semibold text-white">Zatch Admin Portal</div>
            </div>
          </div>
        </div>

        <div className="scrollbar-thin flex-1 overflow-y-auto px-3 py-5">
          <nav className="space-y-1">
            {visibleItems.map((item) => {
              const Icon = iconMap[item.icon];
              const active = currentItem?.href === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`group flex min-h-[52px] items-center gap-3 rounded-card border border-transparent px-3 text-sm transition ${
                    active
                      ? 'border-transparent bg-[var(--sidebar-active-bg)] text-[var(--sidebar-active)]'
                      : 'hover:border-white/5 hover:bg-[var(--sidebar-hover-bg)] hover:text-white'
                  }`}
                >
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-md ${
                      active ? 'bg-white/15 text-white' : 'bg-white/5 text-white/90'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 font-medium">
                      {item.title}
                      {item.systemLayer ? (
                        <span className="rounded-full border border-white/15 bg-white/10 px-2 py-0.5 text-[9px] uppercase tracking-[0.12em] text-white/85">
                          System
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-1 truncate text-xs text-white/72">{item.description}</div>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-white/10 px-4 py-4">
          <div className="rounded-card border border-white/10 bg-white/5 p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/20 text-sm font-semibold text-white">
                {getInitials(user.username)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-white">{user.username}</div>
                <div className="mt-1 truncate text-xs text-white/82">{accessLabel}</div>
              </div>
            </div>
            <div className="mt-3 rounded-card border border-white/10 bg-black/10 px-3 py-2 text-xs text-white/78">
              {user.email || [user.countryCode, user.phone].filter(Boolean).join(' ') || 'Admin session'}
            </div>
          </div>
          <button
            type="button"
            onClick={() => void logout()}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-card border border-white/10 px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
          >
            <LogoutIcon className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};
