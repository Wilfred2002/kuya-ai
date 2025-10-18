# Kuya AI - Landing Page

A beautiful, minimalistic landing page with matcha green theme and interactive WebGL background for Kuya AI.

**Headline:** "We're making AI **native** to group conversations."

## Design Features

- **Matcha Green Theme**: Soft, calming green palette inspired by matcha tea
- **Interactive WebGL Background**: Cursor-following wave animation using Vanta.js
- **Strategic Typography**: Mix of light and bold weights with Space Mono monospace accents
- **Smooth Animations**: Subtle fade-in effects for engaging user experience
- **Responsive Design**: Beautiful on mobile, tablet, and desktop
- **Minimal Header**: Clean branding with just the KUYA logo

## Features

- Clean, minimal design centered around the core message
- Email waitlist collection with validation
- Real-time form feedback with matcha-themed success/error states
- Supabase database integration for waitlist storage
- WebGL animated background that follows cursor movement
- SEO optimized with Open Graph and Twitter metadata

## Getting Started

### Prerequisites

1. **Node.js 18+** installed
2. **Supabase account** (free tier works perfectly)

### Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run this query to create the waitlist table:

```sql
create table waitlist (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table waitlist enable row level security;

-- Create policy to allow inserts
create policy "Anyone can insert emails"
  on waitlist for insert
  with check (true);
```

3. Get your **Project URL** and **anon key** from:
   - Settings → API → Project URL
   - Settings → API → Project API keys → `anon` `public`

### Environment Setup

1. Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

2. Update `.env.local` with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Deployment

### Deploy to Vercel (Recommended)

1. Push to GitHub
2. Connect repository to Vercel
3. **Add environment variables** in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy automatically

Or use Vercel CLI:

```bash
npm i -g vercel
vercel
```

**Important:** Don't forget to add your Supabase environment variables in the Vercel dashboard!

## Waitlist Management

### View Signups in Supabase

1. Go to your Supabase project dashboard
2. Navigate to **Table Editor** → `waitlist`
3. View all email signups with timestamps

### Export Emails

Run this SQL query in Supabase SQL Editor:

```sql
select email, created_at
from waitlist
order by created_at desc;
```

Or export as CSV directly from the Table Editor.

## Color Palette

The matcha green color scheme:

- **Background**: `#fafdf8` - Soft off-white with green tint
- **Foreground**: `#1a3a1a` - Deep forest green
- **Matcha 500**: `#5a9e4d` - Primary brand green (used in WebGL background)
- **Matcha 600**: `#4a8441` - Button/interactive green
- **Matcha 700**: `#3d6a36` - Hover states
- **Accent**: `#8bb885` - Light accent green

## Tech Stack

- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS v4** with custom theme
- **Vanta.js + Three.js** for WebGL background animation
- **Supabase** for database and waitlist storage
- **Space Mono & Geist** fonts

## Project Structure

```
landing/
├── app/
│   ├── api/
│   │   └── waitlist/
│   │       └── route.ts       # Waitlist API endpoint (Supabase)
│   ├── layout.tsx             # Root layout with fonts & metadata
│   ├── page.tsx               # Main landing page
│   └── globals.css            # Matcha theme + animations
├── components/
│   └── WebGLBackground.tsx    # Vanta.js wave animation
├── lib/
│   └── supabase.ts            # Supabase client
├── .env.local                 # Environment variables (gitignored)
├── .env.example               # Template for environment variables
└── README.md
```

## Customization

### Update WebGL Animation

Edit `components/WebGLBackground.tsx` to customize the wave effect:

```typescript
color: 0x5a9e4d,      // Matcha green hex
waveHeight: 15.0,     // Wave amplitude
waveSpeed: 0.75,      // Animation speed
zoom: 0.85            // Camera zoom level
```

### Update Colors

Edit `app/globals.css` to change the matcha color palette:

```css
:root {
  --matcha-500: #5a9e4d;  /* Primary brand color */
  --matcha-600: #4a8441;  /* Button color */
  /* ... more colors */
}
```

### Update Copy

Edit `app/page.tsx` to change headlines and form text.

### Update Social Links

Update footer links in `app/page.tsx` to point to your actual social profiles.

## Troubleshooting

### WebGL Background Not Showing

- Check browser console for errors
- Ensure `vanta` and `three` are installed
- Try refreshing the page

### Waitlist Not Working

- Verify Supabase credentials in `.env.local`
- Check that the `waitlist` table exists in Supabase
- Verify Row Level Security policy allows inserts
- Check Vercel environment variables are set

### Build Errors

```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

## Future Enhancements

- [x] Connect to Supabase for scalable storage
- [x] Interactive WebGL background animation
- [ ] Email confirmation via Resend
- [ ] Admin dashboard to manage signups
- [ ] Analytics tracking (PostHog/Plausible)
- [ ] A/B testing for copy variations
- [ ] Custom OG image generation

## License

MIT
