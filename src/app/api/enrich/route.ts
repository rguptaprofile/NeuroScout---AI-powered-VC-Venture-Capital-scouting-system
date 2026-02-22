import OpenAI from "openai";
import { EnrichmentResult } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const cache = new Map<string, { payload: EnrichmentResult; timestamp: number }>();
const TTL_MS = 1000 * 60 * 60 * 12;

const safeArray = (value: unknown, fallback: string[] = []) =>
  Array.isArray(value) ? value.filter((item) => typeof item === "string") : fallback;

const truncate = (value: string, max = 12000) =>
  value.length > max ? value.slice(0, max) : value;

export async function POST(request: Request) {
  const { url, companyName } = (await request.json()) as {
    url?: string;
    companyName?: string;
  };

  if (!url) {
    return Response.json({ error: "Missing url" }, { status: 400 });
  }

  const cached = cache.get(url);
  if (cached && Date.now() - cached.timestamp < TTL_MS) {
    return Response.json(cached.payload);
  }

  const firecrawlKey = process.env.FIRECRAWL_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (!firecrawlKey || !openaiKey) {
    return Response.json({ error: "Missing API keys" }, { status: 500 });
  }

  const crawlResponse = await fetch("https://api.firecrawl.dev/v1/scrape", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${firecrawlKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url,
      formats: ["markdown", "links"],
      onlyMainContent: true,
      timeout: 30000,
    }),
  });

  if (!crawlResponse.ok) {
    return Response.json({ error: "Firecrawl failed" }, { status: 500 });
  }

  const crawlJson = (await crawlResponse.json()) as {
    data?: { markdown?: string; links?: string[] };
  };

  const markdown = crawlJson?.data?.markdown ?? "";
  const links = crawlJson?.data?.links ?? [];
  const textPayload = truncate(`${markdown}\n\nLinks:\n${links.slice(0, 10).join("\n")}`);

  const openai = new OpenAI({ apiKey: openaiKey });

  const completion = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You extract structured company profiles from website content. Return strict JSON.",
      },
      {
        role: "user",
        content: [
          `Company: ${companyName ?? "Unknown"}`,
          `Website: ${url}`,
          "Extract:",
          "summary: 1-2 sentences.",
          "whatTheyDo: 3-6 bullet phrases.",
          "keywords: 5-10 keywords.",
          "derivedSignals: 2-4 inferred signals (e.g., careers page exists, recent blog).",
          "Return JSON with keys: summary, whatTheyDo, keywords, derivedSignals.",
          "Content:",
          textPayload,
        ].join("\n"),
      },
    ],
  });

  const message = completion.choices[0]?.message?.content ?? "{}";
  let parsed: Partial<EnrichmentResult> = {};
  try {
    parsed = JSON.parse(message);
  } catch {
    parsed = {};
  }

  const payload: EnrichmentResult = {
    summary: typeof parsed.summary === "string" ? parsed.summary : "",
    whatTheyDo: safeArray(parsed.whatTheyDo),
    keywords: safeArray(parsed.keywords),
    derivedSignals: safeArray(parsed.derivedSignals),
    sources: [{ url, fetchedAt: new Date().toISOString() }],
  };

  cache.set(url, { payload, timestamp: Date.now() });

  return Response.json(payload);
}
