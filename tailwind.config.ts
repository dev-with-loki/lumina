import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                "background-secondary": "var(--background-secondary)",
                foreground: "var(--foreground)",
                accent: "var(--accent)",
                "accent-light": "var(--accent-light)",
                "accent-dark": "var(--accent-dark)",
                "gradient-start": "var(--gradient-start)",
                "gradient-mid": "var(--gradient-mid)",
                "gradient-end": "var(--gradient-end)",
                border: "var(--border)",
            },
            animation: {
                "fade-in": "fadeIn 0.5s ease-in-out",
                "fade-in-scale": "fadeInScale 0.5s ease-in-out",
                shimmer: "shimmer 2s linear infinite",
                float: "float 3s ease-in-out infinite",
            },
            keyframes: {
                fadeIn: {
                    "0%": { opacity: "0", transform: "translateY(10px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
                fadeInScale: {
                    "0%": { opacity: "0", transform: "scale(0.95)" },
                    "100%": { opacity: "1", transform: "scale(1)" },
                },
                shimmer: {
                    "0%": { backgroundPosition: "-1000px 0" },
                    "100%": { backgroundPosition: "1000px 0" },
                },
                float: {
                    "0%, 100%": { transform: "translateY(0)" },
                    "50%": { transform: "translateY(-10px)" },
                },
            },
        },
    },
    plugins: [],
};

export default config;
