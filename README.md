# NeuroScout

Precision AI scout for VC sourcing. Discover companies, enrich profiles with live public data, and keep thesis-driven workflows fast and explainable.

## Features
- App shell with sidebar navigation and global search
- Companies directory with search, filters, sorting, pagination, and saved searches
- Company profiles with signals, notes, and live enrichment
- Lists with local persistence and export (CSV/JSON)
- Saved searches with one-click re-run

## Tech
- Next.js App Router + TypeScript
- Tailwind CSS
- Firecrawl (scrape) + OpenAI (structured extraction)

## Setup
1. Install dependencies:
   - `npm install`
2. Create `.env.local` from `.env.example` and add keys:
   - `FIRECRAWL_API_KEY`
   - `OPENAI_API_KEY`
   - `OPENAI_MODEL` (optional, defaults to `gpt-5.2`)
3. Run the app:
   - `npm run dev`

## Deployment (Vercel)
- Add the same environment variables in the Vercel project settings.
- Deploy as a standard Next.js app.

## Deliverables
- Deployed URL: (add after deploy)
- GitHub repo: (add after push)

## Notes
- Enrichment uses public URLs only.
- The server caches results in-memory per deployment instance to reduce repeated calls.

## Env Vars
- `FIRECRAWL_API_KEY` - Firecrawl API key
- `OPENAI_API_KEY` - OpenAI API key
- `OPENAI_MODEL` - Optional model override
