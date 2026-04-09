"use client";

import React, { useEffect } from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "@/src/components/layout/Navbar";
import Footer from "@/src/components/layout/Footer";
import { FloatingSiteWidgets } from "@/src/components/layout/FloatingSiteWidgets";
import { beginAdsPrefetch } from "@/src/api/services/AppAdsApi";

export default function SiteChrome({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  useEffect(() => {
    beginAdsPrefetch();
  }, []);
  const isAuthRoute = pathname.startsWith("/auth");
  const isHome =
    pathname === "/" ||
    pathname.startsWith("/product") ||
    pathname.startsWith("/category") ||
    pathname.startsWith("/city");
  const isGrayBackgroundRoute =
    pathname.startsWith("/profile") ||
    pathname.startsWith("/my-ads") ||
    pathname.startsWith("/product") ||
    pathname.startsWith("/favorites") ||
    pathname.startsWith("/buyers") ||
    pathname.startsWith("/seller") ||
    pathname.startsWith("/chat");

  if (isAuthRoute) {
    return <>{children}</>;
  }

  if (pathname.startsWith("/chat")) {
    return <main className="min-h-screen bg-[#0b141a]">{children}</main>;
  }

  return (
    <>
      <Navbar
        variant={isHome ? "glass" : "solid"}
        showSearch={isHome}
        showCategoryDropdown={isHome}
      />
      <main
        className={[
          "min-h-screen",
          isGrayBackgroundRoute ? "bg-gray-50" : "bg-white",
        ].join(" ")}
      >
        {children}
      </main>
      <Footer />
      <FloatingSiteWidgets />
    </>
  );
}
