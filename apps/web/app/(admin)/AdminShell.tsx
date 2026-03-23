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
      <div className="lg:pl-[260px]">
        <Topbar onMenuToggle={() => setSidebarOpen((current) => !current)} />
        <main className="px-4 py-4 sm:px-6 sm:py-6">
          <div className="mx-auto max-w-[1600px]">{children}</div>
        </main>
      </div>
    </div>
  );
};
