import React from "react";
import { prisma } from "@/lib/db/prisma";
import Link from "next/link";
import { Clock, CheckCircle2, XCircle } from "lucide-react";

export default async function PendingQueue() {
  const pendingMaterials = await prisma.material.findMany({
    where: { status: "UPLOAD_PENDING" },
    orderBy: { createdAt: "asc" },
    take: 5, // Sadece en eski 5 kaydı getir
    select: { id: true, title: true, authorName: true, createdAt: true }
  });

  if (pendingMaterials.length === 0) {
    return (
      <div className="text-center py-10 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
        <CheckCircle2 size={32} className="text-emerald-500 mx-auto mb-3" />
        <p className="font-bold text-slate-700">Harika!</p>
        <p className="text-sm text-slate-500">Onay bekleyen materyal yok.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {pendingMaterials.map((item) => (
        <div key={item.id} className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-slate-100 transition-colors">
          <div className="min-w-0 flex-1">
            <p className="font-bold text-slate-900 truncate">{item.title}</p>
            <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
              <span>{item.authorName}</span>
              <span className="flex items-center gap-1"><Clock size={12} /> {new Date(item.createdAt).toLocaleDateString("tr-TR")}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Link 
              href={`/admin/materials/pending/${item.id}`}
              className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap"
            >
              İncele
            </Link>
          </div>
        </div>
      ))}

      <Link href="/admin/materials/pending" className="block text-center text-sm font-bold text-sky-600 hover:text-sky-700 pt-4">
        Tüm Kuyruğu Gör &rarr;
      </Link>
    </div>
  );
}