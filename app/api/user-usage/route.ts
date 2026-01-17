import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { UserUsageResponse } from "@/types";



const MAX_DAILY_ATTEMPTS = parseInt(process.env.MAX_DAILY_ATTEMPTS || "4");
const MAX_DAILY_SUCCESSES = parseInt(process.env.MAX_DAILY_SUCCESSES || "2");

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

        // Get today's date
        const today = new Date().toISOString().split("T")[0];

        // Get or create user usage record
        let { data: usage, error } = await supabase
            .from("user_usage")
            .select("*")
            .eq("user_id", user.id)
            .eq("date", today)
            .single();

        if (error && error.code !== "PGRST116") {
            // PGRST116 = not found
            throw error;
        }

        // If no record exists for today, create one
        if (!usage) {
            const { data: newUsage, error: insertError } = await supabase
                .from("user_usage")
                .insert({
                    user_id: user.id,
                    date: today,
                    attempts: 0,
                    successes: 0,
                })
                .select()
                .single();

            if (insertError) throw insertError;
            usage = newUsage;
        }

        const response: UserUsageResponse = {
            usage: {
                attempts: usage.attempts,
                successes: usage.successes,
                attemptLimit: MAX_DAILY_ATTEMPTS,
                successLimit: MAX_DAILY_SUCCESSES,
            },
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error("Error in user-usage API:", error);
        return NextResponse.json(
            {
                error:
                    error instanceof Error ? error.message : "Failed to get user usage",
            },
            { status: 500 }
        );
    }
}
