import Link from "next/link";

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-background">
            <nav className="sticky top-0 z-50 glass border-b border-gray-200 dark:border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link href="/" className="flex items-center space-x-2">
                            <span className="text-2xl">✨</span>
                            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                                Lumina
                            </span>
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>

                <div className="prose dark:prose-invert max-w-none space-y-6">
                    <section>
                        <h2 className="text-2xl font-semibold mb-4">Usage Limits</h2>
                        <p className="text-gray-700 dark:text-gray-300">
                            Lumina is currently in beta with the following limits:
                        </p>
                        <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
                            <li>
                                <strong>Daily Attempts:</strong> 4 video generation attempts per user
                                per day
                            </li>
                            <li>
                                <strong>Daily Successes:</strong> 2 successful video generations per
                                user per day
                            </li>
                            <li>
                                <strong>Global Beta Limit:</strong> 50 total successful videos across
                                all users
                            </li>
                        </ul>
                        <p className="text-gray-700 dark:text-gray-300 mt-2">
                            Limits reset daily at midnight UTC.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">Acceptable Use</h2>
                        <p className="text-gray-700 dark:text-gray-300">You agree to:</p>
                        <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
                            <li>Only upload or scrape images you have the right to use</li>
                            <li>Not generate illegal, harmful, or offensive content</li>
                            <li>Not abuse the service or attempt to circumvent usage limits</li>
                            <li>Comply with Google's AI Principles and Terms of Service</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">Beta Service Disclaimer</h2>
                        <p className="text-gray-700 dark:text-gray-300">
                            Lumina is provided as a beta service. We make no guarantees about:
                        </p>
                        <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
                            <li>Service availability or uptime</li>
                            <li>Video generation quality or success rate</li>
                            <li>Data persistence beyond the beta period</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">Intellectual Property</h2>
                        <p className="text-gray-700 dark:text-gray-300">
                            Generated videos are created using Google's Veo 3.1 AI model. Ownership
                            and usage rights are subject to Google's AI terms. You are responsible
                            for ensuring you have the rights to use input images.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">Account Termination</h2>
                        <p className="text-gray-700 dark:text-gray-300">
                            We reserve the right to terminate accounts that violate these terms or
                            abuse the service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">Changes to Terms</h2>
                        <p className="text-gray-700 dark:text-gray-300">
                            We may update these terms at any time. Continued use of the service
                            constitutes acceptance of updated terms.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">Limitation of Liability</h2>
                        <p className="text-gray-700 dark:text-gray-300">
                            Lumina is provided "as is" without warranties. We are not liable for any
                            damages arising from use of the service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">Contact</h2>
                        <p className="text-gray-700 dark:text-gray-300">
                            For questions about these terms, please contact us through the Google
                            Cloud Console or GitHub.
                        </p>
                    </section>
                </div>

                <div className="mt-12">
                    <Link
                        href="/"
                        className="text-accent hover:text-accent-light font-medium"
                    >
                        ← Back to Home
                    </Link>
                </div>
            </main>
        </div>
    );
}
