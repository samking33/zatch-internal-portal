import type { ReactNode } from 'react';

import { MoreHorizontalIcon } from './Icons';

type OverflowMenuProps = {
  align?: 'left' | 'right';
  children: ReactNode;
};

export const OverflowMenu = ({ align = 'right', children }: OverflowMenuProps) => (
  <details className="menu-disclosure group relative">
    <summary className="btn-icon h-8 w-8 border-none bg-transparent text-secondary shadow-none hover:bg-[var(--surface-muted)]">
      <MoreHorizontalIcon className="h-4 w-4" />
    </summary>
    <div
      className={`menu-panel top-[calc(100%+0.45rem)] ${align === 'right' ? 'right-0' : 'left-0'} w-56`}
    >
      <div className="flex flex-col gap-1">{children}</div>
    </div>
  </details>
);
