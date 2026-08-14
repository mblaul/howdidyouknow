import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ url }) => {
  const targetUrl = url.searchParams.get("url");
  if (!targetUrl) {
    return json({ error: "Missing url parameter" }, { status: 400 });
  }

  let formattedUrl = targetUrl.trim();
  if (!formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) {
    formattedUrl = `https://${formattedUrl}`;
  }

  try {
    const parsedUrl = new URL(formattedUrl);
    const domain = parsedUrl.hostname.replace(/^www\./, "");
    const favicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;

    // Fetch page HTML to extract OG tags
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(formattedUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      },
    }).catch(() => null);

    clearTimeout(timeoutId);

    let image: string | null = null;
    let title: string | null = null;

    if (res && res.ok) {
      const html = await res.text();

      // Extract og:image or twitter:image
      const ogImageMatch =
        html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ||
        html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i) ||
        html.match(/<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i) ||
        html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']twitter:image["']/i);

      if (ogImageMatch && ogImageMatch[1]) {
        image = ogImageMatch[1];
        if (image.startsWith("//")) {
          image = `https:${image}`;
        } else if (image.startsWith("/")) {
          image = `${parsedUrl.origin}${image}`;
        }
      }

      // Extract og:title or <title>
      const ogTitleMatch =
        html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i) ||
        html.match(/<title[^>]*>([^<]+)<\/title>/i);

      if (ogTitleMatch && ogTitleMatch[1]) {
        title = ogTitleMatch[1].trim();
      }
    }

    return json({
      domain,
      favicon,
      image,
      title,
    });
  } catch (err) {
    return json({ error: "Failed to parse link" }, { status: 500 });
  }
};
