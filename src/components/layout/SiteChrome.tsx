'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from '@/src/components/layout/Navbar';
import Footer from '@/src/components/layout/Footer';

export default function SiteChrome({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthRoute = pathname.startsWith('/auth');
  const isHome = pathname === '/' ||  pathname.startsWith('/product') || pathname.startsWith('/category');
  const isGrayBackgroundRoute =
    pathname.startsWith('/profile') ||
    pathname.startsWith('/my-ads') ||
    pathname.startsWith('/product') ||
    pathname.startsWith('/product') ||

    pathname.startsWith('/seller');

  if (isAuthRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar
        variant={isHome ? 'glass' : 'solid'}
        showSearch={isHome}
        showCategoryDropdown={isHome}
      />
      <main
        className={[
          'min-h-screen',
          isGrayBackgroundRoute ? 'bg-gray-50' : 'bg-white',
        ].join(' ')}
      >
        {children}
      </main>
      <Footer />
    </>
  );
}
