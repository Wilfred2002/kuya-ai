# Kuya AI - Landing Page

A beautiful, minimalistic landing page with matcha green theme for Kuya AI.

**Headline:** "We're making AI **native** to group conversations."

## Design Features

- **Matcha Green Theme**: Soft, calming green palette inspired by matcha tea
- **Strategic Typography**: Mix of light and semibold weights with purposeful capitalization
- **Smooth Animations**: Subtle fade-in effects for engaging user experience
- **Glass Morphism**: Backdrop blur effects on feature cards and footer
- **Responsive Design**: Beautiful on mobile, tablet, and desktop
- **Modern Components**: Header, hero section, feature highlights, and footer

## Features

- Clean, minimal design centered around the core message
- Email waitlist collection with validation
- Real-time form feedback with matcha-themed success/error states
- Three feature highlights (Remembers, Whispers, Summarizes)
- Secure email storage
- SEO optimized with Open Graph and Twitter metadata

## Getting Started

### Install dependencies

```bash
npm install
```

### Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for production

```bash
npm run build
npm start
```

## Deployment

### Deploy to Vercel (Recommended)

1. Push to GitHub
2. Connect repository to Vercel
3. Deploy automatically

Or use Vercel CLI:

```bash
npm i -g vercel
vercel
```

## Color Palette

The matcha green color scheme:

- **Background**: `#fafdf8` - Soft off-white with green tint
- **Foreground**: `#1a3a1a` - Deep forest green
- **Matcha 500**: `#5a9e4d` - Primary brand green
- **Matcha 600**: `#4a8441` - Button/interactive green
- **Matcha 700**: `#3d6a36` - Hover states
- **Accent**: `#8bb885` - Light accent green

## Waitlist Management

Emails are stored in `data/waitlist.json` (excluded from git).

### View signups

```bash
cat data/waitlist.json
```

### Export to CSV

```bash
node -e "console.log(JSON.parse(require('fs').readFileSync('data/waitlist.json')).map(e => e.email).join('\n'))" > emails.txt
```

## Tech Stack

- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS v4** with custom theme
- **Geist Font Family** by Vercel
- File-based storage (easily upgradeable to database)

## Project Structure

```
landing/
├── app/
│   ├── api/
│   │   └── waitlist/
│   │       └── route.ts       # Waitlist API endpoint
│   ├── layout.tsx             # Root layout with metadata & SEO
│   ├── page.tsx               # Main landing page with header & footer
│   └── globals.css            # Matcha theme + animations
├── data/
│   └── waitlist.json          # Email storage (gitignored)
└── README.md
```

## Customization

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

Edit `app/page.tsx` to change headlines, descriptions, or feature cards.

### Update Social Links

Update footer links in `app/page.tsx` to point to your actual social profiles.

## Future Enhancements

- [ ] Connect to Supabase/PostgreSQL for scalable storage
- [ ] Email confirmation via SendGrid/Resend
- [ ] Admin dashboard to manage signups
- [ ] Analytics tracking (PostHog/Plausible)
- [ ] A/B testing for copy variations
- [ ] Custom OG image generation
- [ ] Animated hero graphics or illustrations
- [ ] Video demo section

## License

MIT
