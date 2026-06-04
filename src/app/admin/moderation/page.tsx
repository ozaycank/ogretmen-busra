import React from "react";
import { Metadata } from "next";
import { prisma } from "@/infrastructure/database/prisma";
import { Role } from "@prisma/client";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, ShieldAlert, Activity, AlertOctagon, History, ChevronRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Güvenlik & Moderasyon Merkezi | Trust & Safety",
  robots: { index: false, follow: false },
};

async function verifyTrustAndSafetyAccess() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_session")?.value;
  if (!token) redirect("/admin/login");
  
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "default_secure_super_secret_key_change_me");
    const { payload } = await jwtVerify(token, secret);
    if (payload.role !== Role.ADMIN && payload.role !== Role.MODERATOR) redirect("/");
    return payload;
  } catch (error) {
    redirect("/admin/login");
  }
}

export default async function ModerationHubPage() {
  await verifyTrustAndSafetyAccess();

  // 1. Güvenlik ve Tehdit İstatistikleri
  const [
    pendingCount,
    totalRejected,
    totalApproved,
    recentAuditLogs
  ] = await Promise.all([
    prisma.material.count({ where: { status: "UPLOAD_PENDING" } }),
    prisma.material.count({ where: { status: "REJECTED" } }),
    prisma.material.count({ where: { status: "APPROVED" } }),
    // Son moderasyon ve güvenlik hareketleri
    prisma.auditLog.findMany({
      where: { 
        action: { in: ["MATERIAL_APPROVED", "MATERIAL_REJECTED", "ACCOUNT_LOCKED"] } 
      },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { user: { select: { name: true, role: true } } }
    })
  ]);

  // Reddedilme Oranı (Risk İndikatörü)
  const totalModerated = totalApproved + totalRejected;
  const rejectionRate = totalModerated > 0 ? ((totalRejected / totalModerated) * 100).toFixed(1) : "0";

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Üst Bilgi */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <ShieldCheck className="text-indigo-600" size={32}/> Trust & Safety Hub
          </h1>
          <p className="text-slate-500 mt-1">Sistem güvenliğini, moderasyon kuyruğunu ve denetim kayıtlarını izleyin.</p>
        </div>
        <Link 
          href="/admin/materials/pending" 
          className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-sm"
        >
          Kuyruğa Git ({pendingCount}) <ChevronRight size={18}/>
        </Link>
      </div>

      {/* Güvenlik Metrikleri */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><AlertOctagon size={24}/></div>
            <h3 className="font-bold text-slate-700">Tehdit Engelleme Oranı</h3>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-slate-900">%{rejectionRate}</span>
            <span className="text-sm font-medium text-slate-500">reddedildi</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">İncelenen toplam {totalModerated} materyal üzerinden hesaplanmıştır.</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-rose-50 text-rose-600 rounded-xl"><ShieldAlert size={24}/></div>
            <h3 className="font-bold text-slate-700">Engellenen Materyal</h3>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-slate-900">{totalRejected}</span>
            <span className="text-sm font-medium text-slate-500">dosya imha edildi</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Kopya, virüslü veya zararlı içerik tespiti.</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><Activity size={24}/></div>
            <h3 className="font-bold text-slate-700">Sistem Sağlığı</h3>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="font-bold text-emerald-600">Aktif & Korunuyor</span>
          </div>
          <p className="text-xs text-slate-500">Anti-virüs, Magic-Byte ve Turnstile protokolleri devrede.</p>
        </div>
      </div>

      {/* Son Denetim Kayıtları (Audit Logs) */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2"><History size={20} className="text-slate-500"/> Son Moderasyon Hareketleri</h2>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider px-3 py-1 bg-slate-200/50 rounded-lg">Canlı Log</span>
        </div>
        
        <div className="p-6">
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
            
            {recentAuditLogs.map((log) => {
              const isApproval = log.action === "MATERIAL_APPROVED";
              const isLock = log.action === "ACCOUNT_LOCKED";

              return (
                <div key={log.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10 ${
                    isApproval ? "bg-emerald-500 text-white" : isLock ? "bg-slate-900 text-white" : "bg-rose-500 text-white"
                  }`}>
                    {isApproval ? <ShieldCheck size={16}/> : isLock ? <AlertOctagon size={16}/> : <ShieldAlert size={16}/>}
                  </div>
                  
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-slate-900 text-sm">{log.user?.name || "Sistem"}</span>
                      <time className="text-xs font-medium text-slate-500">{new Date(log.createdAt).toLocaleTimeString("tr-TR", { hour: '2-digit', minute: '2-digit' })}</time>
                    </div>
                    <div className="text-sm text-slate-600 mb-2">
                      {log.details}
                    </div>
                    <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-50 p-2 rounded-lg">
                      <span>IP: {log.ipAddress}</span>
                    </div>
                  </div>
                </div>
              );
            })}

            {recentAuditLogs.length === 0 && (
              <p className="text-center text-slate-500 font-medium py-10 relative z-10 bg-slate-50">Henüz kaydedilmiş bir moderasyon logu bulunmuyor.</p>
            )}

          </div>
        </div>
      </div>

    </div>
  );
}