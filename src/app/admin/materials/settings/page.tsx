import React from "react";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getModerationSettings } from "@/app/admin/materials/settings/actions";
import SettingsPanel from "@/modules/settings/components/SettingsPanel";
import { ShieldCheck } from "lucide-react";
import { auth } from "@/auth";

export const metadata: Metadata = {
  title: "Konfigürasyon | Trust & Safety",
  robots: { index: false, follow: false },
};

async function verifySuperAdmin() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  if (session.user.role !== "ADMIN") redirect("/admin/dashboard");
}

export default async function SettingsPage() {
  await verifySuperAdmin();

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