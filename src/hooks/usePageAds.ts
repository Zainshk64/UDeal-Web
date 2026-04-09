"use client";

import { useEffect, useState } from "react";
import {
  AdPageKey,
  PageAds,
  getAdsForPage,
  hasAdsCacheResolved,
  peekAdsForPageIfReady,
} from "@/src/api/services/AppAdsApi";

const emptyAds: PageAds = {
  top: null,
  center: null,
  bottom: null,
  popup: null,
};

export function usePageAds(pageKey: AdPageKey) {
  const [ads, setAds] = useState<PageAds>(() => {
    const cached = peekAdsForPageIfReady(pageKey);
    return cached || emptyAds;
  });
  const [loading, setLoading] = useState<boolean>(() => !hasAdsCacheResolved());

  useEffect(() => {
    let active = true;

    const load = async () => {
      const next = await getAdsForPage(pageKey);
      if (!active) return;
      setAds(next);
      setLoading(false);
    };

    void load();
    return () => {
      active = false;
    };
  }, [pageKey]);

  return { ads, loading };
}
