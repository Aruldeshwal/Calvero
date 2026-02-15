# Calvero – Smart Scheduling Platform

Calvero is a modern full-stack scheduling application built with **Next.js 16** and **React 19**, integrating secure authentication, a headless CMS, and Google Calendar synchronization.

It combines:

- Authentication via Clerk  
- Content management via Sanity  
- Google Calendar integration  
- Modern UI with Tailwind CSS + shadcn  
- Serverless backend using Next.js App Router  

---

## 🚀 Tech Stack

### Core Framework
- Next.js 16 (App Router)
- React 19
- TypeScript

### Authentication
- Clerk (`@clerk/nextjs`)

### CMS
- Sanity
- next-sanity
- Sanity Vision

### Calendar Integration
- Google Calendar API (`googleapis`)
- react-big-calendar
- date-fns
- date-fns-tz

### UI & Styling
- Tailwind CSS v4
- shadcn/ui
- Radix UI
- styled-components
- lucide-react
- class-variance-authority
- clsx
- tailwind-merge

### Tooling
- Biome (lint + format)
- TypeScript
- Sanity type generation

---

## 🏗 Architecture Overview

Calvero uses a serverless full-stack architecture:

Frontend + Backend:
- Next.js App Router
- API routes inside `/app/api`
- Server components & server actions

External Services:
- Clerk → Authentication  
- Sanity → Content management  
- Google OAuth → Calendar sync  

Deployment:
- Vercel (single platform deployment)

No separate Express server. No Render required.

---

## 📂 Project Structure (High Level)

```
app/
 ├── api/                # API routes (Google OAuth, calendar logic)
 ├── (auth)/             # Authentication flows
 ├── dashboard/          # Main scheduling UI
 └── layout.tsx          # Root layout

sanity/
 ├── schema/             # CMS schema definitions
 └── config/             # Sanity configuration

lib/
 ├── sanity/             # Sanity client setup
 ├── google/             # Google OAuth logic
 └── utils/              # Helpers

components/
 ├── ui/                 # Reusable UI components
 └── calendar/           # Calendar components
```

---

## 🔐 Environment Variables

Create a `.env.local` file for development:

```
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx

# Sanity
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=your_sanity_token

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/calendar/callback
```

### Production (Vercel)

Add all variables in:

Vercel → Project → Settings → Environment Variables

Change only:

```
GOOGLE_REDIRECT_URI=https://your-project.vercel.app/api/calendar/callback
```

If staying on Clerk Development instance, keep `pk_test_` keys.

Never commit:
- CLERK_SECRET_KEY
- SANITY_API_TOKEN
- GOOGLE_CLIENT_SECRET

---

## 🧠 Features

- Secure authentication with Clerk
- Protected routes
- Google Calendar OAuth integration
- Calendar event syncing
- Dynamic scheduling UI
- CMS-driven content via Sanity
- Type-safe schema generation
- Modern responsive UI

---

## 🛠 Local Development

Install dependencies:

```bash
npm install
```

Run development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Start production server locally:

```bash
npm start
```

Generate Sanity types:

```bash
npm run typegen
```

Lint project:

```bash
npm run lint
```

Format project:

```bash
npm run format
```

---

## 🔑 Google OAuth Setup

1. Go to Google Cloud Console  
2. Create OAuth 2.0 Client ID  
3. Add:

Authorized JavaScript origins:
```
http://localhost:3000
https://your-project.vercel.app
```

Authorized redirect URIs:
```
http://localhost:3000/api/calendar/callback
https://your-project.vercel.app/api/calendar/callback
```

Without this configuration, OAuth will fail.

---

## ☁ Deployment (Vercel)

1. Push project to GitHub  
2. Import into Vercel  
3. Add environment variables  
4. Deploy  

No separate backend required.

---

## 🔒 Security Notes

- Secrets must only exist in environment variables  
- Do not expose backend tokens to client components  
- Use server components for sensitive operations  
- Restrict Sanity token permissions  

---

## 📈 Future Improvements

- Background job handling for calendar sync  
- Webhook-based event updates  
- Role-based access control  
- Email notifications  
- Analytics dashboard  
- Custom domain + Clerk production instance  

---

## 📄 License

This project is private and intended for educational and portfolio purposes.
