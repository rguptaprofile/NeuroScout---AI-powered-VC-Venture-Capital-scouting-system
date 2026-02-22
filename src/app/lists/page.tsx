"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { companies } from "@/data/companies";
import { CompanyList } from "@/types";
import { loadLists, saveLists } from "@/lib/storage";

const downloadFile = (filename: string, content: string, type: string) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

export default function ListsPage() {
  const [lists, setLists] = useState<CompanyList[]>([]);
  const [newListName, setNewListName] = useState("");

  useEffect(() => {
    setLists(loadLists());
  }, []);

  const companyMap = useMemo(
    () => new Map(companies.map((company) => [company.id, company])),
    []
  );

  const createList = () => {
    if (!newListName.trim()) return;
    const next: CompanyList = {
      id: crypto.randomUUID(),
      name: newListName.trim(),
      companyIds: [],
      createdAt: new Date().toISOString(),
    };
    const updated = [next, ...lists];
    saveLists(updated);
    setLists(updated);
    setNewListName("");
  };

  const removeCompany = (listId: string, companyId: string) => {
    const updated = lists.map((list) =>
      list.id === listId
        ? { ...list, companyIds: list.companyIds.filter((id) => id !== companyId) }
        : list
    );
    saveLists(updated);
    setLists(updated);
  };

  const exportList = (list: CompanyList) => {
    const payload = list.companyIds
      .map((id) => companyMap.get(id))
      .filter(Boolean);
    downloadFile(
      `${list.name.replace(/\s+/g, "-").toLowerCase()}.json`,
      JSON.stringify(payload, null, 2),
      "application/json"
    );

    const csvHeader = "name,website,stage,sector,location\n";
    const csvRows = payload
      .map((company) =>
        [company?.name, company?.website, company?.stage, company?.sector, company?.location]
          .map((value) => `"${value ?? ""}"`)
          .join(",")
      )
      .join("\n");
    downloadFile(
      `${list.name.replace(/\s+/g, "-").toLowerCase()}.csv`,
      `${csvHeader}${csvRows}`,
      "text/csv"
    );
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <h1 className="card-title text-3xl">Lists</h1>
        <p className="text-slate-300">
          Curate company shortlists for partners, demos, or sector focus.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <input
            className="input"
            value={newListName}
            onChange={(event) => setNewListName(event.target.value)}
            placeholder="New list name"
          />
          <button className="button" onClick={createList}>
            Create list
          </button>
        </div>
      </div>

      {lists.length === 0 ? (
        <div className="card">
          <p>No lists yet. Create one to start saving companies.</p>
        </div>
      ) : (
        lists.map((list) => (
          <div key={list.id} className="card">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl">{list.name}</h2>
                <p className="text-slate-400 text-sm">
                  {list.companyIds.length} companies
                </p>
              </div>
              <button className="button" onClick={() => exportList(list)}>
                Export CSV/JSON
              </button>
            </div>
            <div className="mt-4 space-y-3">
              {list.companyIds.length === 0 ? (
                <p className="text-slate-400">No companies added yet.</p>
              ) : (
                list.companyIds.map((companyId) => {
                  const company = companyMap.get(companyId);
                  if (!company) return null;
                  return (
                    <div
                      key={companyId}
                      className="flex flex-wrap items-center justify-between gap-3"
                    >
                      <div>
                        <Link href={`/companies/${company.id}`}>
                          <p className="text-white font-medium">{company.name}</p>
                        </Link>
                        <p className="text-slate-400 text-sm">{company.description}</p>
                      </div>
                      <button
                        className="button button-ghost"
                        onClick={() => removeCompany(list.id, companyId)}
                      >
                        Remove
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
