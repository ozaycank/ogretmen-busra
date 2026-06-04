import React from "react";
import { Metadata } from "next";
import { prisma } from "@/infrastructure/database/prisma";
import { Role } from "@prisma/client";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { redirect } from "next/navigation";
import PendingQueueTable, { EnrichedPendingMaterial } from "@/components/features/admin/moderation/PendingQueueTable";
import { Layers, ShieldCheck, ShieldAlert, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Onay Kuyruğu | Trust & Safety",
  robots: { index: false, follow: false },
};

async function verifyAccess() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_session")?.value;
  if (!token) redirect("/admin/login");
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "default_secure_super_secret_key_change_me");
    const { payload } = await jwtVerify(token, secret);
    if (payload.role !== Role.ADMIN && payload.role !== Role.MODERATOR) redirect("/");
  } catch (error) { redirect("/admin/login"); }
}

const PAGE_SIZE = 20;

export default async function PendingQueuePage({ searchParams }: { searchParams: Promise<{ q?: string; cursor?: string }> }) {
  await verifyAccess();
  const params = await searchParams;
  const q = params.q || "";
  const cursor = params.cursor;

  // 1. Üst Kısım İstatistikleri (Parallel Fetching)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [totalPending, approvedToday, rejectedToday] = await Promise.all([
    prisma.material.count({ where: { status: "UPLOAD_PENDING" } }),
    prisma.auditLog.count({ where: { action: "MATERIAL_APPROVED", createdAt: { gte: today } } }),
    prisma.auditLog.count({ where: { action: "MATERIAL_REJECTED", createdAt: { gte: today } } }),
  ]);

  // 2. Cursor Pagination ile Materyalleri Çek
  const rawMaterials = await prisma.material.findMany({
    where: {
      status: "UPLOAD_PENDING",
      ...(q && {
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { authorName: { contains: q, mode: "insensitive" } },
          { id: { equals: q } }
        ]
      })
    },
    take: PAGE_SIZE + 1, // Cursor tespiti için 1 fazla çekiyoruz
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    orderBy: { createdAt: "asc" } // En çok bekleyen en üstte
  });

  let nextCursor: string | null = null;
  if (rawMaterials.length > PAGE_SIZE) {
    const nextItem = rawMaterials.pop();
    nextCursor = nextItem!.id;
  }

  // 3. N+1 Problemini Çözen Toplu Risk Analizi Algoritması
  // Tüm bu 20 materyalin IP adreslerini tek seferde alıp geçmişteki red durumlarını tek sorguyla çekiyoruz.
  const ipHashes = [...new Set(rawMaterials.map(m => m.ipHash))];
  const badIpsResult = await prisma.material.groupBy({
    by: ["ipHash"],
    where: { ipHash: { in: ipHashes }, status: "REJECTED" },
    _count: true,
  });
  
  // IP'ye göre red sayısını (map) olarak hızlı okuma için ayarla
  const badIpMap = new Map<string, number>();
  badIpsResult.forEach(item => badIpMap.set(item.ipHash, item._count));

  // Veriyi Client için zenginleştir (Enrichment)
  const enrichedMaterials: EnrichedPendingMaterial[] = rawMaterials.map(m => {
    let riskScore = 10;
    if (m.fileType === "zip" || m.fileType === "docx") riskScore += 20;
    
    const rejectCount = badIpMap.get(m.ipHash) || 0;
    if (rejectCount > 0) riskScore += (rejectCount * 25); // Geçmişte ne kadar reddedildiyse risk o kadar artar
    
    let priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" = "LOW";
    if (riskScore >= 70) priority = "CRITICAL";
    else if (riskScore >= 40) priority = "HIGH";
    else if (riskScore >= 20) priority = "MEDIUM";

    return { ...m, riskScore, priority };
  });

  return (
    <div className="space-y-8">
      
      {/* Dashboard Summary Kartları */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Onay Kuyruğu (Moderasyon)</h1>
        <p className="text-slate-500 mt-1">Yüklenen materyalleri inceleyin, güvenliği sağlayın ve yayına alın.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex items-center gap-5">
          <div className="p-4 rounded-2xl bg-indigo-50 text-indigo-600"><Layers size={28} /></div>
          <div><p className="text-sm font-bold text-slate-500">Bekleyen Materyal</p><p className="text-3xl font-black text-slate-900">{totalPending}</p></div>
        </div>
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex items-center gap-5">
          <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-600"><ShieldCheck size={28} /></div>
          <div><p className="text-sm font-bold text-slate-500">Bugün Onaylanan</p><p className="text-3xl font-black text-slate-900">{approvedToday}</p></div>
        </div>
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex items-center gap-5">
          <div className="p-4 rounded-2xl bg-rose-50 text-rose-600"><ShieldAlert size={28} /></div>
          <div><p className="text-sm font-bold text-slate-500">Bugün Reddedilen</p><p className="text-3xl font-black text-slate-900">{rejectedToday}</p></div>
        </div>
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex items-center gap-5">
          <div className="p-4 rounded-2xl bg-amber-50 text-amber-600"><Clock size={28} /></div>
          <div><p className="text-sm font-bold text-slate-500">SLA Hedefi</p><p className="text-3xl font-black text-slate-900">24 Saat</p></div>
        </div>
      </div>

      {/* Ana Kuyruk Tablosu */}
      <PendingQueueTable materials={enrichedMaterials} nextCursor={nextCursor} />

    </div>
  );
}