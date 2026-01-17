"use client";

import type { VideoResult } from "@/types";

interface VideoResultCardProps {
    result: VideoResult;
}

export default function VideoResultCard({ result }: VideoResultCardProps) {
    const handleDownload = () => {
        const link = document.createElement("a");
        link.href = result.videoUrl;
        link.download = `lumina-video-${Date.now()}.mp4`;
        link.click();
    };

    if (result.status === "error") {
        return (
            <div className="rounded-2xl border border-red-200 dark:border-red-800 p-6 bg-red-50/50 dark:bg-red-900/10 backdrop-blur-sm">
                <div className="flex items-center space-x-3 mb-3">
                    <span className="text-3xl animate-bounce">❌</span>
                    <h3 className="font-bold text-lg text-red-700 dark:text-red-400">
                        Generation Failed
                    </h3>
                </div>
                <p className="text-sm text-red-600 dark:text-red-300 leading-relaxed pl-11">
                    {result.error || "Unknown error occurred"}
                </p>
            </div>
        );
    }

    return (
        <div className="card-gradient rounded-2xl overflow-hidden shadow-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl animate-fade-in-scale group">
            {/* Video preview */}
            <div className="relative aspect-video bg-black/90 group-hover:bg-black transition-colors">
                <video
                    src={result.videoUrl}
                    controls
                    className="w-full h-full object-contain"
                    playsInline
                    loop
                >
                    Your browser does not support video playback.
                </video>
            </div>

            {/* Actions */}
            <div className="p-6 space-y-4">
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <span className="text-green-500 text-lg">✅</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Video generated successfully!
                    </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={handleDownload}
                        className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl text-sm font-bold transition-all transform hover:scale-105 flex items-center justify-center space-x-2"
                    >
                        <span>📥</span>
                        <span>Download</span>
                    </button>

                    {result.driveLink && (
                        <a
                            href={result.driveLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 px-4 py-3 btn-gradient text-white rounded-xl text-sm font-bold transition-all transform hover:scale-105 flex items-center justify-center space-x-2 shadow-lg"
                        >
                            <span>☁️</span>
                            <span>Open in Drive</span>
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}
