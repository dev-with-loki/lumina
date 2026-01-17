import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { scrapeImages } from "@/lib/scraper";
import type { ScrapeImagesRequest, ScrapeImagesResponse } from "@/types";



export async function POST(request: NextRequest) {
    try {
        // Get authorization header
        const authHeader = request.headers.get("authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const token = authHeader.substring(7);

        // Create authenticated Supabase client
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                global: {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            }
        );

        // Verify user
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Parse request body
        const body: ScrapeImagesRequest = await request.json();
        const { collectionUrl } = body;

        if (!collectionUrl) {
            return NextResponse.json(
                { error: "collectionUrl is required" },
                { status: 400 }
            );
        }

        // Validate URL
        try {
            new URL(collectionUrl);
        } catch {
            return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
        }

        // Scrape images
        const images = await scrapeImages(collectionUrl);

        // Log scraping attempt
        await supabase.from("scrape_logs").insert({
            user_id: user.id,
            url: collectionUrl,
            image_count: images.length,
        });

        const response: ScrapeImagesResponse = {
            images,
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error("Error in scrape-images API:", error);
        return NextResponse.json(
            {
                error:
                    error instanceof Error ? error.message : "Failed to scrape images",
            },
            { status: 500 }
        );
    }
}
