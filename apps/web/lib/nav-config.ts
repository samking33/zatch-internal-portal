export type NavItem = {
  section: 'OVERVIEW' | 'OPERATIONS' | 'ADMINISTRATION';
  tone: 'overview' | 'operations' | 'administration';
  title: string;
  href: string;
  description: string;
  context: string;
  icon: 'dashboard' | 'sellers' | 'products' | 'orders' | 'settlements' | 'users';
  requiresSuperAdmin?: boolean;
  systemLayer?: boolean;
  primaryAction?: {
    label: string;
    href: string;
  };
};

export const navConfig: NavItem[] = [
  {
    section: 'OVERVIEW',
    tone: 'overview',
    title: 'Dashboard',
    href: '/dashboard',
    description: 'Operational overview across sellers, orders, products, and payouts.',
    context: 'Monitor queues, exceptions, and the latest operational movement from a single workspace.',
    icon: 'dashboard',
    primaryAction: {
      label: 'Review pending sellers',
      href: '/sellers?status=pending',
    },
  },
  {
    section: 'OPERATIONS',
    tone: 'operations',
    title: 'Sellers',
    href: '/sellers',
    description: 'Review and manage seller accounts.',
    icon: 'sellers',
    context: 'Prioritize onboarding decisions, KYC review, and seller activation without leaving the queue.',
    primaryAction: {
      label: 'Open pending queue',
      href: '/sellers?status=pending',
    },
  },
  {
    section: 'OPERATIONS',
    tone: 'operations',
    title: 'Products',
    href: '/products',
    description: 'Moderate and activate product listings.',
    icon: 'products',
    context: 'Keep catalog quality high with fast status controls and cleaner stock-level review.',
    primaryAction: {
      label: 'See active catalog',
      href: '/products?status=active',
    },
  },
  {
    section: 'OPERATIONS',
    tone: 'operations',
    title: 'Orders',
    href: '/orders',
    description: 'Track orders, payment status, and fulfillment progress.',
    icon: 'orders',
    context: 'Watch fulfillment flow, payment movement, and date-filtered order exceptions in one ledger.',
    primaryAction: {
      label: 'View order ledger',
      href: '/orders',
    },
  },
  {
    section: 'OPERATIONS',
    tone: 'operations',
    title: 'Order Insights',
    href: '/orders/insights',
    description: 'View today, month, and year order stats.',
    icon: 'orders',
    context: 'Compare recent order performance windows and drill into the sellers driving commercial movement.',
    primaryAction: {
      label: 'Open month stats',
      href: '/orders/insights?timeRange=month',
    },
  },
  {
    section: 'OPERATIONS',
    tone: 'operations',
    title: 'Settlements',
    href: '/settlements',
    description: 'Approve, hold, and monitor seller payouts.',
    icon: 'settlements',
    context: 'Move payouts through approval with visibility into holds, releases, and commission performance.',
    primaryAction: {
      label: 'Pending payouts',
      href: '/settlements?status=pending',
    },
  },
  {
    section: 'OPERATIONS',
    tone: 'operations',
    title: 'Settlement Overview',
    href: '/settlements/overview',
    description: 'Review the base settlement posture and held items.',
    icon: 'settlements',
    context: 'See pending and held payout posture from the settlement overview route before moving into queue actions.',
    primaryAction: {
      label: 'Open settlement posture',
      href: '/settlements/overview',
    },
  },
  {
    section: 'ADMINISTRATION',
    tone: 'administration',
    title: 'Admins',
    href: '/admins',
    description: 'Create and manage admin access.',
    icon: 'users',
    requiresSuperAdmin: true,
    systemLayer: true,
    context: 'Provision operational admins and protect system-level access from the same shared shell.',
    primaryAction: {
      label: 'Manage admin access',
      href: '/admins',
    },
  },
];

export const matchesNavPath = (pathname: string, href: string): boolean =>
  pathname === href || (href !== '/dashboard' && pathname.startsWith(`${href}/`));

export const getActiveNavItem = (
  pathname: string,
  items: NavItem[] = navConfig,
): NavItem | undefined =>
  [...items]
    .filter((item) => matchesNavPath(pathname, item.href))
    .sort((left, right) => right.href.length - left.href.length)[0];
