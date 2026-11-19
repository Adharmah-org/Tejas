import React, { useEffect, useState } from 'react';
import { SiteHeader } from './SiteHeader';
import { SiteFooter } from './SiteFooter';
import { SearchOverlay } from './SearchOverlay';

interface LayoutShellProps {
  children: React.ReactNode;
  hideChrome?: boolean;
}

export function LayoutShell({ children, hideChrome = false }: LayoutShellProps) {
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <div className="nocturnal-backdrop relative flex min-h-[100dvh] w-full max-w-full flex-col overflow-x-clip text-[#F3EFE6]">
      <div
        aria-hidden="true"
        className="starfield-layer pointer-events-none fixed inset-0 z-0 opacity-50"
      />
      {!hideChrome && <SiteHeader onOpenSearch={() => setSearchOpen(true)} />}
      <main className="relative z-10 min-w-0 w-full flex-1">{children}</main>
      {!hideChrome && <SiteFooter />}
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
