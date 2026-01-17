import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { generateVideo, dataUrlToBuffer } from "@/lib/veo-client";
import { uploadToDrive } from "@/lib/drive-client";
import type { GenerateVideosRequest, GenerateVideosResponse } from "@/types";



const MAX_DAILY_ATTEMPTS = parseInt(process.env.MAX_DAILY_ATTEMPTS || "4");
const MAX_DAILY_SUCCESSES = parseInt(process.env.MAX_DAILY_SUCCESSES || "2");
const MAX_GLOBAL_VIDEOS = parseInt(process.env.MAX_GLOBAL_VIDEOS || "50");

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
        const body: GenerateVideosRequest = await request.json();
        const { imageUrls, accessToken, folderId, prompt } = body;

        if (!imageUrls || imageUrls.length === 0) {
            return NextResponse.json(
                { error: "imageUrls is required" },
                { status: 400 }
            );
        }

        if (!accessToken) {
            return NextResponse.json(
                { error: "accessToken is required" },
                { status: 400 }
            );
        }

        // Check global video limit
        const { count: globalCount } = await supabase
            .from("video_logs")
            .select("*", { count: "exact", head: true })
            .eq("status", 1);

        if (globalCount !== null && globalCount >= MAX_GLOBAL_VIDEOS) {
            return NextResponse.json(
                { error: "Global beta limit reached (50 videos)" },
                { status: 429 }
            );
        }

        // Get today's date
        const today = new Date().toISOString().split("T")[0];

        // Get or create user usage record
        let { data: usage } = await supabase
            .from("user_usage")
            .select("*")
            .eq("user_id", user.id)
            .eq("date", today)
            .single();

        if (!usage) {
            const { data: newUsage } = await supabase
                .from("user_usage")
                .insert({
                    user_id: user.id,
                    date: today,
                    attempts: 0,
                    successes: 0,
                })
                .select()
                .single();
            usage = newUsage!;
        }

        // Check daily limits
        if (usage.attempts >= MAX_DAILY_ATTEMPTS) {
            return NextResponse.json(
                { error: "Daily attempt limit reached (4 attempts)" },
                { status: 429 }
            );
        }

        if (usage.successes >= MAX_DAILY_SUCCESSES) {
            return NextResponse.json(
                { error: "Daily success limit reached (2 videos)" },
                { status: 429 }
            );
        }

        // Increment attempts
        await supabase
            .from("user_usage")
            .update({ attempts: usage.attempts + 1 })
            .eq("id", usage.id);

        // Process videos (for now, process one at a time)
        const results = [];
        let totalProcessed = 0;
        let errors = 0;
        let successCount = 0;

        for (const imageUrl of imageUrls) {
            try {
                // Generate video
                const videoDataUrl = await generateVideo(imageUrl, prompt);

                // Upload to Drive
                const videoBuffer = dataUrlToBuffer(videoDataUrl);
                const { fileId, webViewLink } = await uploadToDrive(
                    videoBuffer,
                    accessToken,
                    folderId
                );

                // Log success
                await supabase.from("video_logs").insert({
                    user_id: user.id,
                    drive_file_id: fileId,
                    drive_link: webViewLink,
                    image_url: imageUrl,
                    status: 1,
                });

                results.push({
                    imageUrl,
                    videoUrl: videoDataUrl,
                    driveLink: webViewLink,
                    status: "success" as const,
                });

                totalProcessed++;
                successCount++;

                // Update success count
                await supabase
                    .from("user_usage")
                    .update({ successes: usage.successes + successCount })
                    .eq("id", usage.id);

                // Check if we've hit the daily success limit
                if (usage.successes + successCount >= MAX_DAILY_SUCCESSES) {
                    break;
                }
            } catch (error) {
                console.error("Error processing video:", error);

                // Log failure
                await supabase.from("video_logs").insert({
                    user_id: user.id,
                    image_url: imageUrl,
                    status: 0,
                });

                results.push({
                    imageUrl,
                    videoUrl: "",
                    status: "error" as const,
                    error:
                        error instanceof Error ? error.message : "Failed to generate video",
                });

                errors++;
                totalProcessed++;
            }
        }

        const response: GenerateVideosResponse = {
            results,
            totalProcessed,
            errors,
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error("Error in generate-videos API:", error);
        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to generate videos",
            },
            { status: 500 }
        );
    }
}
