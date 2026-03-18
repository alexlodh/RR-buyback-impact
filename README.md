# RR Buyback Impact Dashboard

Interactive dashboard for estimating the effect of the announced Rolls-Royce FY2026 share buyback on total shares outstanding and on an individual shareholder's ownership percentage.

## What this app does

- Models how many shares can be repurchased from a fixed buyback budget at an assumed average execution price.
- Estimates the percentage of shares cancelled and remaining shares outstanding.
- Calculates your ownership percentage before and after cancellation for a custom holding size.
- Shows relative stake uplift if your share count remains unchanged.
- Compares preset bear/base/bull price scenarios.

## Model assumptions

The dashboard currently uses fixed reference values from `src/lib/buyback.ts`:

- Shares outstanding: `8,327,863,498`
- FY2026 buyback budget: `GBP 2,500,000,000`
- Default share price: `1250p`
- Price input bounds: `200p` to `2000p`

User-adjustable inputs:

- Average repurchase price (pence)
- Your shares held

## Core formulas

- Shares repurchased = Buyback budget / Average repurchase price
- Cancellation percentage = Shares repurchased / Shares outstanding
- Ownership before = Shares held / Shares outstanding
- Ownership after = Shares held / (Shares outstanding - Shares repurchased)
- Relative stake increase = ((ownership after - ownership before) / ownership before) x 100

## Tech stack

- Next.js 16 (App Router)
- React 19 + TypeScript
- Tailwind CSS 4
- shadcn/ui components

## Running locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Available scripts

```bash
npm run dev    # Start development server
npm run build  # Production build
npm run start  # Run production server
npm run lint   # Run ESLint
```

## Notes

- This tool is a scenario model for estimation and exploration.
- It is not investment advice.
