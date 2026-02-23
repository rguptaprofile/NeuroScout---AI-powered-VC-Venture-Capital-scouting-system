"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { companies } from "@/data/companies";
import { Company, SavedSearch } from "@/types";
import { loadSavedSearches, saveSavedSearches } from "@/lib/storage";
import { formatDate } from "@/lib/utils";

const PAGE_SIZE = 8;

const unique = (values: string[]) => Array.from(new Set(values));

export default function CompaniesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [stage, setStage] = useState(searchParams.get("stage") ?? "");
  const [sector, setSector] = useState(searchParams.get("sector") ?? "");
  const [location, setLocation] = useState(searchParams.get("location") ?? "");
  const [tag, setTag] = useState(searchParams.get("tag") ?? "");
  const [sortBy, setSortBy] = useState("signal");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const nextQuery = searchParams.get("q") ?? "";
    const nextStage = searchParams.get("stage") ?? "";
    const nextSector = searchParams.get("sector") ?? "";
    const nextLocation = searchParams.get("location") ?? "";
    const nextTag = searchParams.get("tag") ?? "";
    setQuery(nextQuery);
    setStage(nextStage);
    setSector(nextSector);
    setLocation(nextLocation);
    setTag(nextTag);
  }, [searchParams]);

  const filters = useMemo(
    () => ({ stage, sector, location, tag }),
    [stage, sector, location, tag]
  );

  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (stage) params.set("stage", stage);
    if (sector) params.set("sector", sector);
    if (location) params.set("location", location);
    if (tag) params.set("tag", tag);
    const queryString = params.toString();
    router.replace(queryString ? `/companies?${queryString}` : "/companies");
  }, [query, stage, sector, location, tag, router]);

  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();
    return companies
      .filter((company) => {
        if (stage && company.stage !== stage) return false;
        if (sector && company.sector !== sector) return false;
        if (location && company.location !== location) return false;
        if (tag && !company.tags.includes(tag)) return false;
        if (!search) return true;
        const haystack = [
          company.name,
          company.description,
          company.tags.join(" "),
          company.sector,
          company.location,
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(search);
      })
      .sort((a, b) => {
        if (sortBy === "name") return a.name.localeCompare(b.name);
        return new Date(b.lastSignalAt).getTime() - new Date(a.lastSignalAt).getTime();
      });
  }, [query, stage, sector, location, tag, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [query, stage, sector, location, tag, sortBy]);

  const stages = unique(companies.map((company) => company.stage));
  const sectors = unique(companies.map((company) => company.sector));
  const locations = unique(companies.map((company) => company.location));
  const tags = unique(companies.flatMap((company) => company.tags));

  const saveSearch = () => {
    const name = window.prompt("Name this saved search");
    if (!name) return;
    const saved: SavedSearch = {
      id: crypto.randomUUID(),
      name,
      query,
      filters,
      createdAt: new Date().toISOString(),
    };
    const existing = loadSavedSearches();
    saveSavedSearches([saved, ...existing]);
  };

  return (
    <div className="space-y-6">
      <div className="grid-2">
        <div className="card">
          <h1 className="card-title text-3xl">Company Discovery</h1>
          <p className="text-slate-300">
            Thesis-aligned companies surfaced by signals, tags, and recent momentum.
          </p>
          <div className="mt-6 grid-2">
            <div>
              <label className="text-sm text-slate-400">Search</label>
              <input
                className="input mt-2"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="AI infra, climate, founder moves"
              />
            </div>
            <div>
              <label className="text-sm text-slate-400">Sort</label>
              <select
                className="select mt-2"
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
              >
                <option value="signal">Latest signal</option>
                <option value="name">Company name</option>
              </select>
            </div>
          </div>
        </div>
        <div className="card">
          <h2 className="card-title text-xl">Filters</h2>
          <div className="grid-2">
            <div>
              <label className="text-sm text-slate-400">Stage</label>
              <select
                className="select mt-2"
                value={stage}
                onChange={(event) => setStage(event.target.value)}
              >
                <option value="">All</option>
                {stages.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-slate-400">Sector</label>
              <select
                className="select mt-2"
                value={sector}
                onChange={(event) => setSector(event.target.value)}
              >
                <option value="">All</option>
                {sectors.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-slate-400">Location</label>
              <select
                className="select mt-2"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
              >
                <option value="">All</option>
                {locations.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-slate-400">Tag</label>
              <select
                className="select mt-2"
                value={tag}
                onChange={(event) => setTag(event.target.value)}
              >
                <option value="">All</option>
                {tags.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <button className="button" onClick={saveSearch}>
              Save search
            </button>
            <button
              className="button button-ghost"
              onClick={() => {
                setQuery("");
                setStage("");
                setSector("");
                setLocation("");
                setTag("");
              }}
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl">{filtered.length} companies</h2>
            <p className="text-slate-400 text-sm">
              Showing {paginated.length} on page {page} of {totalPages}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              className="button button-ghost"
              disabled={page === 1}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            >
              Previous
            </button>
            <button
              className="button"
              disabled={page === totalPages}
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            >
              Next
            </button>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Stage</th>
                <th>Sector</th>
                <th>Location</th>
                <th>Latest signal</th>
                <th>Tags</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((company: Company) => (
                <tr key={company.id}>
                  <td>
                    <Link href={`/companies/${company.id}`}>
                      <p className="text-white font-medium">{company.name}</p>
                      <p className="text-slate-400 text-sm">{company.description}</p>
                    </Link>
                  </td>
                  <td>{company.stage}</td>
                  <td>{company.sector}</td>
                  <td>{company.location}</td>
                  <td>{formatDate(company.lastSignalAt)}</td>
                  <td>
                    {company.tags.map((item) => (
                      <span key={item} className="tag">
                        {item}
                      </span>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
