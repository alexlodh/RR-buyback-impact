"use client";

import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  BanknoteArrowDown,
  Calculator,
  CandlestickChart,
  CirclePercent,
  Factory,
  PoundSterling,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DEFAULT_BUYBACK_BUDGET_GBP,
  DEFAULT_SCENARIOS,
  DEFAULT_SHARE_PRICE_PENCE,
  PRICE_MAX,
  PRICE_MIN,
  DEFAULT_SHARES_OUTSTANDING,
  cancellationPct,
  impliedMarketCap,
  ownershipPctAfter,
  ownershipPctBefore,
  relativeStakeIncrease,
  sharesAfterBuyback,
  sharesRepurchased,
} from "@/lib/buyback";

function formatInteger(value: number) {
  return new Intl.NumberFormat("en-GB", {
    maximumFractionDigits: 0,
  }).format(value);
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPct(value: number, digits = 2) {
  return new Intl.NumberFormat("en-GB", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

function formatPence(value: number) {
  return `${new Intl.NumberFormat("en-GB", {
    maximumFractionDigits: 0,
  }).format(value)}p`;
}

export function BuybackDashboard() {
  const [sharePricePence, setSharePricePence] = useState(DEFAULT_SHARE_PRICE_PENCE);
  const [sharesHeld, setSharesHeld] = useState(10_000);

  const buybackBudget = DEFAULT_BUYBACK_BUDGET_GBP;
  const sharesOutstanding = DEFAULT_SHARES_OUTSTANDING;

  const metrics = useMemo(() => {
    const sharesBought = sharesRepurchased(buybackBudget, sharePricePence);
    const cancelledPct = cancellationPct(sharesBought, sharesOutstanding);
    const remainingShares = sharesAfterBuyback(sharesOutstanding, sharesBought);
    const stakeIncreasePct = relativeStakeIncrease(
      sharesHeld,
      sharesOutstanding,
      sharesBought,
    );
    const beforePct = ownershipPctBefore(sharesHeld, sharesOutstanding);
    const afterPct = ownershipPctAfter(sharesHeld, sharesOutstanding, sharesBought);
    const marketCap = impliedMarketCap(sharePricePence, sharesOutstanding);

    return {
      sharesBought,
      cancelledPct,
      remainingShares,
      stakeIncreasePct,
      beforePct,
      afterPct,
      marketCap,
    };
  }, [buybackBudget, sharePricePence, sharesHeld, sharesOutstanding]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(232,240,255,0.95),_rgba(255,255,255,1)_45%),linear-gradient(135deg,_#fbfcfe,_#eef4f7)] text-slate-950">
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <Card className="overflow-hidden border-slate-200/80 bg-white/85 shadow-[0_20px_80px_-40px_rgba(15,23,42,0.45)] backdrop-blur">
            <CardContent className="flex h-full flex-col gap-8 p-8">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-4">
                  <Badge className="rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white hover:bg-slate-900">
                    Rolls-Royce Holdings plc · FY2026 buyback model
                  </Badge>
                  <div className="space-y-3">
                    <h1 className="max-w-3xl font-serif text-4xl tracking-tight text-slate-950 sm:text-5xl">
                      Estimate how many Rolls-Royce shares could be cancelled in
                      FY2026 and what that means for your stake.
                    </h1>
                    <p className="max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                      Adjust the assumed average execution price and your holding size
                      to estimate shares repurchased, cancellation percentage, and the
                      relative uplift in your proportional ownership.
                    </p>
                  </div>
                </div>
                <div className="hidden rounded-3xl border border-slate-200 bg-slate-50 p-4 lg:block">
                  <div className="grid gap-3 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <Factory className="h-4 w-4 text-sky-700" />
                      FY2026 announced buyback: {formatMoney(DEFAULT_BUYBACK_BUDGET_GBP)}
                    </div>
                    <div className="flex items-center gap-2">
                      <CandlestickChart className="h-4 w-4 text-sky-700" />
                      Shares outstanding reference: {formatInteger(DEFAULT_SHARES_OUTSTANDING)}
                    </div>
                    <div className="flex items-center gap-2">
                      <BanknoteArrowDown className="h-4 w-4 text-sky-700" />
                      Price input uses London listing pence values
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard
                  icon={<BanknoteArrowDown className="h-5 w-5 text-sky-700" />}
                  label="Shares repurchased"
                  value={formatInteger(metrics.sharesBought)}
                  detail="Approximate shares bought back with the chosen budget and price"
                />
                <MetricCard
                  icon={<CirclePercent className="h-5 w-5 text-sky-700" />}
                  label="Shares cancelled"
                  value={`${formatPct(metrics.cancelledPct)}%`}
                  detail="Estimated reduction in shares outstanding"
                />
                <MetricCard
                  icon={<ArrowUpRight className="h-5 w-5 text-sky-700" />}
                  label="Relative stake increase"
                  value={`${formatPct(metrics.stakeIncreasePct)}%`}
                  detail="Increase in your proportional ownership if your share count stays constant"
                />
                <MetricCard
                  icon={<PoundSterling className="h-5 w-5 text-sky-700" />}
                  label="Implied market valuation"
                  value={formatMoney(metrics.marketCap)}
                  detail="Shares outstanding multiplied by assumed average price"
                  compactValue
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/80 bg-slate-950 text-white shadow-[0_20px_80px_-40px_rgba(2,8,23,0.8)]">
            <CardHeader className="space-y-3 pb-2">
              <Badge className="w-fit rounded-full border border-white/15 bg-white/10 text-white hover:bg-white/10">
                Personal holding lens
              </Badge>
              <CardTitle className="font-serif text-3xl tracking-tight">
                Your ownership before and after cancellation.
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <OwnershipBlock
                  label="Before buyback"
                  value={`${formatPct(metrics.beforePct, 5)}%`}
                  helper={`${formatInteger(sharesHeld)} shares out of ${formatInteger(sharesOutstanding)}`}
                />
                <OwnershipBlock
                  label="After buyback"
                  value={`${formatPct(metrics.afterPct, 5)}%`}
                  helper={`${formatInteger(sharesHeld)} shares out of ${formatInteger(metrics.remainingShares)}`}
                />
              </div>
              <Separator className="bg-white/10" />
              <div className="space-y-2">
                <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
                  Relative uplift
                </p>
                <p className="font-serif text-5xl text-white">
                  {formatPct(metrics.stakeIncreasePct)}%
                </p>
                <p className="max-w-sm text-sm leading-6 text-slate-300">
                  This is the increase in your fraction of Rolls-Royce if the company
                  buys and cancels the estimated number of shares while you keep the
                  same number of shares.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Card className="border-slate-200/80 bg-white/90 shadow-[0_18px_60px_-40px_rgba(15,23,42,0.5)] backdrop-blur">
            <CardHeader>
              <CardTitle className="font-serif text-2xl">Assumptions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <FieldSection
                label="Average repurchase price"
                value={formatPence(sharePricePence)}
                tooltip="The average price paid per share across the buyback programme."
              >
                <Input
                  type="number"
                  min={PRICE_MIN}
                  max={PRICE_MAX}
                  step={1}
                  value={sharePricePence}
                  onChange={(event) => setSharePricePence(Number(event.target.value) || 0)}
                />
              </FieldSection>

              <FieldSection
                label="FY2026 buyback budget"
                value={formatMoney(buybackBudget)}
                tooltip="Fixed capital allocated to the FY2026 repurchase programme."
              >
                <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                  Fixed at {formatMoney(buybackBudget)}
                </p>
              </FieldSection>

              <FieldSection
                label="Shares outstanding"
                value={formatInteger(sharesOutstanding)}
                tooltip="Reference share count used as the starting point before any FY2026 cancellation."
              >
                <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                  Fixed at {formatInteger(sharesOutstanding)}
                </p>
              </FieldSection>

              <FieldSection
                label="Your shares held"
                value={formatInteger(sharesHeld)}
                tooltip="Your personal holding used to estimate ownership before and after the cancellation."
              >
                <Input
                  type="number"
                  min={0}
                  step={1}
                  value={sharesHeld}
                  onChange={(event) => setSharesHeld(Number(event.target.value) || 0)}
                />
              </FieldSection>
            </CardContent>
          </Card>

          <Card className="border-slate-200/80 bg-[linear-gradient(180deg,_rgba(255,255,255,0.96),_rgba(248,250,252,0.96))] shadow-[0_18px_60px_-40px_rgba(15,23,42,0.5)] backdrop-blur">
            <CardHeader className="space-y-3">
              <CardTitle className="font-serif text-2xl">Scenario dashboard</CardTitle>
              <p className="text-sm leading-6 text-slate-600">
                Compare a few price assumptions while the buyback budget stays fixed.
              </p>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="scenarios" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 bg-slate-100">
                  <TabsTrigger value="scenarios">Preset scenarios</TabsTrigger>
                  <TabsTrigger value="formula">Formula</TabsTrigger>
                </TabsList>

                <TabsContent value="scenarios" className="space-y-4">
                  {DEFAULT_SCENARIOS.map((scenario) => {
                    const scenarioSharesBought = sharesRepurchased(
                      scenario.budgetGbp,
                      scenario.pricePence,
                    );
                    const scenarioCancelled = cancellationPct(
                      scenarioSharesBought,
                      sharesOutstanding,
                    );
                    const scenarioStakeIncrease = relativeStakeIncrease(
                      sharesHeld,
                      sharesOutstanding,
                      scenarioSharesBought,
                    );

                    return (
                      <div
                        key={scenario.label}
                        className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-[0.8fr_1fr_1fr_1fr]"
                      >
                        <div>
                          <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                            {scenario.label}
                          </p>
                          <p className="mt-1 font-serif text-2xl text-slate-950">
                            {formatPence(scenario.pricePence)}
                          </p>
                          <p className="text-sm text-slate-500">
                            {formatMoney(scenario.budgetGbp)} budget
                          </p>
                        </div>
                        <ScenarioStat
                          label="Repurchased"
                          value={formatInteger(scenarioSharesBought)}
                        />
                        <ScenarioStat
                          label="Cancelled"
                          value={`${formatPct(scenarioCancelled)}%`}
                        />
                        <ScenarioStat
                          label="Stake uplift"
                          value={`${formatPct(scenarioStakeIncrease)}%`}
                        />
                      </div>
                    );
                  })}
                </TabsContent>

                <TabsContent value="formula" className="space-y-4 rounded-2xl border border-dashed border-slate-300 bg-white p-5">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Calculator className="h-4 w-4" />
                    <p className="text-sm font-medium">Model equations</p>
                  </div>
                  <div className="space-y-4 text-sm leading-7 text-slate-600">
                    <p>
                      Shares repurchased = Buyback budget / Average repurchase price
                    </p>
                    <p>
                      Cancellation percentage = Shares repurchased / Shares outstanding
                    </p>
                    <p>
                      Relative increase in stake =
                      ((ownership after - ownership before) / ownership before) × 100
                    </p>
                    <p>
                      Ownership before = Shares held / Shares outstanding
                    </p>
                    <p>
                      Ownership after = Shares held / (Shares outstanding - Shares repurchased)
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  detail,
  compactValue,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  detail: string;
  compactValue?: boolean;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50/90 p-5">
      <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50">
        {icon}
      </div>
      <p className="text-sm text-slate-600">{label}</p>
      <p
        className={
          compactValue
            ? "mt-2 break-words font-serif text-xl leading-tight text-slate-950 sm:text-2xl"
            : "mt-2 font-serif text-3xl text-slate-950"
        }
      >
        {value}
      </p>
      <p className="mt-3 text-sm leading-6 text-slate-500">{detail}</p>
    </div>
  );
}

function OwnershipBlock({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-3 font-serif text-3xl text-white">{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-300">{helper}</p>
    </div>
  );
}

function FieldSection({
  label,
  value,
  tooltip,
  children,
}: {
  label: string;
  value: string;
  tooltip: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Label className="text-sm font-medium text-slate-800">{label}</Label>
          <Tooltip>
            <TooltipTrigger className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-slate-300 text-xs text-slate-500">
              ?
            </TooltipTrigger>
            <TooltipContent className="max-w-xs text-sm leading-6">
              {tooltip}
            </TooltipContent>
          </Tooltip>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">
          {value}
        </span>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function ScenarioStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-3 text-xl font-semibold text-slate-950">{value}</p>
    </div>
  );
}
