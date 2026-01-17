"use client";

import { useEffect, useState } from "react";
import { supabase, signInWithGoogle, signOut } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export default function Navbar() {
    const [user, setUser] = useState<User | null>(null);
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        // Check for saved theme preference or default to system preference
        const savedTheme = localStorage.getItem("theme");
        const prefersDark = window.matchMedia(
            "(prefers-color-scheme: dark)"
        ).matches;

        if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
            setDarkMode(true);
            document.documentElement.classList.add("dark");
        }

        // Get initial user
        supabase.auth.getUser().then(({ data: { user } }) => {
            setUser(user);
        });

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
        if (darkMode) {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("theme", "light");
        } else {
            document.documentElement.classList.add("dark");
            localStorage.setItem("theme", "dark");
        }
    };

    const handleSignIn = async () => {
        try {
            await signInWithGoogle();
        } catch (error) {
            console.error("Sign in error:", error);
        }
    };

    const handleSignOut = async () => {
        try {
            await signOut();
            setUser(null);
        } catch (error) {
            console.error("Sign out error:", error);
        }
    };

    return (
        <nav className="sticky top-0 z-50 glass shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    {/* Logo */}
                    <div className="flex items-center space-x-3 group">
                        <span className="text-3xl animate-float">✨</span>
                        <span className="text-2xl font-bold gradient-text cursor-pointer">
                            Lumina
                        </span>
                    </div>

                    {/* Right side */}
                    <div className="flex items-center space-x-4">
                        {/* Dark mode toggle */}
                        <button
                            onClick={toggleDarkMode}
                            className="p-3 rounded-xl hover:bg-white/10 dark:hover:bg-black/10 transition-all transform hover:scale-110 text-2xl"
                            aria-label="Toggle dark mode"
                        >
                            {darkMode ? "🌙" : "☀️"}
                        </button>

                        {/* Auth button */}
                        {user ? (
                            <div className="flex items-center space-x-4">
                                {user.user_metadata?.avatar_url && (
                                    <img
                                        src={user.user_metadata.avatar_url}
                                        alt="Profile"
                                        className="w-10 h-10 rounded-full ring-2 ring-purple-500/30 hover:ring-purple-500/60 transition-all"
                                    />
                                )}
                                <span className="hidden sm:inline text-sm font-medium">
                                    {user.user_metadata?.full_name || user.email}
                                </span>
                                <button
                                    onClick={handleSignOut}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                                >
                                    Sign Out
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={handleSignIn}
                                className="px-6 py-3 btn-gradient text-white rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg"
                            >
                                <span className="flex items-center gap-2">
                                    <span>🔐</span>
                                    <span>Sign in with Google</span>
                                </span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
