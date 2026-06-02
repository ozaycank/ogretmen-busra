import React, { Suspense } from "react";
import { Metadata } from "next";
import StatCards from "@/components/features/admin/dashboard/StatCards";
import PendingQueue from "@/components/features/admin/dashboard/PendingQueue";
import AnalyticsChartWrapper from "@/components/features/admin/dashboard/AnalyticsChartWrapper";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Admin Dashboard | Büşra Öğretmen",
};

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Dashboard</h1>
        <p className="text-slate-500 mt-1">Sistem istatistikleri ve onay bekleyen materyaller.</p>
      </div>

      {/* 1. İstatistik Kartları (Parallel Fetching) */}
      <Suspense fallback={<SkeletonArea height="h-32" />}>
        <StatCards />
      </Suspense>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        {/* 2. Grafik Alanı (2 Sütun Kaplar) */}
        <div className="xl:col-span-2 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Son 7 Günlük İndirme Analizi</h2>
          <Suspense fallback={<SkeletonArea height="h-80" />}>
            <AnalyticsChartWrapper />
          </Suspense>
        </div>

        {/* 3. Onay Bekleyenler Tablosu (1 Sütun Kaplar) */}
        <div className="xl:col-span-1 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-900">Onay Bekleyenler</h2>
          </div>
          <Suspense fallback={<SkeletonArea height="h-80" />}>
            <PendingQueue />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

// Genel Skeleton Bileşeni
function SkeletonArea({ height }: { height: string }) {
  return (
    <div className={`w-full ${height} bg-slate-100 rounded-2xl flex items-center justify-center animate-pulse`}>
      <Loader2 className="animate-spin text-slate-300" size={32} />
    </div>
  );
}