# ClipNet Web

Two-sided clip campaign marketplace — brands launch campaigns, clippers earn per 1,000 views.

## Tech Stack

- **Next.js 16** (App Router) + **TypeScript**
- **Firebase Auth** — email/password
- **Cloud Firestore** — shared with iOS app
- **Firebase Cloud Functions v2** — Node.js 20
- **Tailwind CSS v4** — design tokens via CSS variables
- **shadcn/ui** — base primitives
- **Stripe** — campaign billing + Connect payouts
- **Resend** — transactional email
- **Zustand** — client auth state
- **React Hook Form + Zod v4** — forms and validation

## Getting Started

### 1. Install dependencies

```bash
cd clipnet-web
npm install
```

### 2. Configure environment

```bash
cp .env.local.example .env.local
# Fill in Firebase, Stripe, and Resend credentials
```

### 3. Start Firebase emulators

```bash
npm install -g firebase-tools
firebase emulators:start
```

### 4. Seed the database (emulator must be running)

```bash
npx ts-node --esm scripts/seed.ts
```

### 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
app/
  (auth)/            Login + signup pages
  (brand)/           Brand dashboard, campaigns, analytics, settings
  (clipper)/         Browse, clips, earnings, account
  api/               REST API routes (campaigns, clips, payouts, webhooks)
  page.tsx           Landing page (dark navy theme)

components/
  shared/            Sidebar, TopNav, StatusBadge, PlatformTag, etc.
  brand/             CampaignTable, CreateCampaignModal, CapProgressBar, etc.
  clipper/           CampaignCard, ClipSubmitModal, EarningsSummaryCard, etc.

lib/
  firebase/          client.ts, server.ts, converters.ts, authMiddleware.ts
  hooks/             useAuth, useCampaigns, useClips, useEarnings
  store/             authStore (Zustand)
  types/             Shared TypeScript interfaces
  utils/             format.ts, validators.ts, urlParsers.ts

functions/           Firebase Cloud Functions (separate package)
  src/
    campaigns/       onCreate, onUpdate Firestore triggers
    clips/           onCreate, onUpdate Firestore triggers
    scheduled/       pollViews (every 6h), processPayouts (daily 2am UTC)
    stripe/          webhook, connectOnboard, createPaymentIntent

scripts/
  seed.ts            Dev seed: 2 brands, 3 clippers, 5 campaigns, 15 clips
```

## Design Tokens

CSS variables prefixed `--cn-*`, available as Tailwind utilities (`bg-cn-navy`, `text-cn-amber`, etc.):

| Token    | Hex       | Usage                    |
|----------|-----------|--------------------------|
| Navy     | `#0A1628` | Dark backgrounds, sidebar |
| Amber    | `#F5A623` | Primary CTA, brand color  |
| Teal     | `#10B9A7` | Success accents, FTC badge|
| Success  | `#22C55E` | Active status             |
| Danger   | `#EF4444` | Error / rejected states   |

## FTC Compliance

Enforced at four independent layers:
1. **Firestore security rule** — `ftcConfirmed == true`
2. **API route** — rejects requests where `ftcConfirmed !== true`
3. **Zod schema** — `z.literal(true)` (not just boolean)
4. **UI** — required checkbox with non-bypassable label in submit modal

## Cloud Functions

| Function           | Trigger         | Description                             |
|--------------------|-----------------|------------------------------------------|
| `onClipCreated`    | Firestore write | Increments campaign counters             |
| `onClipUpdated`    | Firestore write | Recalculates earnings, detects cap       |
| `onCampaignCreated`| Firestore write | Updates `stats/public` active count      |
| `onCampaignUpdated`| Firestore write | Updates active campaign count            |
| `pollViews`        | Every 6 hours   | Fetches view counts from platform APIs   |
| `processPayouts`   | Daily 2am UTC   | Triggers Stripe payouts for eligible ≥$50|
| `stripeWebhook`    | HTTPS           | Handles transfer.created/paid/failed     |
| `connectOnboard`   | Callable        | Returns Stripe Connect onboarding URL    |

## Deploy

```bash
# Cloud Functions
cd functions && npm install && npm run deploy

# Firestore rules + indexes
firebase deploy --only firestore

# Next.js (Vercel)
vercel --prod
```
