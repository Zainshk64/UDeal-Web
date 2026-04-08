'use client';

export const RECENT_SEARCH_LIMIT = 5;

export function getRecentSearches(key: string): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as string[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(Boolean).slice(0, RECENT_SEARCH_LIMIT);
  } catch {
    return [];
  }
}

export function pushRecentSearch(key: string, value: string): string[] {
  const next = [value, ...getRecentSearches(key).filter((x) => x.toLowerCase() !== value.toLowerCase())].slice(
    0,
    RECENT_SEARCH_LIMIT,
  );
  if (typeof window !== 'undefined') window.localStorage.setItem(key, JSON.stringify(next));
  return next;
}

export function removeRecentSearch(key: string, value: string): string[] {
  const next = getRecentSearches(key).filter((x) => x !== value);
  if (typeof window !== 'undefined') window.localStorage.setItem(key, JSON.stringify(next));
  return next;
}

