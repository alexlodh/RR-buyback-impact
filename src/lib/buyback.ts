// ──────────────────────────────────────────────────────────────────────────────
// Rolls-Royce Holdings plc — FY2026 Share Buyback Impact Calculator
//
// Reference data sourced from:
//   • RR FY2025 Annual Results (published 27 Feb 2026)
//   • FY2025 Annual Report & Accounts 2025
//
// Key facts used in this dashboard:
//   - Shares in issue at period start: 8 327 863 498
//   - FY2026 buyback budget: £2 500 000 000
//   - FY2025 FCF outturn: £2.6 bn; FY2026 FCF guidance: £2.7–3.1 bn
//   - Trading currency: GBX (pence sterling) on the London Stock Exchange
//
// All monetary values in the model are in GBP (£); prices in pence (p).
// ──────────────────────────────────────────────────────────────────────────────

/** Initial shares outstanding used for FY2026 calculations */
export const DEFAULT_SHARES_OUTSTANDING = 8_327_863_498;

/** Fixed FY2026 buyback budget (£) */
export const DEFAULT_BUYBACK_BUDGET_GBP = 2_500_000_000;

/** Indicative share price at time of results announcement (pence) */
export const DEFAULT_SHARE_PRICE_PENCE = 1250;

/** Bounds for numeric inputs */
export const PRICE_MIN = 200;
export const PRICE_MAX = 2_000;

// ──────────────────────────────────────────────────────────────────────────────
// Core calculation functions
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Number of shares that can be repurchased given a budget and price.
 * @param budgetGbp  Total buyback budget in pounds sterling
 * @param pricePence Share price in pence
 */
export function sharesRepurchased(budgetGbp: number, pricePence: number): number {
  if (pricePence <= 0) return 0;
  const priceGbp = pricePence / 100;
  return Math.floor(budgetGbp / priceGbp);
}

/**
 * Percentage of total shares outstanding that will be cancelled.
 */
export function cancellationPct(bought: number, totalShares: number): number {
  if (totalShares <= 0) return 0;
  return (bought / totalShares) * 100;
}

/**
 * Remaining shares after cancellation.
 */
export function sharesAfterBuyback(totalShares: number, bought: number): number {
  return Math.max(totalShares - bought, 0);
}

/**
 * Relative increase in a shareholder's proportional stake.
 *
 * Stake before = userShares / totalShares
 * Stake after  = userShares / (totalShares - bought)
 * Relative increase = (after - before) / before  ×  100
 */
export function relativeStakeIncrease(
  userShares: number,
  totalShares: number,
  bought: number,
): number {
  if (userShares <= 0 || totalShares <= 0) return 0;
  const before = userShares / totalShares;
  const remaining = sharesAfterBuyback(totalShares, bought);
  if (remaining <= 0) return 0;
  const after = userShares / remaining;
  return ((after - before) / before) * 100;
}

/** Absolute ownership percentage before buyback */
export function ownershipPctBefore(userShares: number, totalShares: number): number {
  if (totalShares <= 0) return 0;
  return (userShares / totalShares) * 100;
}

/** Absolute ownership percentage after buyback */
export function ownershipPctAfter(
  userShares: number,
  totalShares: number,
  bought: number,
): number {
  const remaining = sharesAfterBuyback(totalShares, bought);
  if (remaining <= 0) return 0;
  return (userShares / remaining) * 100;
}

/**
 * Implied market cap at a given price.
 * @param pricePence  Share price in pence
 * @param shares      Shares outstanding
 */
export function impliedMarketCap(pricePence: number, shares: number): number {
  return (pricePence / 100) * shares;
}

// ──────────────────────────────────────────────────────────────────────────────
// Scenario helpers
// ──────────────────────────────────────────────────────────────────────────────

export interface Scenario {
  label: string;
  pricePence: number;
  budgetGbp: number;
}

export const DEFAULT_SCENARIOS: Scenario[] = [
  { label: "Bear", pricePence: 1050, budgetGbp: DEFAULT_BUYBACK_BUDGET_GBP },
  { label: "Base", pricePence: 1256, budgetGbp: DEFAULT_BUYBACK_BUDGET_GBP },
  { label: "Bull", pricePence: 1400, budgetGbp: DEFAULT_BUYBACK_BUDGET_GBP },
];
