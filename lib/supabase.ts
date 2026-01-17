import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client for use in browser/client components
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Get current authenticated user
 */
export async function getCurrentUser() {
    const {
        data: { user },
        error,
    } = await supabase.auth.getUser();

    if (error) {
        console.error("Error getting current user:", error);
        return null;
    }

    return user;
}

/**
 * Sign in with Google OAuth
 * Requests additional Drive API scope
 */
export async function signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
            scopes: "https://www.googleapis.com/auth/drive.file",
            redirectTo: `${window.location.origin}`,
            queryParams: {
                access_type: "offline",
                prompt: "consent",
            },
        },
    });

    if (error) {
        console.error("Error signing in with Google:", error);
        throw error;
    }

    return data;
}

/**
 * Sign out current user
 */
export async function signOut() {
    const { error } = await supabase.auth.signOut();

    if (error) {
        console.error("Error signing out:", error);
        throw error;
    }
}

/**
 * Get OAuth access token for Google Drive API
 */
export async function getGoogleAccessToken(): Promise<string | null> {
    const {
        data: { session },
    } = await supabase.auth.getSession();

    if (!session?.provider_token) {
        console.error("No provider token available");
        return null;
    }

    return session.provider_token;
}
