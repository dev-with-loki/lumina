"use client";

import { useState } from "react";


interface ImageGridProps {
    images: string[];
    selectedImages: string[];
    onToggleImage: (imageUrl: string) => void;
    maxSelections?: number;
}

export default function ImageGrid({
    images,
    selectedImages,
    onToggleImage,
    maxSelections = 10,
}: ImageGridProps) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((imageUrl, index) => {
                const isSelected = selectedImages.includes(imageUrl);
                const isDisabled =
                    !isSelected && selectedImages.length >= maxSelections;

                return (
                    <div
                        key={index}
                        className={`relative aspect-square rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 transform hover:scale-105 hover:rotate-1 ${isDisabled ? "opacity-50 cursor-not-allowed" : ""
                            } ${isSelected ? "ring-4 ring-purple-500 shadow-2xl shadow-purple-500/50" : "ring-1 ring-gray-200 dark:ring-gray-700 hover:ring-2 hover:ring-purple-300 dark:hover:ring-purple-600"
                            }`}
                        onClick={() => !isDisabled && onToggleImage(imageUrl)}
                    >
                        <img
                            src={imageUrl}
                            alt={`Product ${index + 1}`}
                            className="w-full h-full object-cover"
                        />

                        {/* Hover overlay */}
                        {!isSelected && !isDisabled && (
                            <div className="absolute inset-0 bg-gradient-to-t from-purple-900/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
                        )}

                        {/* Selection overlay */}
                        {isSelected && (
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/40 via-pink-500/40 to-orange-500/40 flex items-center justify-center backdrop-blur-[2px]">
                                <div className="w-16 h-16 bg-white dark:bg-gray-900 rounded-full flex items-center justify-center text-3xl shadow-2xl transform scale-110 animate-pulse">
                                    ✓
                                </div>
                            </div>
                        )}

                        {/* Selection counter */}
                        {isSelected && (
                            <div className="absolute top-3 right-3 bg-gradient-to-br from-purple-500 to-pink-500 text-white w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-xl ring-2 ring-white dark:ring-gray-900">
                                {selectedImages.indexOf(imageUrl) + 1}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
