"use client";

import { useEffect, useMemo, useRef, useState } from "react";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

export type GoogleAdSlotName =
  | "home"
  | "listings"
  | "category"
  | "buyer"
  | "city"
  | "sidebar";

const SLOT_BY_NAME: Record<GoogleAdSlotName, string | undefined> = {
  home:
    process.env.NEXT_PUBLIC_GOOGLE_ADS_SLOT_HOME ||
    "ca-app-pub-9986429269406301/2580107471",
  listings:
    process.env.NEXT_PUBLIC_GOOGLE_ADS_SLOT_LISTINGS ||
    "ca-app-pub-9986429269406301/4611923189",
  category:
    process.env.NEXT_PUBLIC_GOOGLE_ADS_SLOT_CATEGORY ||
    "ca-app-pub-9986429269406301/8520482255",
  buyer:
    process.env.NEXT_PUBLIC_GOOGLE_ADS_SLOT_BUYER ||
    "ca-app-pub-9986429269406301/6069510866",
  city:
    process.env.NEXT_PUBLIC_GOOGLE_ADS_SLOT_CITY ||
    "ca-app-pub-9986429269406301/4611923189",
  sidebar: process.env.NEXT_PUBLIC_GOOGLE_ADS_SLOT_SIDEBAR,
};

type GoogleAdSlotProps = {
  slot: GoogleAdSlotName;
  className?: string;
  format?: "auto" | "rectangle" | "horizontal" | "vertical";
  responsive?: boolean;
};

export default function GoogleAdSlot({
  slot,
  className = "",
  format = "auto",
  responsive = true,
}: GoogleAdSlotProps) {
  const adRef = useRef<HTMLModElement | null>(null);
  const [isFilled, setIsFilled] = useState(false);
  const rawSlot = useMemo(() => SLOT_BY_NAME[slot], [slot]);
  const slotId = useMemo(() => {
    if (!rawSlot) return undefined;
    if (rawSlot.includes("/")) return rawSlot.split("/")[1];
    return rawSlot;
  }, [rawSlot]);
  const derivedClientFromSlot = useMemo(() => {
    if (!rawSlot || !rawSlot.includes("/")) return undefined;
    return rawSlot.split("/")[0];
  }, [rawSlot]);
  const client =
    process.env.NEXT_PUBLIC_GOOGLE_ADS_CLIENT || derivedClientFromSlot;

  useEffect(() => {
    if (!client || !slotId || !adRef.current) return;

    const el = adRef.current;
    const updateFilledState = () => {
      const status = el.getAttribute("data-ad-status");
      const iframe = el.querySelector("iframe");
      setIsFilled(status === "filled" || Boolean(iframe));
    };

    updateFilledState();
    const observer = new MutationObserver(updateFilledState);
    observer.observe(el, { attributes: true, childList: true, subtree: true });

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // no-op: ad blockers / duplicate push safety
    }
    const timer = window.setTimeout(updateFilledState, 1800);
    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, [client, slotId]);

  if (!client || !slotId) return null;

  return (
    <div
      className={className}
      style={{ display: isFilled ? "block" : "none" }}
      aria-hidden={!isFilled}
    >
      <ins
        ref={adRef}
        className="adsbygoogle block"
        style={{ display: "block" }}
        data-ad-client={client}
        data-ad-slot={slotId}
        data-ad-format={format}
        data-full-width-responsive={responsive ? "true" : "false"}
      />
    </div>
  );
}
