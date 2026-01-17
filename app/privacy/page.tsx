import Link from "next/link";

export default function PrivacyPage() {
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
                <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>

                <div className="prose dark:prose-invert max-w-none space-y-6">
                    <section>
                        <h2 className="text-2xl font-semibold mb-4">Data Collection</h2>
                        <p className="text-gray-700 dark:text-gray-300">
                            Lumina uses Google OAuth for authentication. We collect and store:
                        </p>
                        <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
                            <li>Your Google account email and profile information</li>
                            <li>URLs of images you scrape or upload</li>
                            <li>Generated video metadata and Google Drive links</li>
                            <li>Usage statistics (daily attempts and successful generations)</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">OAuth Scopes</h2>
                        <p className="text-gray-700 dark:text-gray-300">
                            We request the following Google OAuth scope:
                        </p>
                        <ul className="list-disc list-inside text-gray-700 dark:text-gray-300">
                            <li>
                                <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                    https://www.googleapis.com/auth/drive.file
                                </code>{" "}
                                - To upload generated videos to your Google Drive
                            </li>
                        </ul>
                        <p className="text-gray-700 dark:text-gray-300 mt-2">
                            We only access files that Lumina creates. We cannot read, modify, or delete
                            your other Drive files.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">Data Usage</h2>
                        <p className="text-gray-700 dark:text-gray-300">
                            Your data is used solely to:
                        </p>
                        <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
                            <li>Generate AI videos using Google Veo 3.1 API</li>
                            <li>Upload videos to your Google Drive</li>
                            <li>Track usage limits and display recent generations</li>
                            <li>Improve the service</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">Third-Party Services</h2>
                        <p className="text-gray-700 dark:text-gray-300">
                            Lumina uses the following third-party services:
                        </p>
                        <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
                            <li>Supabase - Authentication and database</li>
                            <li>Google Gemini Veo 3.1 - AI video generation</li>
                            <li>Google Drive API - Video storage</li>
                            <li>Browserless - Web scraping (production only)</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">Data Retention</h2>
                        <p className="text-gray-700 dark:text-gray-300">
                            We retain your data for as long as your account is active. You can request
                            deletion of your data by contacting us.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">Contact</h2>
                        <p className="text-gray-700 dark:text-gray-300">
                            For privacy concerns or data deletion requests, please contact us through
                            the Google Cloud Console or GitHub.
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
