import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({
    subsets: ["latin"],
    display: "swap",
});

export const metadata: Metadata = {
    title: "Lumina - AI Photo to Video",
    description:
        "Transform product images into captivating AI-generated videos with Google Veo 3.1",
    keywords: ["AI", "video generation", "Veo", "product showcase", "e-commerce"],
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${inter.className} antialiased`} suppressHydrationWarning>
                {children}
                <Analytics />
                <SpeedInsights />
            </body>
        </html>
    );
}
