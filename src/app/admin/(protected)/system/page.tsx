import React from "react";
import { Metadata } from "next";
import { prisma } from "@/infrastructure/database/prisma";
import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { Server, Database, Cpu, Activity, CheckCircle2, XCircle, HardDrive, Clock } from "lucide-react";
import { auth } from "@/auth";

export const metadata: Metadata = {
  title: "Sistem Altyapısı ve Sağlık Durumu | Büşra Öğretmen",
  robots: { index: false, follow: false },
};

// SADECE "ADMIN" ROLÜ GİREBİLİR (Moderatörler Giremez)
async function verifySuperAdminAccess() {
  const session = await auth();
  if (session?.user?.role !== Role.ADMIN) {
    redirect("/admin/dashboard"); // Moderatörse dashboard'a geri postala
  }
}

export default async function SystemHealthPage() {
  await verifySuperAdminAccess();

  // 1. Veritabanı Ping Testi (Latency)
  let dbStatus = "OFFLINE";
  let dbLatency = 0;
  try {
    const start = performance.now();
    await prisma.$queryRaw`SELECT 1`;
    dbLatency = Math.round(performance.now() - start);
    dbStatus = "ONLINE";
  } catch (e) {
    dbStatus = "OFFLINE";
  }

  // 2. Redis Bağlantı Kontrolü (Graceful)
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const isRedisConfigured = !!redisUrl && !redisUrl.includes("placeholder");

  // 3. Sunucu Metrikleri (Node.js)
  const memoryUsage = process.memoryUsage();
  const memoryUsedMB = (memoryUsage.heapUsed / 1024 / 1024).toFixed(2);
  const memoryTotalMB = (memoryUsage.heapTotal / 1024 / 1024).toFixed(2);
  const uptimeSeconds = process.uptime();
  const uptimeHours = (uptimeSeconds / 3600).toFixed(1);

  // 4. Çevre Değişkenleri (Maskelenmiş Şekilde Güvenlik Kontrolü)
  const envStatus = [
    { name: "DATABASE_URL", isSet: !!process.env.DATABASE_URL },
    { name: "JWT_SECRET", isSet: !!process.env.JWT_SECRET },
    { name: "R2_ACCESS_KEY_ID", isSet: !!process.env.R2_ACCESS_KEY_ID },
    { name: "TURNSTILE_SECRET_KEY", isSet: !!process.env.TURNSTILE_SECRET_KEY },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Üst Bilgi */}
      <div className="border-b border-slate-200 pb-6">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <Server className="text-sky-600" size={32}/> Sistem Altyapısı
        </h1>
        <p className="text-slate-500 mt-1">
          Sunucu sağlığı, veritabanı gecikme süreleri ve yapılandırma denetimi.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* API / Sunucu Durumu */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><Activity size={24}/></div>
            <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
              <CheckCircle2 size={14}/> Sağlıklı
            </span>
          </div>
          <h3 className="font-bold text-slate-700">Next.js Sunucusu</h3>
          <p className="text-2xl font-black text-slate-900 mt-1">ONLINE</p>
          <p className="text-xs text-slate-500 mt-2">Çalışma Ortamı: {process.env.NODE_ENV}</p>
        </div>

        {/* Veritabanı Durumu */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-xl ${dbStatus === "ONLINE" ? "bg-sky-50 text-sky-600" : "bg-rose-50 text-rose-600"}`}>
              <Database size={24}/>
            </div>
            <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-md ${dbStatus === "ONLINE" ? "text-emerald-600 bg-emerald-50" : "text-rose-600 bg-rose-50"}`}>
              {dbStatus === "ONLINE" ? <CheckCircle2 size={14}/> : <XCircle size={14}/>} {dbStatus}
            </span>
          </div>
          <h3 className="font-bold text-slate-700">PostgreSQL (Prisma)</h3>
          <p className="text-2xl font-black text-slate-900 mt-1">{dbLatency} <span className="text-sm font-medium text-slate-500">ms</span></p>
          <p className="text-xs text-slate-500 mt-2">Sorgu Gecikme Süresi (Latency)</p>
        </div>

        {/* Upstash Redis Durumu */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><HardDrive size={24}/></div>
            <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-md ${isRedisConfigured ? "text-emerald-600 bg-emerald-50" : "text-slate-600 bg-slate-100"}`}>
              {isRedisConfigured ? <CheckCircle2 size={14}/> : "Pasif"}
            </span>
          </div>
          <h3 className="font-bold text-slate-700">Redis (Rate Limit)</h3>
          <p className="text-2xl font-black text-slate-900 mt-1">{isRedisConfigured ? "AKTİF" : "KAPALI"}</p>
          <p className="text-xs text-slate-500 mt-2">API güvenlik duvarı durumu</p>
        </div>

        {/* Dağıtım (Deployment) Durumu */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><Clock size={24}/></div>
            <span className="text-xs font-bold px-2 py-1 rounded-md text-indigo-600 bg-indigo-50">
              Vercel
            </span>
          </div>
          <h3 className="font-bold text-slate-700">Vercel Çevresi</h3>
          <p className="text-xl font-black text-slate-900 mt-1 truncate" title={process.env.VERCEL_URL || "Local"}>
            {process.env.VERCEL_ENV || "Local Development"}
          </p>
          <p className="text-xs text-slate-500 mt-2">Commit: {process.env.VERCEL_GIT_COMMIT_SHA?.substring(0, 7) || "N/A"}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sunucu Telemetrisi (Memory / CPU) */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-6">
            <Cpu size={20} className="text-slate-500"/> Sunucu Telemetrisi
          </h2>
          
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="font-medium text-slate-700">RAM Kullanımı (Heap)</span>
                <span className="font-bold text-slate-900">{memoryUsedMB} MB / {memoryTotalMB} MB</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5">
                <div className="bg-sky-500 h-2.5 rounded-full" style={{ width: `${Math.min((Number(memoryUsedMB) / Number(memoryTotalMB)) * 100, 100)}%` }}></div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div>
                <p className="text-sm font-bold text-slate-900">Uptime (Çalışma Süresi)</p>
                <p className="text-xs text-slate-500">Sunucunun kesintisiz açık kaldığı süre</p>
              </div>
              <p className="text-lg font-black text-indigo-600">{uptimeHours} Saat</p>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div>
                <p className="text-sm font-bold text-slate-900">Node.js Versiyonu</p>
                <p className="text-xs text-slate-500">Çalışma zamanı sürümü</p>
              </div>
              <p className="text-sm font-bold text-slate-700">{process.version}</p>
            </div>
          </div>
        </div>

        {/* Sistem Değişkenleri (Secrets) */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-6">
            <Database size={20} className="text-slate-500"/> Çevre Değişkenleri (ENV)
          </h2>
          <p className="text-sm text-slate-500 mb-4">Sistemin çalışması için gerekli anahtarların yüklenme durumu. (Güvenlik nedeniyle değerler maskelenmiştir).</p>
          
          <div className="space-y-3">
            {envStatus.map((env) => (
              <div key={env.name} className="flex items-center justify-between p-3 border border-slate-100 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                <span className="font-mono text-sm text-slate-700">{env.name}</span>
                {env.isSet ? (
                  <span className="flex items-center gap-1 text-xs font-bold text-emerald-600"><CheckCircle2 size={16}/> Yüklendi</span>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-bold text-rose-600"><XCircle size={16}/> Eksik</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}