import React from "react";
import { Metadata } from "next";
import { prisma } from "@/infrastructure/database/prisma";
import PendingQueueTable, { EnrichedPendingMaterial } from "@/modules/moderation/components/PendingQueueTable";
import { Layers, ShieldCheck, ShieldAlert, Clock } from "lucide-react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Onay Kuyruğu | Trust & Safety",
  robots: { index: false, follow: false },
};

async function verifyAccess() {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "MODERATOR")) {
    redirect("/admin/login");
  }
}

const PAGE_SIZE = 20;

export default async function PendingQueuePage({ searchParams }: { searchParams: Promise<{ q?: string; cursor?: string }> }) {
  await verifyAccess();
  const params = await searchParams;
  const q = params.q || "";
  const cursor = params.cursor;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [totalPending, approvedToday, rejectedToday] = await Promise.all([
    prisma.material.count({ where: { status: "UPLOAD_PENDING" } }),
    prisma.auditLog.count({ where: { action: "MATERIAL_APPROVED", createdAt: { gte: today } } }),
    prisma.auditLog.count({ where: { action: "MATERIAL_REJECTED", createdAt: { gte: today } } }),
  ]);

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
    take: PAGE_SIZE + 1, 
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    orderBy: { createdAt: "asc" } 
  });

  let nextCursor: string | null = null;
  if (rawMaterials.length > PAGE_SIZE) {
    const nextItem = rawMaterials.pop();
    nextCursor = nextItem!.id;
  }

  const ipHashes = [...new Set(rawMaterials.map(m => m.ipHash))];
  const badIpsResult = await prisma.material.groupBy({
    by: ["ipHash"],
    where: { ipHash: { in: ipHashes }, status: "REJECTED" },
    _count: true,
  });
  
  const badIpMap = new Map<string, number>();
  badIpsResult.forEach(item => badIpMap.set(item.ipHash, item._count));

  const enrichedMaterials: EnrichedPendingMaterial[] = rawMaterials.map(m => {
    let riskScore = 10;
    if (m.fileType === "zip" || m.fileType === "docx") riskScore += 20;
    
    const rejectCount = badIpMap.get(m.ipHash) || 0;
    if (rejectCount > 0) riskScore += (rejectCount * 25); 
    
    let priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" = "LOW";
    if (riskScore >= 70) priority = "CRITICAL";
    else if (riskScore >= 40) priority = "HIGH";
    else if (riskScore >= 20) priority = "MEDIUM";

    return { ...m, riskScore, priority };
  });

  return (
    <div className="space-y-8">
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

      <PendingQueueTable materials={enrichedMaterials} nextCursor={nextCursor} />
    </div>
  );
}