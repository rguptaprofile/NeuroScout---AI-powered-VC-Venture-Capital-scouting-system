import { CompanyList, EnrichmentResult, SavedSearch } from "@/types";

const keys = {
  lists: "neuroscout:lists",
  saved: "neuroscout:saved-searches",
  notes: "neuroscout:company-notes",
  enrichment: "neuroscout:enrichment",
};

const isBrowser = () => typeof window !== "undefined";

const readJson = <T>(key: string, fallback: T): T => {
  if (!isBrowser()) return fallback;
  const raw = window.localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const writeJson = <T>(key: string, value: T) => {
  if (!isBrowser()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
};

export const loadLists = () => readJson<CompanyList[]>(keys.lists, []);

export const saveLists = (lists: CompanyList[]) => writeJson(keys.lists, lists);

export const loadSavedSearches = () => readJson<SavedSearch[]>(keys.saved, []);

export const saveSavedSearches = (searches: SavedSearch[]) =>
  writeJson(keys.saved, searches);

export const loadNotes = () => readJson<Record<string, string>>(keys.notes, {});

export const saveNotes = (notes: Record<string, string>) =>
  writeJson(keys.notes, notes);

export const loadEnrichment = () =>
  readJson<Record<string, EnrichmentResult>>(keys.enrichment, {});

export const saveEnrichment = (payload: Record<string, EnrichmentResult>) =>
  writeJson(keys.enrichment, payload);
