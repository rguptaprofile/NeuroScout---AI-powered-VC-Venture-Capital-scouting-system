"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { companies } from "@/data/companies";
import { CompanyList, EnrichmentResult } from "@/types";
import {
  loadEnrichment,
  loadLists,
  loadNotes,
  saveEnrichment,
  saveLists,
  saveNotes,
} from "@/lib/storage";
import { formatDate } from "@/lib/utils";

const defaultEnrichment: EnrichmentResult = {
  summary: "",
  whatTheyDo: [],
  keywords: [],
  derivedSignals: [],
  sources: [],
};

export default function CompanyProfilePage() {
  const params = useParams();
  const companyId = params?.id as string;
  const company = companies.find((item) => item.id === companyId);
  const [notes, setNotes] = useState("");
  const [lists, setLists] = useState<CompanyList[]>([]);
  const [selectedList, setSelectedList] = useState("");
  const [enrichment, setEnrichment] = useState<EnrichmentResult>(defaultEnrichment);
  const [enriching, setEnriching] = useState(false);
  const [enrichError, setEnrichError] = useState<string | null>(null);

  useEffect(() => {
    const storedNotes = loadNotes();
    setNotes(storedNotes[companyId] ?? "");
    setLists(loadLists());
    const storedEnrichment = loadEnrichment();
    setEnrichment(storedEnrichment[companyId] ?? defaultEnrichment);
  }, [companyId]);

  const listOptions = useMemo(() => lists, [lists]);

  if (!company) {
    return (
      <div className="card">
        <p>Company not found.</p>
        <Link className="button mt-4 inline-block" href="/companies">
          Back to companies
        </Link>
      </div>
    );
  }

  const saveNote = (value: string) => {
    const storedNotes = loadNotes();
    const next = { ...storedNotes, [companyId]: value };
    saveNotes(next);
    setNotes(value);
  };

  const handleAddToList = () => {
    if (!selectedList) return;
    const updated = lists.map((list) => {
      if (list.id !== selectedList) return list;
      if (list.companyIds.includes(companyId)) return list;
      return { ...list, companyIds: [...list.companyIds, companyId] };
    });
    saveLists(updated);
    setLists(updated);
  };

  const handleCreateList = () => {
    const name = window.prompt("List name");
    if (!name) return;
    const newList: CompanyList = {
      id: crypto.randomUUID(),
      name,
      companyIds: [companyId],
      createdAt: new Date().toISOString(),
    };
    const updated = [newList, ...lists];
    saveLists(updated);
    setLists(updated);
    setSelectedList(newList.id);
  };

  const runEnrichment = async () => {
    setEnriching(true);
    setEnrichError(null);
    try {
      const response = await fetch("/api/enrich", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: company.website, companyName: company.name }),
      });
      if (!response.ok) {
        throw new Error("Enrichment failed");
      }
      const data = (await response.json()) as EnrichmentResult;
      const stored = loadEnrichment();
      const next = { ...stored, [companyId]: data };
      saveEnrichment(next);
      setEnrichment(data);
    } catch (error) {
      setEnrichError("Unable to enrich. Check API keys and try again.");
    } finally {
      setEnriching(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl mb-2">{company.name}</h1>
            <p className="text-slate-300 max-w-2xl">{company.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="badge">{company.stage}</span>
              <span className="badge">{company.sector}</span>
              <span className="badge">{company.location}</span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <a className="button" href={company.website} target="_blank" rel="noreferrer">
              Visit site
            </a>
            <button className="button" onClick={runEnrichment} disabled={enriching}>
              {enriching ? "Enriching..." : "Enrich profile"}
            </button>
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <h2 className="card-title text-xl">Signals Timeline</h2>
          <div className="space-y-4">
            {company.signals.map((signal) => (
              <div key={`${signal.date}-${signal.label}`}>
                <p className="text-sm text-slate-400">{formatDate(signal.date)}</p>
                <p className="text-white">{signal.label}</p>
                <p className="text-slate-300 text-sm">{signal.detail}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <h2 className="card-title text-xl">Notes & Actions</h2>
          <label className="text-sm text-slate-400">Internal notes</label>
          <textarea
            className="textarea mt-2"
            rows={6}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            onBlur={(event) => saveNote(event.target.value)}
            placeholder="Add your thesis fit notes, meeting context, or next steps."
          />
          <div className="mt-4">
            <label className="text-sm text-slate-400">Add to list</label>
            <div className="mt-2 flex flex-wrap gap-2">
              <select
                className="select"
                value={selectedList}
                onChange={(event) => setSelectedList(event.target.value)}
              >
                <option value="">Select list</option>
                {listOptions.map((list) => (
                  <option key={list.id} value={list.id}>
                    {list.name}
                  </option>
                ))}
              </select>
              <button className="button" onClick={handleAddToList}>
                Add
              </button>
              <button className="button button-ghost" onClick={handleCreateList}>
                New list
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="card-title text-xl">Live Enrichment</h2>
        {enrichError && <p className="text-red-300">{enrichError}</p>}
        {enrichment.summary ? (
          <div className="grid-3">
            <div>
              <p className="text-sm text-slate-400">Summary</p>
              <p className="text-white mt-2">{enrichment.summary}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">What they do</p>
              <ul className="mt-2 space-y-1 text-sm text-slate-200">
                {enrichment.whatTheyDo.map((item) => (
                  <li key={item}>- {item}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-sm text-slate-400">Keywords</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {enrichment.keywords.map((keyword) => (
                  <span key={keyword} className="tag">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-400">Derived signals</p>
              <ul className="mt-2 space-y-1 text-sm text-slate-200">
                {enrichment.derivedSignals.map((item) => (
                  <li key={item}>- {item}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-sm text-slate-400">Sources</p>
              <ul className="mt-2 space-y-1 text-sm text-slate-200">
                {enrichment.sources.map((source) => (
                  <li key={source.url}>
                    <a href={source.url} target="_blank" rel="noreferrer">
                      {source.url}
                    </a>
                    <span className="text-slate-400"> · {formatDate(source.fetchedAt)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <p className="text-slate-300">
            Run enrichment to fetch live public data and extract signals.
          </p>
        )}
      </div>
    </div>
  );
}
