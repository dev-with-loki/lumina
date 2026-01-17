import { chromium } from "playwright-core";

/**
 * Scrape product images from a URL
 * Uses Playwright locally or Browserless in production
 */
export async function scrapeImages(url: string): Promise<string[]> {
    const useBrowserless = !!process.env.BROWSERLESS_API_KEY;

    if (useBrowserless) {
        return scrapeWithBrowserless(url);
    } else {
        return scrapeWithPlaywright(url);
    }
}

/**
 * Scrape images using Playwright (local development)
 */
async function scrapeWithPlaywright(url: string): Promise<string[]> {
    let browser;

    try {
        // Launch browser
        browser = await chromium.launch({
            headless: true,
        });

        const context = await browser.newContext({
            userAgent:
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        });

        const page = await context.newPage();

        // Navigate to URL with timeout
        await page.goto(url, {
            waitUntil: "networkidle",
            timeout: 30000,
        });

        // Wait for images to load
        await page.waitForTimeout(2000);

        // Extract image URLs
        const imageUrls = await page.evaluate(() => {
            const images = Array.from(document.querySelectorAll("img"));
            return images
                .map((img) => img.src || img.dataset.src)
                .filter((src): src is string => !!src && src.startsWith("http"))
                .filter((src) => {
                    // Filter out small icons and other non-product images
                    const img = document.querySelector(`img[src="${src}"]`) as HTMLImageElement;
                    if (!img) return true;
                    return img.naturalWidth > 200 && img.naturalHeight > 200;
                });
        });

        // Remove duplicates
        const uniqueImages = Array.from(new Set(imageUrls));

        return uniqueImages;
    } catch (error) {
        console.error("Error scraping with Playwright:", error);
        throw new Error(
            `Failed to scrape images: ${error instanceof Error ? error.message : "Unknown error"}`
        );
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

/**
 * Scrape images using Browserless API (production)
 */
async function scrapeWithBrowserless(url: string): Promise<string[]> {
    const apiKey = process.env.BROWSERLESS_API_KEY;

    if (!apiKey) {
        throw new Error("BROWSERLESS_API_KEY is not configured");
    }

    try {
        const response = await fetch(
            `https://chrome.browserless.io/content?token=${apiKey}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    url,
                    gotoOptions: {
                        waitUntil: "networkidle0",
                        timeout: 30000,
                    },
                    waitFor: 2000,
                }),
            }
        );

        if (!response.ok) {
            throw new Error(`Browserless API error: ${response.statusText}`);
        }

        const html = await response.text();

        // Parse HTML and extract image URLs (simple regex approach)
        const imgRegex = /<img[^>]+src="([^">]+)"/g;
        const matches = [...html.matchAll(imgRegex)];
        const imageUrls = matches
            .map((match) => match[1])
            .filter((src) => src.startsWith("http"));

        // Remove duplicates
        const uniqueImages = Array.from(new Set(imageUrls));

        return uniqueImages;
    } catch (error) {
        console.error("Error scraping with Browserless:", error);
        throw new Error(
            `Failed to scrape images: ${error instanceof Error ? error.message : "Unknown error"}`
        );
    }
}
