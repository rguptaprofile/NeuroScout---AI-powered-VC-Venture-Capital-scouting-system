"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Bookmark, Building2, List, Search, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/companies", label: "Companies", icon: Building2 },
  { href: "/lists", label: "Lists", icon: List },
  { href: "/saved", label: "Saved Searches", icon: Bookmark },
];

export const AppShell = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [query, setQuery] = useState("");

  return (
    <div className="min-h-screen bg-ink text-white">
      <div className="app-shell">
        <aside className="sidebar">
          <div className="brand">
            <Sparkles className="h-5 w-5" />
            <div>
              <p className="brand-title">NeuroScout</p>
              <p className="brand-subtitle">Precision VC discovery</p>
            </div>
          </div>
          <nav className="nav">
            {navItems.map((item) => {
              const active = pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn("nav-item", active && "nav-item-active")}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="sidebar-card">
            <p className="sidebar-card-title">Thesis Lens</p>
            <p className="sidebar-card-text">
              Focus: early climate + AI infrastructure, contrarian B2B.
            </p>
          </div>
        </aside>
        <div className="main-area">
          <header className="topbar">
            <form
              className="global-search"
              onSubmit={(event) => {
                event.preventDefault();
                if (!query.trim()) return;
                router.push(`/companies?q=${encodeURIComponent(query.trim())}`);
              }}
            >
              <Search className="h-4 w-4" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search companies, tags, founders..."
              />
            </form>
            <div className="topbar-actions">
              <span className="pill">Live Enrichment Ready</span>
            </div>
          </header>
          <main className="content">{children}</main>
        </div>
      </div>
    </div>
  );
};
