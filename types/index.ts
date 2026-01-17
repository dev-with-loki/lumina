// Core type definitions for Lumina application

export interface VideoResult {
    imageUrl: string;
    videoUrl: string; // Data URL for inline display
    driveLink?: string; // Optional Google Drive link
    status: "success" | "error";
    error?: string;
}

export interface ScrapeImagesRequest {
    collectionUrl: string;
}

export interface ScrapeImagesResponse {
    images: string[];
}

export interface GenerateVideosRequest {
    imageUrls: string[];
    accessToken: string; // Google OAuth token
    folderId?: string; // Optional Drive folder ID
    prompt?: string; // Custom video generation prompt
}

export interface GenerateVideosResponse {
    results: VideoResult[];
    totalProcessed: number;
    errors: number;
}

export interface UserUsage {
    attempts: number;
    successes: number;
    attemptLimit: number;
    successLimit: number;
}

export interface UserUsageResponse {
    usage: UserUsage;
}

export interface VideoLog {
    id: string;
    user_id: string;
    drive_file_id?: string;
    drive_link?: string;
    image_url: string;
    status: number; // 0 = failure, 1 = success
    created_at: string;
}

export interface RecentVideo {
    id: string;
    drive_link: string;
    image_url: string;
    created_at: string;
}

export interface GetRecentsResponse {
    recents: RecentVideo[];
}

export interface ScrapeLog {
    id: string;
    user_id: string;
    url: string;
    image_count: number;
    created_at: string;
}

export interface UserUsageRow {
    id: string;
    user_id: string;
    date: string;
    attempts: number;
    successes: number;
    created_at: string;
    updated_at: string;
}
