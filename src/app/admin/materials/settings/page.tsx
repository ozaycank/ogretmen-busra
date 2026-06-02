import React from "react";
import { Metadata } from "next";
import { Role } from "@prisma/client";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { redirect } from "next/navigation";
import { getModerationSettings } from "@/app/admin/materials/settings/actions";
import SettingsPanel from "@/components/features/admin/settings/SettingsPanel";
import { ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Konfigürasyon | Trust & Safety",
  robots: { index: false, follow: false },
};

async function verifySuperAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_session")?.value;
  if (!token) redirect("/admin/login");
  
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "default_secure_super_secret_key_change_me");
    const { payload } = await jwtVerify(token, secret);
    
    // Moderatörler bu sayfaya giremez, sadece sistem mimarları (Admin) girebilir.
    if (payload.role !== Role.ADMIN) redirect("/admin/dashboard");
    return payload;
  } catch (error) {
    redirect("/admin/login");
  }
}

export default async function SettingsPage() {
  await verifySuperAdmin();

  // Veritabanından dinamik ayarları çek (Eğer yoksa varsayılanları getirir)
  const settings = await getModerationSettings();

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Sistem Konfigürasyonu</h1>
          <p className="text-slate-500 mt-1">Platformun moderasyon kurallarını, yükleme limitlerini ve risk algoritmalarını yönetin.</p>
        </div>
        <div className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl font-bold text-sm flex items-center gap-2 border border-emerald-100">
          <ShieldCheck size={18}/> Tam Yetki Doğrulandı
        </div>
      </div>

      <SettingsPanel initialSettings={settings} />

    </div>
  );
}