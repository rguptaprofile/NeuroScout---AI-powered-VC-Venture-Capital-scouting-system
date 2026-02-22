"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SavedSearch } from "@/types";
import { loadSavedSearches, saveSavedSearches } from "@/lib/storage";

const buildQuery = (saved: SavedSearch) => {
  const params = new URLSearchParams();
  if (saved.query) params.set("q", saved.query);
  if (saved.filters.stage) params.set("stage", saved.filters.stage);
  if (saved.filters.sector) params.set("sector", saved.filters.sector);
  if (saved.filters.location) params.set("location", saved.filters.location);
  if (saved.filters.tag) params.set("tag", saved.filters.tag);
  return `/companies?${params.toString()}`;
};

export default function SavedSearchesPage() {
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);

  useEffect(() => {
    setSavedSearches(loadSavedSearches());
  }, []);

  const removeSearch = (id: string) => {
    const updated = savedSearches.filter((search) => search.id !== id);
    saveSavedSearches(updated);
    setSavedSearches(updated);
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <h1 className="card-title text-3xl">Saved Searches</h1>
        <p className="text-slate-300">
          Persist thesis filters and re-run them in one click.
        </p>
      </div>

      {savedSearches.length === 0 ? (
        <div className="card">
          <p>No saved searches yet. Save one from the companies page.</p>
        </div>
      ) : (
        savedSearches.map((search) => (
          <div key={search.id} className="card">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl">{search.name}</h2>
                <p className="text-slate-400 text-sm">
                  Query: {search.query || "(none)"}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {search.filters.stage && <span className="badge">{search.filters.stage}</span>}
                  {search.filters.sector && <span className="badge">{search.filters.sector}</span>}
                  {search.filters.location && (
                    <span className="badge">{search.filters.location}</span>
                  )}
                  {search.filters.tag && <span className="badge">{search.filters.tag}</span>}
                </div>
              </div>
              <div className="flex gap-2">
                <Link className="button" href={buildQuery(search)}>
                  Run search
                </Link>
                <button className="button button-ghost" onClick={() => removeSearch(search.id)}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
