'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { AuditIcon, DashboardIcon, LogoutIcon, SellersIcon, UsersIcon } from '../../components/Icons';
import { getInitials } from '../../lib/format';
import { navConfig } from '../../lib/nav-config';
import { useSession } from '../../lib/hooks/useSession';

const iconMap = {
  dashboard: DashboardIcon,
  sellers: SellersIcon,
  audit: AuditIcon,
  users: UsersIcon,
};

type SidebarProps = {
  open: boolean;
  onClose: () => void;
};

export const Sidebar = ({ open, onClose }: SidebarProps) => {
  const pathname = usePathname();
  const { user, logout } = useSession();
  const visibleItems = navConfig.filter((item) => !item.roles || item.roles.includes(user.role));
  const sections = ['MAIN', 'MANAGEMENT'] as const;

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-slate-900/40 transition-opacity lg:hidden ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col bg-sidebar text-[var(--sidebar-text)] shadow-xl transition-transform lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="border-b border-white/10 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg bg-white/10">
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
              <div className="text-base font-semibold text-white">Internal Operations Portal</div>
            </div>
          </div>
        </div>

        <div className="scrollbar-thin flex-1 overflow-y-auto px-3 py-4">
          {sections.map((section) => {
            const items = visibleItems.filter((item) => item.section === section);
            if (items.length === 0) {
              return null;
            }

            return (
              <div key={section} className="mb-6">
                <div className="px-3 pb-2 text-[11px] font-medium uppercase tracking-[0.08em] text-slate-400">
                  {section}
                </div>
                <nav className="space-y-1">
                  {items.map((item) => {
                    const Icon = iconMap[item.icon];
                    const active =
                      pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={onClose}
                        className={`group flex h-11 items-center gap-3 rounded-lg border-l-4 px-3 text-sm transition-colors ${
                          active
                            ? 'border-[var(--sidebar-accent)] bg-[var(--sidebar-active-bg)] text-[var(--sidebar-active)]'
                            : 'border-transparent hover:bg-[var(--sidebar-hover-bg)] hover:text-white'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>
            );
          })}
        </div>

        <div className="border-t border-white/10 px-4 py-4">
          <div className="flex items-center gap-3 rounded-lg bg-white/5 p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/20 text-sm font-semibold text-white">
              {getInitials(user.name)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-white">Admin</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void logout()}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
          >
            <LogoutIcon className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};
