import type { ReactNode } from 'react';

type IconProps = {
  className?: string;
};

const createIcon = (path: ReactNode) =>
  function Icon({ className = 'h-5 w-5' }: IconProps) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        {path}
      </svg>
    );
  };

export const MenuIcon = createIcon(
  <>
    <path d="M4 7h16" />
    <path d="M4 12h16" />
    <path d="M4 17h16" />
  </>,
);

export const BellIcon = createIcon(
  <>
    <path d="M15 17h5l-1.4-1.4a2 2 0 0 1-.6-1.4V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5" />
    <path d="M10 20a2 2 0 0 0 4 0" />
  </>,
);

export const DashboardIcon = createIcon(
  <>
    <path d="M4 13.5 12 5l8 8.5" />
    <path d="M6 11.5V20h12v-8.5" />
  </>,
);

export const SellersIcon = createIcon(
  <>
    <path d="M4 19h16" />
    <path d="M6 16V8l6-3 6 3v8" />
    <path d="M10 19v-5h4v5" />
  </>,
);

export const ProductsIcon = createIcon(
  <>
    <path d="M4 7.5 12 3l8 4.5" />
    <path d="M4 7.5V16.5L12 21l8-4.5V7.5" />
    <path d="M12 21v-9" />
    <path d="M20 7.5 12 12 4 7.5" />
  </>,
);

export const OrdersIcon = createIcon(
  <>
    <path d="M4 6h13l3 3v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6Z" />
    <path d="M14 6v4h6" />
    <path d="M8 13h8" />
    <path d="M8 17h5" />
  </>,
);

export const WalletIcon = createIcon(
  <>
    <path d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8Z" />
    <path d="M4 10h16" />
    <path d="M16 14h2" />
  </>,
);

export const AuditIcon = createIcon(
  <>
    <path d="M8 7h8" />
    <path d="M8 11h8" />
    <path d="M8 15h5" />
    <path d="M6 3h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
  </>,
);

export const UsersIcon = createIcon(
  <>
    <path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
    <circle cx="9.5" cy="7" r="3" />
    <path d="M20 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M14 4.1a3 3 0 0 1 0 5.8" />
  </>,
);

export const LogoutIcon = createIcon(
  <>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="M16 17l5-5-5-5" />
    <path d="M21 12H9" />
  </>,
);

export const SearchIcon = createIcon(
  <>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </>,
);

export const CalendarIcon = createIcon(
  <>
    <path d="M8 2v4" />
    <path d="M16 2v4" />
    <path d="M3 10h18" />
    <path d="M5 4h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
  </>,
);

export const FilterIcon = createIcon(
  <>
    <path d="M4 6h16" />
    <path d="M7 12h10" />
    <path d="M10 18h4" />
  </>,
);

export const PlusIcon = createIcon(
  <>
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </>,
);

export const CheckCircleIcon = createIcon(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="m9 12 2 2 4-4" />
  </>,
);

export const XCircleIcon = createIcon(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="m9 9 6 6" />
    <path d="m15 9-6 6" />
  </>,
);

export const CopyIcon = createIcon(
  <>
    <rect x="9" y="9" width="11" height="11" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </>,
);

export const ChevronLeftIcon = createIcon(<path d="m15 18-6-6 6-6" />);

export const ChevronRightIcon = createIcon(<path d="m9 18 6-6-6-6" />);

export const ChevronDownIcon = createIcon(<path d="m6 9 6 6 6-6" />);

export const MoreHorizontalIcon = createIcon(
  <>
    <circle cx="5" cy="12" r="1.5" />
    <circle cx="12" cy="12" r="1.5" />
    <circle cx="19" cy="12" r="1.5" />
  </>,
);

export const ArrowUpRightIcon = createIcon(
  <>
    <path d="M7 17 17 7" />
    <path d="M9 7h8v8" />
  </>,
);
