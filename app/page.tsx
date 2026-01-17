"use client";

import { useState, useEffect, useRef } from "react";
import { supabase, getGoogleAccessToken } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import ImageGrid from "@/components/ImageGrid";
import VideoResultCard from "@/components/VideoResultCard";
import LoadingSpinner, { SkeletonGrid } from "@/components/LoadingSpinner";
import DriveFolderPicker from "@/components/DriveFolderPicker";
import type { User } from "@supabase/supabase-js";
import type {
    VideoResult,
    ScrapeImagesResponse,
    GenerateVideosResponse,
    GetRecentsResponse,
    UserUsageResponse,
} from "@/types";

type Step = "input" | "selection" | "generating" | "results";
type InputMode = "url" | "upload";

export default function Home() {
    const [user, setUser] = useState<User | null>(null);
    const [step, setStep] = useState<Step>("input");
    const [inputMode, setInputMode] = useState<InputMode>("url");

    // URL scraping
    const [collectionUrl, setCollectionUrl] = useState("");
    const [scrapedImages, setScrapedImages] = useState<string[]>([]);
    const [isScrapingLoading, setIsScrapingLoading] = useState(false);

    // File upload
    const [uploadedImages, setUploadedImages] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Image selection
    const [selectedImages, setSelectedImages] = useState<string[]>([]);

    // Video generation
    const [isGenerating, setIsGenerating] = useState(false);
    const [videoResults, setVideoResults] = useState<VideoResult[]>([]);
    const [customPrompt, setCustomPrompt] = useState("");

    // Drive picker
    const [showDrivePicker, setShowDrivePicker] = useState(false);
    const [selectedFolderId, setSelectedFolderId] = useState<string>("");
    const [selectedFolderName, setSelectedFolderName] = useState<string>("");
    const [driveAccessToken, setDriveAccessToken] = useState<string>("");

    // Recent videos
    const [recentVideos, setRecentVideos] = useState<any[]>([]);

    // Usage tracking
    const [usage, setUsage] = useState<UserUsageResponse["usage"] | null>(null);

    useEffect(() => {
        // Get initial user
        supabase.auth.getUser().then(({ data: { user } }) => {
            setUser(user);
            if (user) {
                fetchUserUsage();
                fetchRecentVideos();
                // Get Google access token
                getGoogleAccessToken().then((token) => {
                    if (token) setDriveAccessToken(token);
                });
            }
        });

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchUserUsage();
                fetchRecentVideos();
                getGoogleAccessToken().then((token) => {
                    if (token) setDriveAccessToken(token);
                });
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const getAuthToken = async () => {
        const {
            data: { session },
        } = await supabase.auth.getSession();
        return session?.access_token || "";
    };

    const fetchUserUsage = async () => {
        try {
            const token = await getAuthToken();
            const response = await fetch("/api/user-usage", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data: UserUsageResponse = await response.json();
            setUsage(data.usage);
        } catch (error) {
            console.error("Error fetching usage:", error);
        }
    };

    const fetchRecentVideos = async () => {
        try {
            const token = await getAuthToken();
            const response = await fetch("/api/get-recents", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data: GetRecentsResponse = await response.json();
            if (Array.isArray(data.recents)) {
                setRecentVideos(data.recents);
            } else {
                setRecentVideos([]);
            }
        } catch (error) {
            console.error("Error fetching recent videos:", error);
        }
    };

    const handleScrapeImages = async () => {
        if (!collectionUrl) return;

        setIsScrapingLoading(true);
        try {
            const token = await getAuthToken();
            const response = await fetch("/api/scrape-images", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ collectionUrl }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Failed to scrape images");
            }

            const data: ScrapeImagesResponse = await response.json();
            setScrapedImages(data.images);
            setStep("selection");
        } catch (error) {
            alert(
                error instanceof Error ? error.message : "Failed to scrape images"
            );
        } finally {
            setIsScrapingLoading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const filePromises = Array.from(files)
            .filter((file) => file.type.startsWith("image/"))
            .map((file) => {
                return new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        if (event.target?.result) {
                            resolve(event.target.result as string);
                        } else {
                            resolve("");
                        }
                    };
                    reader.readAsDataURL(file);
                });
            });

        const newImages = await Promise.all(filePromises);
        const validImages = newImages.filter((img) => img !== "");

        if (validImages.length > 0) {
            setUploadedImages((prev) => [...prev, ...validImages]);
            setSelectedImages((prev) => [...prev, ...validImages]);
            setStep("selection");
        }
    };

    const handleToggleImage = (imageUrl: string) => {
        if (selectedImages.includes(imageUrl)) {
            setSelectedImages(selectedImages.filter((img) => img !== imageUrl));
        } else {
            setSelectedImages([...selectedImages, imageUrl]);
        }
    };

    const handleGenerateVideos = async () => {
        if (selectedImages.length === 0) return;

        // Get Google access token
        const accessToken = await getGoogleAccessToken();
        if (!accessToken) {
            alert("Please sign in with Google to generate videos");
            return;
        }

        setIsGenerating(true);
        setStep("generating");

        try {
            const token = await getAuthToken();
            const response = await fetch("/api/generate-videos", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    imageUrls: selectedImages,
                    accessToken,
                    folderId: selectedFolderId || undefined,
                    prompt: customPrompt || undefined,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Failed to generate videos");
            }

            const data: GenerateVideosResponse = await response.json();
            setVideoResults(data.results);
            setStep("results");

            // Refresh usage and recents
            fetchUserUsage();
            fetchRecentVideos();
        } catch (error) {
            alert(
                error instanceof Error ? error.message : "Failed to generate videos"
            );
            setStep("selection");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleReset = () => {
        setStep("input");
        setCollectionUrl("");
        setScrapedImages([]);
        setUploadedImages([]);
        setSelectedImages([]);
        setVideoResults([]);
        setCustomPrompt("");
        setSelectedFolderId("");
        setSelectedFolderName("");
    };

    const currentImages =
        inputMode === "url" ? scrapedImages : uploadedImages;

    return (
        <div className="min-h-screen bg-background selection:bg-purple-500/30">
            <Navbar />

            {/* Decorative background elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-purple-500/20 blur-[120px] animate-float" />
                <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] rounded-full bg-pink-500/20 blur-[100px] animate-float" style={{ animationDelay: "1s" }} />
                <div className="absolute -bottom-[20%] left-[20%] w-[30%] h-[30%] rounded-full bg-orange-500/20 blur-[80px] animate-float" style={{ animationDelay: "2s" }} />
            </div>

            <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                {/* Hero Section */}
                {!user && (
                    <div className="text-center mb-16 animate-fade-in">
                        <div className="inline-block mb-6 px-4 py-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 dark:from-purple-500/20 dark:to-pink-500/20 rounded-full border border-purple-500/20">
                            <span className="text-sm font-medium gradient-text">✨ Powered by Google Veo 3.1 AI</span>
                        </div>
                        <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
                            <span className="gradient-text">
                                Transform Photos
                            </span>
                            <br />
                            <span className="gradient-text">
                                into AI Videos
                            </span>
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-8 leading-relaxed">
                            Create stunning product showcase videos in seconds with Google's most advanced AI video generator
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <span className="text-2xl">🎬</span>
                                <span>Professional quality</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <span className="text-2xl">⚡</span>
                                <span>8-second videos</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <span className="text-2xl">☁️</span>
                                <span>Auto-save to Drive</span>
                            </div>
                        </div>
                    </div>
                )}

                {user && (
                    <>
                        {/* Usage Counter */}
                        {usage && (
                            <div className="mb-8 p-6 card-gradient rounded-2xl shadow-xl">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-2xl">📊</span>
                                            <span className="text-sm font-semibold gradient-text">
                                                Daily Usage
                                            </span>
                                        </div>
                                        <div className="flex gap-4 text-sm">
                                            <div>
                                                <span className="text-gray-600 dark:text-gray-400">Attempts: </span>
                                                <span className="font-bold text-purple-600 dark:text-purple-400">
                                                    {usage.attempts}/{usage.attemptLimit}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-gray-600 dark:text-gray-400">Videos: </span>
                                                <span className="font-bold text-purple-600 dark:text-purple-400">
                                                    {usage.successes}/{usage.successLimit}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step: Input */}
                        {step === "input" && (
                            <div className="animate-fade-in space-y-6">
                                <div className="text-center mb-10">
                                    <h2 className="text-4xl font-bold mb-3">
                                        <span className="gradient-text">Get Started</span>
                                    </h2>
                                    <p className="text-lg text-gray-600 dark:text-gray-400">
                                        Choose how to add your images
                                    </p>
                                </div>

                                {/* Input Mode Tabs */}
                                <div className="flex justify-center space-x-4 mb-6">
                                    <button
                                        onClick={() => setInputMode("url")}
                                        className={`px-6 py-3 rounded-lg font-medium transition-all ${inputMode === "url"
                                            ? "bg-accent text-white"
                                            : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                                            }`}
                                    >
                                        🔗 Scrape from URL
                                    </button>
                                    <button
                                        onClick={() => setInputMode("upload")}
                                        className={`px-6 py-3 rounded-lg font-medium transition-all ${inputMode === "upload"
                                            ? "bg-accent text-white"
                                            : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                                            }`}
                                    >
                                        📤 Upload Files
                                    </button>
                                </div>

                                {/* URL Input */}
                                {inputMode === "url" && (
                                    <div className="max-w-2xl mx-auto">
                                        <input
                                            type="url"
                                            value={collectionUrl}
                                            onChange={(e) => setCollectionUrl(e.target.value)}
                                            placeholder="https://example.com/products"
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-accent"
                                            disabled={isScrapingLoading}
                                        />
                                        <button
                                            onClick={handleScrapeImages}
                                            disabled={!collectionUrl || isScrapingLoading}
                                            className="w-full mt-4 px-6 py-4 btn-gradient text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
                                        >
                                            {isScrapingLoading ? (
                                                <span className="flex items-center justify-center gap-2">
                                                    <span className="animate-spin">⚡</span>
                                                    <span>Scraping...</span>
                                                </span>
                                            ) : (
                                                <span className="flex items-center justify-center gap-2">
                                                    <span>✨</span>
                                                    <span>Scrape Images</span>
                                                </span>
                                            )}
                                        </button>
                                    </div>
                                )}

                                {/* File Upload */}
                                {inputMode === "upload" && (
                                    <div className="max-w-2xl mx-auto">
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/jpeg,image/png,image/webp"
                                            multiple
                                            onChange={handleFileUpload}
                                            className="hidden"
                                            style={{ display: "none" }}
                                        />
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="w-full px-6 py-8 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg hover:border-accent transition-colors"
                                        >
                                            <div className="text-center">
                                                <span className="text-4xl mb-2 block">📷</span>
                                                <span className="text-gray-700 dark:text-gray-300 font-medium">
                                                    Click to upload images
                                                </span>
                                                <span className="text-sm text-gray-500 block mt-1">
                                                    JPG, PNG, or WebP
                                                </span>
                                            </div>
                                        </button>
                                    </div>
                                )}

                                {isScrapingLoading && <SkeletonGrid />}
                            </div>
                        )}

                        {/* Step: Selection */}
                        {step === "selection" && (
                            <div className="animate-fade-in space-y-6">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-2xl font-bold">
                                        Select Images ({selectedImages.length})
                                    </h2>
                                    <button
                                        onClick={handleReset}
                                        className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                                    >
                                        ← Back
                                    </button>
                                </div>

                                <ImageGrid
                                    images={currentImages}
                                    selectedImages={selectedImages}
                                    onToggleImage={handleToggleImage}
                                />

                                {/* Custom Prompt */}
                                <div className="max-w-2xl mx-auto">
                                    <label className="block text-sm font-medium mb-2">
                                        Custom Prompt (Optional)
                                    </label>
                                    <textarea
                                        value={customPrompt}
                                        onChange={(e) => setCustomPrompt(e.target.value)}
                                        placeholder="Describe how you want your video to look..."
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-accent"
                                        rows={3}
                                    />
                                </div>

                                {/* Drive Folder Selection */}
                                <div className="max-w-2xl mx-auto">
                                    <button
                                        onClick={() => setShowDrivePicker(true)}
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                    >
                                        {selectedFolderName
                                            ? `📁 ${selectedFolderName}`
                                            : "📁 Select Google Drive Folder (Optional)"}
                                    </button>
                                </div>

                                {/* Generate Button */}
                                <div className="max-w-2xl mx-auto">
                                    <button
                                        onClick={handleGenerateVideos}
                                        disabled={selectedImages.length === 0}
                                        className="w-full px-8 py-5 btn-gradient text-white rounded-xl font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-xl"
                                    >
                                        <span className="flex items-center justify-center gap-3">
                                            <span className="text-2xl">✨</span>
                                            <span>Generate {selectedImages.length} Video{selectedImages.length !== 1 ? "s" : ""}</span>
                                            <span className="text-2xl">🎬</span>
                                        </span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step: Generating */}
                        {step === "generating" && (
                            <div className="animate-fade-in">
                                <LoadingSpinner message="Generating your AI videos with Veo 3.1..." />
                                <p className="text-center text-gray-600 dark:text-gray-400 mt-4">
                                    This may take a few minutes. Please don't close this page.
                                </p>
                            </div>
                        )}

                        {/* Step: Results */}
                        {step === "results" && (
                            <div className="animate-fade-in space-y-6">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-2xl font-bold">Your Videos</h2>
                                    <button
                                        onClick={handleReset}
                                        className="px-6 py-2 bg-accent hover:bg-accent-light text-white rounded-lg font-medium transition-all"
                                    >
                                        Create More
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {videoResults.map((result, index) => (
                                        <VideoResultCard key={index} result={result} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Recent Generations */}
                        {recentVideos?.length > 0 && step === "input" && (
                            <div className="mt-16 animate-fade-in">
                                <h3 className="text-2xl font-bold mb-6">Recent Generations</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                    {recentVideos.map((video) => (
                                        <a
                                            key={video.id}
                                            href={video.drive_link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group relative aspect-square rounded-lg overflow-hidden hover:ring-4 hover:ring-accent transition-all"
                                        >
                                            <img
                                                src={video.image_url}
                                                alt="Recent video"
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <span className="text-white text-4xl">▶️</span>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* Drive Picker Modal */}
                {showDrivePicker && user && driveAccessToken && (
                    <DriveFolderPicker
                        accessToken={driveAccessToken}
                        onFolderSelected={(folderId, folderName) => {
                            setSelectedFolderId(folderId);
                            setSelectedFolderName(folderName);
                            setShowDrivePicker(false);
                        }}
                        onClose={() => setShowDrivePicker(false)}
                    />
                )}
            </main>

            {/* Footer */}
            <footer className="border-t border-gray-200 dark:border-gray-800 mt-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="text-center text-sm text-gray-500">
                        <p>Built with Google Veo 3.1 AI • Powered by Next.js & Supabase</p>
                        <div className="mt-2 space-x-4">
                            <a href="/privacy" className="hover:text-accent">
                                Privacy
                            </a>
                            <a href="/terms" className="hover:text-accent">
                                Terms
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
