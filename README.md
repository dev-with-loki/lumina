# Lumina - AI Photo to Video

Transform product images into captivating AI-generated videos using Google Veo 3.1.

## Features

- 🔐 **Google OAuth Authentication** - Secure sign-in with Google
- 🔗 **URL Scraping** - Extract product images from any e-commerce URL
- 📤 **File Upload** - Upload your own images (JPG, PNG, WebP)
- ✨ **AI Video Generation** - Create 8-second showcase videos with Google Veo 3.1
- ☁️ **Google Drive Integration** - Automatically save videos to your Drive
- 📊 **Usage Tracking** - Daily limits (4 attempts, 2 successes)
- 🌙 **Dark Mode** - Toggle between light and dark themes
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Authentication**: Supabase Auth (Google OAuth)
- **Database**: Supabase (PostgreSQL)
- **AI**: Google Gemini Veo 3.1 API
- **Scraping**: Playwright (local) / Browserless (production)
- **Storage**: Google Drive API
- **Analytics**: Vercel Analytics & Speed Insights

## Getting Started

### Prerequisites

You'll need accounts and API keys for:

1. **Supabase** - Database and authentication
2. **Google Cloud** - OAuth, Drive API, Picker API
3. **Google AI Studio** - Gemini Veo 3.1 API key
4. **Browserless** (optional) - Production web scraping

### Setup Instructions

1. **Clone and Install**

```bash
npm install
```

2. **Set up Supabase**

- Create a new Supabase project
- Run the SQL schema from `supabase/schema.sql`
- Enable Google OAuth provider in Authentication settings
- Add redirect URLs: `http://localhost:3000` and your production URL

3. **Configure Google Cloud**

- Create a new Google Cloud project
- Enable these APIs:
  - Google Drive API
  - Google Picker API
  - Generative Language API
- Create OAuth 2.0 credentials (Web application)
- Add authorized origins and redirect URIs
- Create an API key for Picker

4. **Get Gemini API Key**

- Visit [Google AI Studio](https://aistudio.google.com)
- Create an API key for Gemini Veo 3.1

5. **Environment Variables**

Create a `.env.local` file (use `.env.local.example` as template):

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
NEXT_PUBLIC_GOOGLE_PICKER_API_KEY=your_picker_api_key
BROWSERLESS_API_KEY=your_browserless_key # Optional
```

6. **Run Development Server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
lumina/
├── app/
│   ├── api/                  # API routes
│   │   ├── scrape-images/    # URL scraping endpoint
│   │   ├── generate-videos/  # Video generation endpoint
│   │   ├── user-usage/       # Usage tracking endpoint
│   │   └── get-recents/      # Recent videos endpoint
│   ├── privacy/              # Privacy policy page
│   ├── terms/                # Terms of service page
│   ├── layout.tsx            # Root layout with metadata
│   ├── page.tsx              # Main application page
│   └── globals.css           # Global styles
├── components/               # React components
│   ├── Navbar.tsx            # Navigation with auth
│   ├── DriveFolderPicker.tsx # Google Drive folder picker
│   ├── ImageGrid.tsx         # Image selection grid
│   ├── VideoResultCard.tsx   # Video result display
│   └── LoadingSpinner.tsx    # Loading states
├── lib/                      # Core libraries
│   ├── supabase.ts           # Supabase client
│   ├── scraper.ts            # Image scraping
│   ├── veo-client.ts         # Veo video generation
│   └── drive-client.ts       # Google Drive uploads
├── types/                    # TypeScript types
│   └── index.ts
├── supabase/
│   └── schema.sql            # Database schema
└── [config files]            # Next.js, Tailwind, TypeScript configs
```

## Usage Limits

During beta, Lumina has the following limits:

- **4 attempts per user per day**
- **2 successful videos per user per day**
- **50 total videos across all users (global limit)**

Limits reset daily at midnight UTC.

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add all environment variables
4. Deploy!

### Important Notes

- Set `BROWSERLESS_API_KEY` for production scraping (Playwright won't work in serverless)
- Update Supabase redirect URLs to include your production domain
- Update Google Cloud OAuth authorized origins and redirect URIs

## Contributing

This project was created as a workshop demo. Feel free to fork and customize!

## License

MIT

## Acknowledgments

- Built with [Google Veo 3.1](https://deepmind.google/technologies/veo/)
- Authenticated via [Supabase](https://supabase.com)
- Deployed on [Vercel](https://vercel.com)

---

**Happy building! ✨**
