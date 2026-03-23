import { Role } from '@zatch/shared';

export type NavItem = {
  section: 'MAIN' | 'MANAGEMENT';
  title: string;
  href: string;
  description: string;
  icon: 'dashboard' | 'sellers' | 'audit' | 'users';
  roles?: Role[];
};

export const navConfig: NavItem[] = [
  {
    section: 'MAIN',
    title: 'Dashboard',
    href: '/dashboard',
    description: 'Overview of seller onboarding activity.',
    icon: 'dashboard',
  },
  {
    section: 'MAIN',
    title: 'Seller Boarding',
    href: '/sellers',
    description: 'Review and action seller applications.',
    icon: 'sellers',
  },
  {
    section: 'MANAGEMENT',
    title: 'Audit Log',
    href: '/audit',
    description: 'Complete action history across modules.',
    icon: 'audit',
  },
  {
    section: 'MANAGEMENT',
    title: 'Admin Users',
    href: '/admin-users',
    description: 'Manage internal admin access.',
    icon: 'users',
    roles: [Role.SUPER_ADMIN],
  },
];
