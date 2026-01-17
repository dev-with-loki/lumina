import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { GetRecentsResponse } from "@/types";



export async function GET(request: NextRequest) {
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

        // Fetch last 5 successful video generations
        const { data: videos, error } = await supabase
            .from("video_logs")
            .select("id, drive_link, image_url, created_at")
            .eq("user_id", user.id)
            .eq("status", 1) // Only successful generations
            .order("created_at", { ascending: false })
            .limit(5);

        if (error) throw error;

        const response: GetRecentsResponse = {
            recents: videos || [],
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error("Error in get-recents API:", error);
        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to get recent videos",
            },
            { status: 500 }
        );
    }
}
