"use client";

import { useState, useMemo } from "react";
import { WorkspaceLayout } from "@/components/workspace/workspace-layout";
import {
  TrendingUp,
  BarChart3,
  Download,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import {
  INITIAL_CAMPAIGNS,
  INITIAL_SPEND,
  MarketingCampaign,
  AdSpendEntry,
} from "@/data/marketing-seed";

const CAMPAIGNS_STORAGE = "versaly_marketing_campaigns_v1";
const SPEND_STORAGE = "versaly_marketing_spend_v1";

export default function MarketingReportsPage() {
  const [campaigns] = useState<MarketingCampaign[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(CAMPAIGNS_STORAGE);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {
        // ignore
      }
    }
    return INITIAL_CAMPAIGNS;
  });

  const [spends] = useState<AdSpendEntry[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(SPEND_STORAGE);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {
        // ignore
      }
    }
    return INITIAL_SPEND;
  });

  const [dateRange, setDateRange] = useState("Launch Push (Oct 15 – Nov 30, 2026)");

  // High-Level Aggregates
  const totalSpend = useMemo(() => spends.reduce((acc, s) => acc + s.amount, 0), [spends]);
  const totalRevenue = useMemo(
    () => campaigns.reduce((acc, c) => acc + c.revenueGenerated, 0),
    [campaigns]
  );
  const totalLeads = useMemo(
    () => campaigns.reduce((acc, c) => acc + c.leadsGenerated, 0),
    [campaigns]
  );
  const totalDealsWon = useMemo(
    () => campaigns.reduce((acc, c) => acc + c.dealsWon, 0),
    [campaigns]
  );
  const totalImpressions = useMemo(
    () => campaigns.reduce((acc, c) => acc + c.impressions, 0),
    [campaigns]
  );
  const totalClicks = useMemo(
    () => campaigns.reduce((acc, c) => acc + c.clicks, 0),
    [campaigns]
  );

  const blendedRoas = useMemo(() => {
    return totalSpend > 0 ? (totalRevenue / totalSpend).toFixed(2) : "0.00";
  }, [totalRevenue, totalSpend]);

  const blendedCac = useMemo(() => {
    return totalDealsWon > 0 ? Math.round(totalSpend / totalDealsWon) : 0;
  }, [totalSpend, totalDealsWon]);

  const costPerLead = useMemo(() => {
    return totalLeads > 0 ? Math.round(totalSpend / totalLeads) : 0;
  }, [totalSpend, totalLeads]);

  // Channel Attribution Table Data
  const channelData = useMemo(() => {
    const map: Record<
      string,
      {
        spend: number;
        impressions: number;
        clicks: number;
        leads: number;
        dealsWon: number;
        revenue: number;
      }
    > = {
      "Billboard / Outdoor": {
        spend: 150000,
        impressions: 480000,
        clicks: 1240,
        leads: 28,
        dealsWon: 2,
        revenue: 240000,
      },
      "Meta Ads (FB/IG)": {
        spend: 24500,
        impressions: 112000,
        clicks: 3450,
        leads: 42,
        dealsWon: 3,
        revenue: 195000,
      },
      "Google Ads": {
        spend: 18200,
        impressions: 38400,
        clicks: 1980,
        leads: 31,
        dealsWon: 4,
        revenue: 140000,
      },
      "TikTok Ads": {
        spend: 12800,
        impressions: 215000,
        clicks: 4120,
        leads: 26,
        dealsWon: 2,
        revenue: 90000,
      },
      "Print & Direct Flyers": {
        spend: 8500,
        impressions: 5000,
        clicks: 0,
        leads: 14,
        dealsWon: 2,
        revenue: 65000,
      },
    };

    return Object.entries(map).map(([channel, data]) => {
      const cpl = data.leads > 0 ? Math.round(data.spend / data.leads) : 0;
      const cac = data.dealsWon > 0 ? Math.round(data.spend / data.dealsWon) : 0;
      const roas = data.spend > 0 ? (data.revenue / data.spend).toFixed(2) : "0.00";
      return { channel, ...data, cpl, cac, roas };
    });
  }, []);

  // Product-Level ROI
  const productData = useMemo(() => {
    return [
      {
        product: "Adversoft",
        channels: "Billboard (Westlands & Ngong Rd) + Agency Outreach",
        spend: 150000,
        leads: 28,
        won: 2,
        revenue: 240000,
        roas: "1.60x",
      },
      {
        product: "Vehisoft",
        channels: "Meta Lead Gen Ads + Kiambu Rd Flyers",
        spend: 33000,
        leads: 56,
        won: 5,
        revenue: 260000,
        roas: "7.88x",
      },
      {
        product: "LipaTim",
        channels: "Google Search (eTIMS) + WhatsApp Retail Check",
        spend: 18200,
        leads: 31,
        won: 4,
        revenue: 140000,
        roas: "7.69x",
      },
      {
        product: "Versandry",
        channels: "TikTok Laundromat Problem Reels",
        spend: 12800,
        leads: 26,
        won: 2,
        revenue: 90000,
        roas: "7.03x",
      },
    ];
  }, []);

  // CSV Export Action
  const handleExportCSV = () => {
    const headers = "Channel,Spend,Impressions,Clicks,Leads,CPL,DealsWon,Revenue,ROAS,CAC\n";
    const rows = channelData
      .map(
        (c) =>
          `"${c.channel}",${c.spend},${c.impressions},${c.clicks},${c.leads},${c.cpl},${c.dealsWon},${c.revenue},${c.roas},${c.cac}`
      )
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `versaly_marketing_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <WorkspaceLayout>
      <div className="space-y-6 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-rose-500/10 text-rose-400 border border-rose-500/20">
                Marketing Intelligence
              </span>
              <span className="text-xs text-slate-500">Attribution & Performance</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-rose-500" />
              <span>Marketing Performance & Attribution Reports</span>
            </h1>
            <p className="text-xs text-slate-400">
              Audit Customer Acquisition Cost (CAC), Return on Ad Spend (ROAS), and full-funnel channel conversion.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-rose-500 font-medium"
            >
              <option value="Launch Push (Oct 15 – Nov 30, 2026)">
                Launch Push (Oct 15 – Nov 30, 2026)
              </option>
              <option value="Last 30 Days">Last 30 Days</option>
              <option value="Year to Date">Year to Date (2026)</option>
            </select>
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition shadow-sm"
            >
              <Download className="h-4 w-4 text-rose-400" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Executive KPI Summary */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          <div className="liquid-glass p-4 rounded-xl border border-slate-800/80 space-y-1">
            <div className="text-[11px] text-slate-400 font-medium">Ad Capital Deployed</div>
            <div className="text-xl font-bold text-white font-mono">
              KES {totalSpend.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-500">Outdoor & Paid Digital</div>
          </div>

          <div className="liquid-glass p-4 rounded-xl border border-slate-800/80 space-y-1">
            <div className="text-[11px] text-slate-400 font-medium">Attributed Won Revenue</div>
            <div className="text-xl font-bold text-emerald-400 font-mono">
              KES {totalRevenue.toLocaleString()}
            </div>
            <div className="text-[10px] text-emerald-500 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              <span>{totalDealsWon} paying clients</span>
            </div>
          </div>

          <div className="liquid-glass p-4 rounded-xl border border-slate-800/80 space-y-1">
            <div className="text-[11px] text-slate-400 font-medium">Blended ROAS</div>
            <div className="text-xl font-bold text-rose-400 font-mono">{blendedRoas}x</div>
            <div className="text-[10px] text-slate-500">Return per KES spent</div>
          </div>

          <div className="liquid-glass p-4 rounded-xl border border-slate-800/80 space-y-1">
            <div className="text-[11px] text-slate-400 font-medium">Customer Acq. Cost (CAC)</div>
            <div className="text-xl font-bold text-amber-400 font-mono">
              KES {blendedCac.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-500">Per paying client</div>
          </div>

          <div className="liquid-glass p-4 rounded-xl border border-slate-800/80 space-y-1">
            <div className="text-[11px] text-slate-400 font-medium">Cost Per Lead (CPL)</div>
            <div className="text-xl font-bold text-indigo-400 font-mono">
              KES {costPerLead.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-500">Total {totalLeads} inquiries</div>
          </div>

          <div className="liquid-glass p-4 rounded-xl border border-slate-800/80 space-y-1">
            <div className="text-[11px] text-slate-400 font-medium">Lead → Deal Win Rate</div>
            <div className="text-xl font-bold text-sky-400 font-mono">
              {totalLeads > 0 ? ((totalDealsWon / totalLeads) * 100).toFixed(1) : 0}%
            </div>
            <div className="text-[10px] text-slate-500">High-intent conversion</div>
          </div>
        </div>

        {/* Marketing Funnel Visualization */}
        <div className="liquid-glass p-5 rounded-2xl border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-rose-400" />
                <span>Multi-Stage Conversion Funnel</span>
              </h3>
              <p className="text-xs text-slate-400">
                Track how billboards and digital traffic cascade down to paying client contracts
              </p>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              {dateRange}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-2">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                1. Eyeballs & Impressions
              </div>
              <div className="text-lg font-bold text-white font-mono">
                {totalImpressions.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-500">
                Westlands & Ngong Rd Billboards + Meta/TikTok feeds
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                2. Clicks & QR Scans
              </div>
              <div className="text-lg font-bold text-sky-400 font-mono">
                {totalClicks.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-500">
                1.27% CTR / engagement rate
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                3. Qualified Inbound Leads
              </div>
              <div className="text-lg font-bold text-indigo-400 font-mono">
                {totalLeads}
              </div>
              <div className="text-[10px] text-slate-500">
                WhatsApp inquiries & form audits
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                4. Demos & Free Audits
              </div>
              <div className="text-lg font-bold text-amber-400 font-mono">
                {Math.round(totalLeads * 0.32)}
              </div>
              <div className="text-[10px] text-slate-500">
                32% Demo booking rate
              </div>
            </div>

            <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30 space-y-1.5">
              <div className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">
                5. Paying Clients Won
              </div>
              <div className="text-lg font-bold text-rose-400 font-mono">
                {totalDealsWon}
              </div>
              <div className="text-[10px] text-slate-400">
                KES {totalRevenue.toLocaleString()} collected
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Channel Attribution Table */}
        <div className="liquid-glass rounded-2xl border border-slate-800/80 overflow-hidden">
          <div className="p-4 border-b border-slate-800/80">
            <h3 className="text-sm font-bold text-white">Channel Efficiency & Unit Economics</h3>
            <p className="text-xs text-slate-400">
              Breakdown of spend, lead efficiency, CPL, customer acquisition cost, and net ROAS
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950/60 text-slate-400 text-[10px] uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Channel</th>
                  <th className="py-3 px-4">Spend (KES)</th>
                  <th className="py-3 px-4">Impressions / Scans</th>
                  <th className="py-3 px-4">Leads</th>
                  <th className="py-3 px-4">Cost / Lead (CPL)</th>
                  <th className="py-3 px-4">Clients Won</th>
                  <th className="py-3 px-4">Revenue (KES)</th>
                  <th className="py-3 px-4">ROAS</th>
                  <th className="py-3 px-4 text-right">CAC (KES)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {channelData.map((row) => (
                  <tr key={row.channel} className="hover:bg-slate-900/30 transition">
                    <td className="py-3.5 px-4 font-semibold text-white">
                      {row.channel}
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      KES {row.spend.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-400">
                      {row.impressions.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-indigo-400 font-semibold">
                      {row.leads}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-amber-400">
                      KES {row.cpl.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-white font-semibold">
                      {row.dealsWon}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-emerald-400 font-bold">
                      KES {row.revenue.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-rose-400 font-semibold">
                      {row.roas}x
                    </td>
                    <td className="py-3.5 px-4 font-mono text-right font-medium">
                      KES {row.cac.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Product-Level Marketing Performance Matrix */}
        <div className="liquid-glass rounded-2xl border border-slate-800/80 p-5 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white">Product-Level Marketing Performance</h3>
            <p className="text-xs text-slate-400">
              Which product offerings yield the fastest payback on marketing investment
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {productData.map((item) => (
              <div
                key={item.product}
                className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2.5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{item.product}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                      {item.roas} ROAS
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">
                    {item.channels}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800 space-y-1 text-[11px] font-mono">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Invested:</span>
                    <span className="text-white">KES {item.spend.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Inbound Leads:</span>
                    <span className="text-indigo-400">{item.leads} leads</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Won Revenue:</span>
                    <span className="text-emerald-400 font-bold">
                      KES {item.revenue.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Strategic Marketing Insights */}
        <div className="liquid-glass p-5 rounded-2xl border border-slate-800/80 space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">
              Executive Launch Marketing Takeaways
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-300">
            <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/60 space-y-1">
              <span className="font-semibold text-rose-400">1. Billboards Establish Market Legitimacy</span>
              <p className="text-[11px] text-slate-400">
                While digital ads harvest leads quickly, the Westlands and Ngong Road billboards give Versaly credibility when reps walk into car yards and agency offices.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/60 space-y-1">
              <span className="font-semibold text-sky-400">2. Vehisoft Meta Ads: Highest Volume Lead Engine</span>
              <p className="text-[11px] text-slate-400">
                Automotive dealership lead ads generated 42 qualified leads at only KES 583 per lead. Highly scalable into Mombasa and Nakuru showrooms.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/60 space-y-1">
              <span className="font-semibold text-emerald-400">3. Daily Content Multiplier</span>
              <p className="text-[11px] text-slate-400">
                Consistent daily posting on LinkedIn and X generated 15 direct inbound inquiries with KES 0 media cost, reinforcing organic compound growth.
              </p>
            </div>
          </div>
        </div>
      </div>
    </WorkspaceLayout>
  );
}
