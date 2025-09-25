import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

interface SearchData {
  title: string;
  url: string;
}

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error("CRON_SECRET not configured. Aborting.");
    return NextResponse.json(
      { error: "Server misconfiguration" },
      { status: 500 },
    );
  }

  const authHeader = request.headers.get("authorization") ?? "";
  const url = new URL(request.url);
  const querySecret = url.searchParams.get("secret");

  if (authHeader !== `Bearer ${secret}` && querySecret !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("Starting site crawl...");
    const searchData = await crawlSite();

    const filePath = path.join(process.cwd(), "public", "search-data.json");
    await fs.writeFile(filePath, JSON.stringify(searchData, null, 2));

    console.log(`Successfully crawled ${searchData.length} pages`);

    return NextResponse.json({
      success: true,
      count: searchData.length,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Crawl failed:", error);
    return NextResponse.json(
      { error: "Failed to update search data" },
      { status: 500 },
    );
  }
}

async function crawlSite(): Promise<SearchData[]> {
  const baseUrl = process.env.SITE_DOMAIN;
  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_SITE_URL environment variable is required");
  }

  const searchData: SearchData[] = [];
  const visited = new Set<string>();
  const toVisit = [baseUrl];

  const MAX_PAGES = 100;
  const TIMEOUT_MS = 60000;
  const PAGE_TIMEOUT_MS = 5000;
  const startTime = Date.now();

  while (toVisit.length > 0 && visited.size < MAX_PAGES) {
    if (Date.now() - startTime > TIMEOUT_MS) {
      console.log("Crawl timeout reached");
      break;
    }

    const url = toVisit.shift()!;
    const normalizedUrl = normalizeUrl(url);

    if (visited.has(normalizedUrl)) continue;
    if (!normalizedUrl.startsWith(baseUrl)) continue;

    if (shouldSkipUrl(normalizedUrl)) {
      console.log(`Skipping: ${normalizedUrl}`);
      continue;
    }

    try {
      console.log(`Crawling: ${normalizedUrl}`);
      visited.add(normalizedUrl);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), PAGE_TIMEOUT_MS);

      const response = await fetch(normalizedUrl, {
        signal: controller.signal,
        headers: {
          "User-Agent": "Site-Search-Crawler/1.0",
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) continue;

      const html = await response.text();

      // Extract title
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      let title = titleMatch ? titleMatch[1].trim() : "";

      if (!title) {
        const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
        title = h1Match ? h1Match[1].trim() : getPageNameFromUrl(normalizedUrl);
      }

      title = cleanTitle(title);

      if (title && !isGarbageTitle(title)) {
        const isDuplicate = searchData.some(
          (item) => item.url === normalizedUrl || item.title === title,
        );

        if (!isDuplicate) {
          searchData.push({ title, url: normalizedUrl });
          console.log(`Added: "${title}"`);
        } else {
          console.log(`Duplicate skipped: "${title}"`);
        }
      }

      // Find internal links
      const linkMatches = html.matchAll(/href=["']([^"']+)["']/gi);
      const links = Array.from(linkMatches, (match) => match[1]).slice(0, 20);

      for (const href of links) {
        let fullUrl = "";

        if (href.startsWith("/") && !href.startsWith("//")) {
          fullUrl = baseUrl + href;
        } else if (href.startsWith(baseUrl)) {
          fullUrl = href;
        }

        if (fullUrl) {
          const normalizedLink = normalizeUrl(fullUrl);
          if (
            !visited.has(normalizedLink) &&
            !toVisit.includes(normalizedLink) &&
            normalizedLink.startsWith(baseUrl) &&
            !shouldSkipUrl(normalizedLink)
          ) {
            toVisit.push(normalizedLink);
          }
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          console.log(`⏱️  Timeout: ${normalizedUrl}`);
        } else {
          console.error(`Error crawling ${normalizedUrl}:`, error.message);
        }
      } else {
        console.error(`Unknown error crawling ${normalizedUrl}:`, error);
      }
    }
  }

  console.log(`Crawl finished. Found ${searchData.length} unique pages.`);
  return searchData;
}

function normalizeUrl(url: string): string {
  try {
    const u = new URL(url);
    u.hash = "";
    u.search = "";
    let normalized = u.toString();
    if (
      normalized.endsWith("/") &&
      normalized !== `${u.protocol}//${u.host}/`
    ) {
      normalized = normalized.slice(0, -1);
    }
    return normalized;
  } catch {
    return url;
  }
}

function shouldSkipUrl(url: string): boolean {
  const skipPatterns = [
    /\.(pdf|jpg|jpeg|png|gif|css|js|woff|woff2|ttf|otf|ico|svg|mp4|mp3|zip)$/i,
    /_next\/static/i,
    /_next\/image/i,
    /favicon/i,
    /robots\.txt/i,
    /sitemap/i,
    /api\//i,
    /\.well-known/i,
    /\?/,
    /\#/,
  ];
  return skipPatterns.some((pattern) => pattern.test(url));
}

function isGarbageTitle(title: string): boolean {
  const garbagePatterns = [
    /^[a-f0-9]{12,}$/i,
    /^[a-f0-9\-]{20,}$/i,
    /\.(woff|woff2|ttf|otf|ico|svg|js|css)$/i,
    /^favicon/i,
    /^_next/i,
    /^static/i,
    /^\d{4,}$/,
    /^[^a-zA-Z]{3,}$/,
  ];
  return garbagePatterns.some((pattern) => pattern.test(title));
}

function cleanTitle(title: string): string {
  return title
    .replace(/\s*\|\s*.*$/, "")
    .replace(/\s*-\s*.*$/, "")
    .replace(/\s+/g, " ")
    .trim();
}

function getPageNameFromUrl(url: string): string {
  const pathname = new URL(url).pathname;
  const segments = pathname.split("/").filter(Boolean);
  const lastSegment = segments[segments.length - 1] || "Home";

  return lastSegment
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
}
