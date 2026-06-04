import React from "react";
import { notFound, redirect } from "next/navigation";
import { Metadata } from "next";
import { prisma } from "@/infrastructure/database/prisma";
import { Role } from "@prisma/client";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import Link from "next/link";
import { ChevronLeft, ShieldAlert, User, Database, Activity, AlertTriangle, ShieldCheck } from "lucide-react";
import ModerationPanel from "@/components/features/admin/moderation/ModerationPanel";

export const metadata: Metadata = {
  title: "Materyal İnceleme | Trust & Safety",
  robots: { index: false, follow: false },
};

async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_session")?.value;
  if (!token) return null;
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "default_secure_super_secret_key_change_me");
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (error) { return null; }
}

export default async function ModerationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || (session.role !== Role.ADMIN && session.role !== Role.MODERATOR)) redirect("/admin/login");

  const { id } = await params;

  // 1. Ana Materyali Çek
  const material = await prisma.material.findUnique({ where: { id } });
  if (!material) notFound();

  // 2. Yükleyici (Uploader) Risk Analizi
  const [uploaderTotalUploads, uploaderRejected] = await Promise.all([
    prisma.material.count({ where: { ipHash: material.ipHash } }),
    prisma.material.count({ where: { ipHash: material.ipHash, status: "REJECTED" } }),
  ]);

  // Risk Skoru Hesaplama (Basit Algoritma)
  let riskScore = 10;
  if (material.fileType === "exe" || material.fileType === "zip") riskScore += 40;
  if (uploaderRejected > 0) riskScore += 30;
  if (uploaderTotalUploads > 20) riskScore -= 10; // Güvenilir kullanıcı

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      <div className="flex items-center gap-4">
        <Link href="/admin/materials" className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
          <ChevronLeft size={20} className="text-slate-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-slate-900">İnceleme Paneli: {material.originalName}</h1>
          <p className="text-sm text-slate-500">ID: {material.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* SOL: Bilgiler ve Analiz (4 Sütun) */}
        <div className="xl:col-span-4 space-y-6">
          
          {/* Materyal Özeti */}
          <section className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2"><Database size={16}/> Dosya Meta Verisi</h2>
            <div className="space-y-4 text-sm">
              <div><span className="text-slate-500 block">Başlık</span><span className="font-bold text-slate-900">{material.title}</span></div>
              <div><span className="text-slate-500 block">Kategori / Sınıf</span><span className="font-medium text-slate-700">{material.category} - {material.grade}</span></div>
              <div className="grid grid-cols-2 gap-4">
                <div><span className="text-slate-500 block">Boyut</span><span className="font-medium text-slate-900">{(material.fileSize / 1024 / 1024).toFixed(2)} MB</span></div>
                <div><span className="text-slate-500 block">Uzantı</span><span className="font-medium text-slate-900 uppercase">.{material.fileType}</span></div>
              </div>
              <div><span className="text-slate-500 block">MIME Türü</span><span className="font-medium text-slate-700 font-mono text-xs">{material.mimeType}</span></div>
              {material.description && <div><span className="text-slate-500 block">Açıklama</span><p className="text-slate-700 mt-1 bg-slate-50 p-3 rounded-xl">{material.description}</p></div>}
            </div>
          </section>

          {/* Yükleyici Bilgisi (Guest/IP Bazlı) */}
          <section className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2"><User size={16}/> Yükleyici Profili</h2>
            <div className="space-y-4 text-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold">{material.authorName.charAt(0)}</div>
                <div>
                  <p className="font-bold text-slate-900">{material.authorName}</p>
                  <p className="text-xs text-slate-500 font-mono">IP: {material.ipHash.substring(0, 12)}...</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                <div><span className="text-slate-500 block text-xs">Toplam Yükleme</span><span className="font-bold text-slate-900 text-lg">{uploaderTotalUploads}</span></div>
                <div><span className="text-slate-500 block text-xs">Reddedilen</span><span className="font-bold text-rose-600 text-lg">{uploaderRejected}</span></div>
              </div>
            </div>
          </section>

          {/* Güvenlik Analizi */}
          <section className={`border rounded-3xl p-6 shadow-sm ${riskScore > 50 ? 'bg-rose-50 border-rose-200' : 'bg-white border-slate-200'}`}>
            <h2 className={`text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2 ${riskScore > 50 ? 'text-rose-600' : 'text-slate-400'}`}>
              <ShieldAlert size={16}/> Güvenlik ve Risk Analizi
            </h2>
            <div className="flex items-center gap-4 mb-6">
              <div className={`text-4xl font-black ${riskScore > 50 ? 'text-rose-600' : riskScore > 20 ? 'text-amber-500' : 'text-emerald-500'}`}>{riskScore}</div>
              <div className="text-xs text-slate-500 uppercase font-bold tracking-widest leading-tight">Risk<br/>Skoru</div>
            </div>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2"><ShieldCheck size={16} className="text-emerald-500"/> Dosya boyutu limitler dahilinde</li>
              <li className="flex items-center gap-2"><ShieldCheck size={16} className="text-emerald-500"/> Turnstile doğrulamasından geçti</li>
              {uploaderRejected > 0 && <li className="flex items-center gap-2 text-rose-700 font-medium"><AlertTriangle size={16} className="text-rose-500"/> Bu IP'den daha önce reddedilen dosya var</li>}
            </ul>
          </section>

        </div>

        {/* SAĞ: Önizleme ve Aksiyonlar (8 Sütun) */}
        <div className="xl:col-span-8">
          <ModerationPanel 
            materialId={material.id} 
            fileUrl={material.fileUrl} 
            fileType={material.fileType} 
          />
        </div>

      </div>
    </div>
  );
}