import React from "react";
import { prisma } from "@/lib/db/prisma";
import { FileText, Download, Eye, AlertCircle } from "lucide-react";

export default async function StatCards() {
  // Optimal Query: 4 farklı sorguyu aynı anda paralel olarak veritabanına gönderir
  const [materialStats, pendingCount, userCount] = await Promise.all([
    prisma.material.aggregate({
      _count: { id: true },
      _sum: { downloadCount: true, viewCount: true },
      where: { status: "APPROVED" }
    }),
    prisma.material.count({
      where: { status: "UPLOAD_PENDING" }
    }),
    prisma.user.count()
  ]);

  const stats = [
    { 
      label: "Onaylı Materyal", 
      value: materialStats._count.id.toLocaleString("tr-TR"), 
      icon: FileText, 
      color: "text-indigo-600", 
      bg: "bg-indigo-50" 
    },
    { 
      label: "Toplam İndirme", 
      value: (materialStats._sum.downloadCount || 0).toLocaleString("tr-TR"), 
      icon: Download, 
      color: "text-emerald-600", 
      bg: "bg-emerald-50" 
    },
    { 
      label: "Toplam Görüntülenme", 
      value: (materialStats._sum.viewCount || 0).toLocaleString("tr-TR"), 
      icon: Eye, 
      color: "text-sky-600", 
      bg: "bg-sky-50" 
    },
    { 
      label: "Onay Bekleyen", 
      value: pendingCount.toLocaleString("tr-TR"), 
      icon: AlertCircle, 
      color: "text-amber-600", 
      bg: "bg-amber-50" 
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, i) => (
        <div key={i} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex items-center gap-5">
          <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color}`}>
            <stat.icon size={28} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500">{stat.label}</p>
            <p className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}