"use client";

interface LoadingSpinnerProps {
    message?: string;
}

export default function LoadingSpinner({ message }: LoadingSpinnerProps) {
    return (
        <div className="flex flex-col items-center justify-center py-12 animate-fade-in">
            <div className="relative">
                <div className="w-16 h-16 border-4 border-accent-light rounded-full animate-spin border-t-transparent"></div>
                <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl">
                    ✨
                </span>
            </div>
            {message && (
                <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 animate-pulse">
                    {message}
                </p>
            )}
        </div>
    );
}

export function SkeletonGrid() {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
                <div
                    key={i}
                    className="aspect-square rounded-lg skeleton animate-pulse"
                />
            ))}
        </div>
    );
}
