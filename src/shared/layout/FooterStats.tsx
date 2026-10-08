"use client";

import { useEffect, useState } from "react";

import { Activity, Calendar, Database, Users } from "lucide-react";

interface FooterStatsData {
  online: number;
  today: number;
  yesterday: number;
  total: number;
}

const MIN_TOTAL_VISITS_TO_SHOW = 1000;

export default function FooterStats() {
  const [stats, setStats] = useState<FooterStatsData | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadStats() {
      try {
        const response = await fetch("/site-stats", {
          signal: controller.signal,
        });

        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as FooterStatsData;

        setStats(data);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        console.error("[FOOTER_STATS_CLIENT_ERROR]", error);
      }
    }

    void loadStats();

    return () => {
      controller.abort();
    };
  }, []);

  if (!stats || stats.total < MIN_TOTAL_VISITS_TO_SHOW) {
    return null;
  }

  return (
    <section
      aria-label="Site ziyaret istatistikleri"
      className="relative mb-10 grid grid-cols-2 gap-4 overflow-hidden rounded-2xl border border-slate-800 bg-[#1e293b] p-6 shadow-lg md:grid-cols-4"
    >
      <div
        className="absolute top-0 right-0 h-32 w-32 rounded-full bg-sky-500/5 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative z-10 flex items-center justify-center gap-3 border-r border-slate-800/50 md:justify-start">
        <div className="relative rounded-xl bg-emerald-500/10 p-3 text-emerald-400">
          <span
            className="absolute top-1 right-1 h-2 w-2 animate-ping rounded-full bg-emerald-500 motion-reduce:animate-none"
            aria-hidden="true"
          />

          <Activity size={20} aria-hidden="true" />
        </div>

        <div>
          <p className="text-xl font-bold tracking-tight text-white">
            {stats.online.toLocaleString("tr-TR")}
          </p>

          <p className="text-xs font-medium text-slate-400">Çevrimiçi</p>
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-center gap-3 md:justify-start md:border-r md:border-slate-800/50">
        <div className="rounded-xl bg-amber-500/10 p-3 text-amber-400">
          <Calendar size={20} aria-hidden="true" />
        </div>

        <div>
          <p className="text-xl font-bold tracking-tight text-white">
            {stats.today.toLocaleString("tr-TR")}
          </p>

          <p className="text-xs font-medium text-slate-400">Bugün</p>
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-center gap-3 border-r border-slate-800/50 md:justify-start">
        <div className="rounded-xl bg-indigo-500/10 p-3 text-indigo-400">
          <Users size={20} aria-hidden="true" />
        </div>

        <div>
          <p className="text-xl font-bold tracking-tight text-white">
            {stats.yesterday.toLocaleString("tr-TR")}
          </p>

          <p className="text-xs font-medium text-slate-400">Dün</p>
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-center gap-3 md:justify-start">
        <div className="rounded-xl bg-sky-500/10 p-3 text-sky-400">
          <Database size={20} aria-hidden="true" />
        </div>

        <div>
          <p className="text-xl font-bold tracking-tight text-white">
            {stats.total.toLocaleString("tr-TR")}
          </p>

          <p className="text-xs font-medium text-slate-400">Toplam Ziyaret</p>
        </div>
      </div>
    </section>
  );
}
