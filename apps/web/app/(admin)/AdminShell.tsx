'use client';

import type { ReactNode } from 'react';
import { useState } from 'react';

import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export const AdminShell = ({ children }: { children: ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-page">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-[280px]">
        <Topbar onMenuToggle={() => setSidebarOpen((current) => !current)} />
        <main className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
          <div className="page-shell mx-auto max-w-[1580px] space-y-5">{children}</div>
        </main>
      </div>
    </div>
  );
};
