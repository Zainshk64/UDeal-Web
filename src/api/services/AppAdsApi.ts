import api from "./api";

export interface AppAd {
  AdId: number;
  AdTitle: string;
  AdImage: string;
  AdPosition: "Top" | "Centre" | "Bottom" | string;
  AdPlanName: string;
  AdLink: string;
  EntDate: string;
}

interface AdsResponse {
  Ads: AppAd[];
}

export type AdPageKey =
  | "Home Page"
  | "All Listings Page"
  | "Property For Sale Page"
  | "Property For Rent Page"
  | "Vehicles Page"
  | "Bikes Page"
  | "Mobiles Page";

export interface PageAds {
  top: AppAd | null;
  center: AppAd | null;
  bottom: AppAd | null;
  popup: AppAd | null;
}

let cachedAds: AppAd[] | null = null;
let fetchPromise: Promise<AppAd[]> | null = null;
let lastFetchTime = 0;
const CACHE_TTL = 5 * 60 * 1000;

export const getAllAds = async (): Promise<AppAd[]> => {
  const now = Date.now();

  if (cachedAds && now - lastFetchTime < CACHE_TTL) {
    return cachedAds;
  }

  if (fetchPromise) {
    return fetchPromise;
  }

  fetchPromise = (async () => {
    try {
      const response = await api.get<AdsResponse>("/Default/GetAds");
      cachedAds = response.data?.Ads || [];
      lastFetchTime = Date.now();
      return cachedAds;
    } catch (error) {
      console.error("Failed to fetch app ads", error);
      return cachedAds || [];
    } finally {
      fetchPromise = null;
    }
  })();

  return fetchPromise;
};

export const invalidateAdsCache = () => {
  cachedAds = null;
  fetchPromise = null;
  lastFetchTime = 0;
};

export function parseAdsForPage(pageKey: AdPageKey, allAds: AppAd[]): PageAds {
  const result: PageAds = {
    top: null,
    center: null,
    bottom: null,
    popup: null,
  };

  for (const ad of allAds) {
    const plan = ad.AdPlanName || "";
    if (!plan.startsWith(pageKey)) continue;

    if (plan === "Home Page Popup Ad") {
      result.popup = ad;
      continue;
    }

    if (plan.endsWith("Top Ad")) {
      result.top = ad;
    } else if (plan.endsWith("Center Ad")) {
      result.center = ad;
    } else if (plan.endsWith("Bottom Ad")) {
      result.bottom = ad;
    }
  }

  return result;
}

export function hasAdsCacheResolved(): boolean {
  return cachedAds !== null;
}

export function peekAdsForPageIfReady(pageKey: AdPageKey): PageAds | null {
  if (cachedAds === null) return null;
  return parseAdsForPage(pageKey, cachedAds);
}

export function beginAdsPrefetch(): void {
  void getAllAds();
}

export const getAdsForPage = async (pageKey: AdPageKey): Promise<PageAds> => {
  const allAds = await getAllAds();
  return parseAdsForPage(pageKey, allAds);
};

export const categoryIdToAdPageKey = (categoryId: number): AdPageKey | null => {
  const map: Record<number, AdPageKey> = {
    1: "Vehicles Page",
    2: "Bikes Page",
    3: "Property For Sale Page",
    4: "Property For Rent Page",
    5: "Mobiles Page",
  };
  return map[categoryId] || null;
};

export const getAdImageUrl = (path: string | null | undefined): string => {
  if (!path || path.trim() === "") return "";
  if (path.startsWith("http")) return path;
  const clean = path.startsWith("/") ? path.slice(1) : path;
  return `https://udealzone.com/${clean}`;
};
